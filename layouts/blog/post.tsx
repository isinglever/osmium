import type { ExtendedRecordMap } from 'notion-types'
import cn from 'classnames'
import Link from 'next/link'

import css from './styles.module.scss'
import type { PageMeta } from '@/lib/server/page'
import { useConfig } from '@/contexts/config'
import { useData } from '@/contexts/data'
import { useLocale } from '@/contexts/locale'
import { useTheme } from '@/contexts/theme'
import NotionRenderer from '@/components/NotionRenderer'
import TableOfContents from '@/components/TableOfContents'
import UserAvatar from '@/components/UserAvatar'
import FormattedDate from '@/components/FormattedDate'
import TagItem from '@/components/TagItem'
import Comments from '@/components/comments'
import { getPostLanguage, hasMeaningfulUpdate } from '@/lib/post'

type Props = {
  post: PageMeta
  recordMap: ExtendedRecordMap
}

export default function PostLayout ({ post, recordMap }: Props) {
  const config = useConfig()
  const locale = useLocale()
  const { pageMap } = useData()
  const { scheme } = useTheme()

  const { title, type, date, updatedAt, tags, fullWidth } = post
  const isArticle = type === 'Post' || type === 'Doc'
  const postLanguage = getPostLanguage(post, config.lang)
  const showUpdatedAt = hasMeaningfulUpdate(post)
  const orderedPosts = Object.values(pageMap)
    .filter(page => (
      (page.type === 'Post' || page.type === 'Doc') &&
      page.hasContent
    ))
    .sort((left, right) => right.date - left.date)
  const currentIndex = orderedPosts.findIndex(page => page.id === post.id)
  const newerPost = isArticle && currentIndex > 0
    ? orderedPosts[currentIndex - 1]
    : undefined
  const olderPost = isArticle && currentIndex >= 0
    ? orderedPosts[currentIndex + 1]
    : undefined

  // @ts-ignore
  return <>
    <div className={cn(css.post_layout, fullWidth && css.fullwidth)}>
      <article lang={postLanguage}>
        <h1 className={css.post_title}>{title}</h1>
        {type !== 'Page' && (
          <div className={css.post_info}>
            <div className="flex">
              <a href={config.socialLink || '#'} className="flex">
                <UserAvatar className="rounded-full"/>
                <p className="ml-2 md:block">{config.author}</p>
              </a>
              <span className="hidden sm:block ml-2">/</span>
            </div>
            <div className={css.post_dates}>
              <FormattedDate date={date}/>
              {showUpdatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {locale.POST.UPDATED}&nbsp;
                    <FormattedDate date={updatedAt}/>
                  </span>
                </>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-nowrap max-w-full overflow-x-auto article-tags">
                {tags.map(tag => (
                  <TagItem key={tag} tag={tag}/>
                ))}
              </div>
            )}
          </div>
        )}
        <div className={css.post_content}>
          <NotionRenderer recordMap={recordMap} fullPage={false} darkMode={scheme === 'dark'}/>
        </div>
      </article>
      <aside>
        {/* `65px` is the height of expanded nav */}
        {/* Plus 16px to keep margin */}
        {/* TODO: Remove the magic number */}
        <TableOfContents
          recordMap={recordMap}
          minItems={3}
          collapsible
          className="lg:sticky lg:mr-4 lg:inline-block"
          style={{ top: 65 + 16 + 'px' }}
        />
      </aside>
    </div>
    {isArticle && (
      <PostNavigation newerPost={newerPost} olderPost={olderPost}/>
    )}
    {/* @ts-ignore */}
    <Comments
      post={post}
      className={cn(
        'px-4 font-medium text-gray-500 dark:text-gray-400 my-5',
        fullWidth ? 'md:px-24' : 'mx-auto max-w-2xl',
      )}
    />
  </>
}

function PostNavigation ({ newerPost, olderPost }: {
  newerPost?: PageMeta
  olderPost?: PageMeta
}) {
  const locale = useLocale()
  if (!newerPost && !olderPost) return null

  return (
    <nav className={css.post_navigation} aria-label="Post navigation">
      {newerPost && (
        <Link
          href={'/' + (newerPost.slug || newerPost.hash)}
          rel="prev"
          className={css.post_navigation_newer}
        >
          <span>← {locale.POST.NEWER_POST}</span>
          <strong>{newerPost.title}</strong>
        </Link>
      )}
      {olderPost && (
        <Link
          href={'/' + (olderPost.slug || olderPost.hash)}
          rel="next"
          className={css.post_navigation_older}
        >
          <span>{locale.POST.OLDER_POST} →</span>
          <strong>{olderPost.title}</strong>
        </Link>
      )}
    </nav>
  )
}
