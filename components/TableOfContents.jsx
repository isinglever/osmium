import PropTypes from 'prop-types'
import { getPageTableOfContents } from 'notion-utils'
import cn from 'classnames'
import { useLocale } from '@/contexts/locale'

export default function TableOfContents ({ recordMap, className, style, minItems = 1, collapsible = false }) {
  const collectionId = Object.keys(recordMap.collection)[0]
  const page = Object.values(recordMap.block).find(block => block.value.parent_id === collectionId).value
  const nodes = getPageTableOfContents(page, recordMap)
  const locale = useLocale()

  if (nodes.length < minItems) return null

  /**
   * @param {string} id - The ID of target heading block (could be in UUID format)
   */
  function scrollTo (id) {
    id = id.replaceAll('-', '')
    const target = document.querySelector(`.notion-block-${id}`)
    if (!target) return
    // `65` is the height of expanded nav
    // TODO: Remove the magic number
    const top = document.documentElement.scrollTop + target.getBoundingClientRect().top - 65
    document.documentElement.scrollTo({
      top,
      behavior: 'smooth',
    })
  }

  const items = nodes.map(node => (
    <div key={node.id}>
      <a
        data-target-id={node.id}
        className="block py-1 hover:text-black dark:hover:text-white cursor-pointer transition duration-100"
        style={{ paddingLeft: (node.indentLevel * 24) + 'px' }}
        onClick={() => scrollTo(node.id)}
      >
        {node.text}
      </a>
    </div>
  ))

  if (collapsible) {
    return (
      <nav
        aria-label={locale.POST.TABLE_OF_CONTENTS}
        className={cn(className, 'text-sm text-zinc-700/70 dark:text-neutral-400')}
        style={style}
      >
        <details className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700 lg:hidden">
          <summary className="cursor-pointer select-none font-medium text-neutral-700 dark:text-neutral-300">
            {locale.POST.TABLE_OF_CONTENTS}
          </summary>
          <div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-700">
            {items}
          </div>
        </details>
        <div className="hidden rounded bg-day/80 px-2 backdrop-blur-lg dark:bg-night/80 lg:block">
          <p className="mb-1 font-medium text-neutral-600 dark:text-neutral-300">
            {locale.POST.TABLE_OF_CONTENTS}
          </p>
          {items}
        </div>
      </nav>
    )
  }

  return (
    <nav
      aria-label={locale.POST.TABLE_OF_CONTENTS}
      className={cn(className, 'lg:px-2 text-sm text-zinc-700/70 dark:text-neutral-400 bg-day/80 dark:bg-night/80 rounded backdrop-blur-lg')}
      style={style}
    >
      {items}
    </nav>
  )
}

TableOfContents.propTypes = {
  recordMap: PropTypes.object.isRequired,
  minItems: PropTypes.number,
  collapsible: PropTypes.bool,
}
