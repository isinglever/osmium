import Link from 'next/link'
import cn from 'classnames'

import { useConfig } from '@/contexts/config'
import { useLocale } from '@/contexts/locale'

type Props = {
  page: string | number
  showNext?: boolean
}

export default function Pagination ({ page, showNext }: Props) {
  const config = useConfig()
  const locale = useLocale()

  const currentPage = +page

  let additionalClassName: string
  switch (true) {
    case currentPage === 1 && showNext:
      additionalClassName = 'justify-end'
      break
    case currentPage !== 1 && !showNext:
      additionalClassName = 'justify-start'
      break
    default:
      additionalClassName = 'justify-between'
  }

  return (
    <div className={cn('flex mt-5 font-medium text-black dark:text-gray-100', additionalClassName)}>
      {currentPage !== 1 && (
        <Link
          href={`/page/${currentPage - 1}`}
          rel="prev"
          className="block rounded-full border border-neutral-300 px-4 py-2 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          ← {locale.PAGINATION.NEWER}
        </Link>
      )}
      {showNext && (
        <Link
          href={`/page/${currentPage + 1}`}
          rel="next"
          className="block rounded-full border border-neutral-300 px-4 py-2 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {locale.PAGINATION.OLDER} →
        </Link>
      )}
    </div>
  )
}
