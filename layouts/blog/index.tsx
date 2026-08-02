import type { PageMeta } from '@/lib/server/page'
import { useConfig } from '@/contexts/config'
import PostList from '@/components/PostList'
import Pagination from '@/components/pagination'
import css from './styles.module.scss'

type Props = {
  posts: PageMeta[]
  total: number
}

export default function IndexLayout ({ posts, total }: Props) {
  const config = useConfig()

  const showNext = total > config.postsPerPage

  return <>
    {config.description && (
      <p className={css.home_intro}>{config.description}</p>
    )}
    <PostList posts={posts}/>
    {showNext && <Pagination page={1} showNext={showNext}/>}
  </>
}
