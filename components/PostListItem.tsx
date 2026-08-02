import Link from 'next/link'

import { useConfig } from '@/contexts/config'
import type { PageMeta } from '@/lib/server/page'
import FormattedDate from '@/components/FormattedDate'
import UserAvatar from '@/components/UserAvatar'
import css from './PostList.module.scss'

type Props = {
  post: PageMeta
}

export default function PostListItem ({ post }: Props) {
  const { hasContent } = post
  switch (hasContent) {
    case false:
      return <ProverbPost post={post}/>
    default:
      return <NormalPost post={post}/>
  }
}

function NormalPost ({ post }: Props) {
  return (
    <Link href={'/' + (post.slug || post.hash)} className={css.post_link}>
      <article className={css.post_item}>
        <div className={css.post_content}>
          <h2 className={css.post_title}>{post.title}</h2>
          {post.summary && <p className={css.post_summary}>{post.summary}</p>}
        </div>
        <div className={css.post_meta}>
          <FormattedDate date={post.date} className={css.post_date}/>
        </div>
      </article>
    </Link>
  )
}

function ProverbPost ({ post }: Props) {
  const { author } = useConfig()

  return (
    <article className={`post-type-proverb ${css.proverb_item}`}>
      <p className="post-author">
        <UserAvatar className="post-author-avatar"/>
        <span>{author}</span>
      </p>
      <p className="post-title">{post.title}</p>
      <p className="post-date">
        <FormattedDate date={post.date}/>
      </p>
    </article>
  )
}
