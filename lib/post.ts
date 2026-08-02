import type { PageMeta } from '@/lib/server/page'

export const SIGNIFICANT_UPDATE_INTERVAL = 24 * 60 * 60 * 1000

export function hasMeaningfulUpdate (post: PageMeta) {
  return Boolean(
    post.updatedAt &&
    post.date &&
    post.updatedAt - post.date > SIGNIFICANT_UPDATE_INTERVAL,
  )
}

export function getPostLanguage (post: Pick<PageMeta, 'tags'>, fallback: string) {
  const tags = new Set(post.tags.map(tag => tag.toLowerCase()))
  if (tags.has('chinese')) return 'zh-CN'
  if (tags.has('english')) return 'en'
  return fallback
}
