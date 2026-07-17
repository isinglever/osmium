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
  const isChinese = String(config.lang || '').toLowerCase().startsWith('zh')
  const description = typeof config.description === 'string' ? config.description : null
  const postCount = isChinese
    ? `${total} 篇文章`
    : `${total} ${total === 1 ? 'post' : 'posts'}`

  return <>
    <header className={css.index_intro}>
      <div className={css.index_meta_row}>
        <p className={css.index_eyebrow}>
          {isChinese ? '文章归档' : 'The archive'}
        </p>
        <span>{postCount}</span>
      </div>
      {description && <p className={css.index_description}>{description}</p>}
    </header>
    <PostList posts={posts}/>
    {showNext && <Pagination page={1} showNext={showNext}/>}
  </>
}
