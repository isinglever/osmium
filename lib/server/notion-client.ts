import fs from 'node:fs'
import { resolve } from 'node:path'
import chokidar from 'chokidar'
import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env
const FETCH_MIN_INTERVAL_MS = 400
const FETCH_RETRY_LIMIT = 5
const FETCH_RETRY_BASE_MS = 1000

/**
 * Notion's public API started wrapping record values with permission metadata.
 * Older versions of notion-client expect the record value directly, so unwrap
 * the new shape at the API boundary before notion-client processes it.
 */
class CompatibleNotionAPI extends NotionAPI {
  private fetchQueue: Promise<unknown> = Promise.resolve()
  private nextFetchAt = 0

  async fetch<T> (options: Parameters<NotionAPI['fetch']>[0]): Promise<T> {
    const request = this.fetchQueue.then(async () => {
      const wait = Math.max(0, this.nextFetchAt - Date.now())
      if (wait) await sleep(wait)
      this.nextFetchAt = Date.now() + FETCH_MIN_INTERVAL_MS

      for (let attempt = 0; ; attempt++) {
        try {
          const response = await super.fetch<T>(options)
          normalizeRecordMap(response)
          return response
        } catch (error) {
          if (getStatusCode(error) !== 429 || attempt >= FETCH_RETRY_LIMIT) {
            throw error
          }

          const retryAfter = getRetryAfterMs(error)
          const backoff = FETCH_RETRY_BASE_MS * 2 ** attempt
          await sleep((retryAfter ?? backoff) + Math.random() * 250)
        }
      }
    })

    this.fetchQueue = request.catch(() => undefined)
    return request
  }
}

const client = new CompatibleNotionAPI({ authToken: NOTION_ACCESS_TOKEN })

function normalizeRecordMap (response: unknown) {
  if (!isObject(response) || !isObject(response.recordMap)) return

  for (const table of Object.values(response.recordMap)) {
    if (!isObject(table)) continue

    for (const entry of Object.values(table)) {
      if (!isObject(entry) || !isObject(entry.value)) continue

      const wrapped = entry.value
      if ('role' in wrapped && 'value' in wrapped) {
        entry.value = wrapped.value
      }
    }
  }
}

function isObject (value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getStatusCode (error: unknown): number | undefined {
  if (!isObject(error)) return
  if (typeof error.statusCode === 'number') return error.statusCode
  if (isObject(error.response) && typeof error.response.statusCode === 'number') {
    return error.response.statusCode
  }
}

function getRetryAfterMs (error: unknown): number | undefined {
  if (!isObject(error) || !isObject(error.response) || !isObject(error.response.headers)) return

  const value = error.response.headers['retry-after']
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return

  const seconds = Number(raw)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)

  const date = Date.parse(raw)
  if (Number.isFinite(date)) return Math.max(0, date - Date.now())
}

function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const PROXIED_METHODS = [
  'getPage',
]
const $client = new Proxy(client, {
  get (target: NotionAPI, prop: keyof NotionAPI) {
    // Just to reduce the length of IDE inlay hints
    type KeyofNotionAPI = NotionAPI[keyof NotionAPI]
    const raw: KeyofNotionAPI = target[prop]

    if (process.env.OSMIUM_CACHE !== '1') return raw

    if (!PROXIED_METHODS.includes(prop)) return raw

    const cache = new Cache()
    return new Proxy(raw, {
      async apply (target: any, thisArg: any, argArray: any[]) {
        const entry = cache.entry(prop, argArray)
        const cached = entry.get()
        switch (cached) {
          case undefined: {
            entry.set(Pending)
            console.log(`Calling \`${prop}\` with ${JSON.stringify(argArray)}`)
            const res = await target.apply(thisArg, argArray)
            entry.set({ value: res })
            return res
          }
          case Pending: {
            return new Promise(resolve => {
              const watcher = chokidar.watch(CACHE_FILE, { ignoreInitial: true })
              watcher.on('change', () => {
                const value = entry.get()
                if (value !== Pending) {
                  watcher.close().then(() => resolve(value))
                }
              })
            })
          }
          default:
            return cached
        }
      },
    })
  },
})

export default $client

const CACHE_FILE = resolve(process.cwd(), 'osmium-cache.json')
const Pending = Symbol('pending')
type CacheData = Record<string, typeof Pending | { value: any } | undefined>

class Cache {
  data!: CacheData

  constructor () {
    if (fs.existsSync(CACHE_FILE)) {
      this.read()
    } else {
      this.data = {}
      this.write()
    }
  }

  read () {
    this.data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  }

  write () {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  entry (method: keyof NotionAPI, args: any[]) {
    const key = method + JSON.stringify(args)
    return new CacheEntry(this, key)
  }
}

class CacheEntry {
  constructor (private cache: Cache, private key: string) {}

  get () {
    this.cache.read()
    const raw = this.cache.data[this.key]
    return raw === Pending ? Pending : raw?.value
  }

  set (value: any) {
    this.cache.data[this.key] = value
    this.cache.write()
  }
}
