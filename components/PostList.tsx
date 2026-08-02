import type { PageMeta } from '@/lib/server/page'
import PostListItem from '@/components/PostListItem'
import css from './PostList.module.scss'

type Props = {
  posts?: PageMeta[]
}

export default function PostList ({ posts }: Props) {
  return (
    <ul className={`post-list ${css.list}`}>
      {posts?.map(post => (
        <li key={post.id}>
          <PostListItem post={post}/>
        </li>
      ))}
    </ul>
  )
}
