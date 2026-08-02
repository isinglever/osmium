import Link from 'next/link'
import { useState } from 'react'

import css from './styles.module.scss'
import type { PageMeta } from '@/lib/server/page'
import { useLocale } from '@/contexts/locale'
import PostList from '@/components/PostList'
import cn from 'classnames'

export type Props = {
  tags: Record<string, number>
  activeTag?: string
  posts?: PageMeta[]
}

export default function SearchLayout ({ tags, activeTag, posts = [] }: Props) {
  const [searchValue, setSearchValue] = useState('')
  const keyword = searchValue.toLowerCase()

  // TODO: Improve performance
  const results = posts.filter(p => {
    const searchTarget = (p.title + p.summary + p.tags.join(' ')).toLowerCase()
    return searchTarget.includes(keyword)
  })

  const locale = useLocale()
  const placeholder = activeTag
    ? locale.PAGE.SEARCH.INPUT_PLACEHOLDER.SEARCH_IN_TAG.replace('%s', activeTag)
    : locale.PAGE.SEARCH.INPUT_PLACEHOLDER.SEARCH_ARTICLES

  const languageOrder = ['chinese', 'english']
  const tagEntries = Object.entries(tags).sort(([left], [right]) => {
    const leftIndex = languageOrder.indexOf(left.toLowerCase())
    const rightIndex = languageOrder.indexOf(right.toLowerCase())
    const leftRank = leftIndex === -1 ? languageOrder.length : leftIndex
    const rightRank = rightIndex === -1 ? languageOrder.length : rightIndex
    return leftRank - rightRank
  })

  return <>
    <label className={css.search_input}>
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        onChange={ev => setSearchValue(ev.target.value)}
      />
      <span aria-hidden="true"/>
    </label>
    <ul className={css.search_tag_list}>
      {tagEntries.map(([tag, count]) => (
        <li key={tag}>
          <Tag tag={tag} count={count} active={tag === activeTag}/>
        </li>
      ))}
    </ul>
    <PostList posts={results}/>
  </>
}

type TagProps = BasicProps & {
  tag: string
  count?: number
  active?: boolean
}

function Tag ({ tag, count = 0, active = false }: TagProps) {
  const href = active ? '/search' : `/tag/${tag}`
  const className = cn(css.search_tag_link, { [css.active]: active })
  return (
    <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
      <span>{tag}</span>
      {count > 0 && <span className={css.search_tag_count}>{count}</span>}
    </Link>
  )
}
