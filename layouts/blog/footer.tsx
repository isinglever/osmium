import cn from 'classnames'

import SiteFooterText from '@/components/site-footer-text'

type Props = {
  fullWidth?: boolean
}

export default function Footer ({ fullWidth }: Props) {
  return (
    <div className={cn(
      'mt-6 flex-shrink-0 m-auto w-full text-gray-500 dark:text-gray-400 transition-all',
      fullWidth ? 'px-4 md:px-24' : 'max-w-3xl px-4',
    )}>
      <div className="py-4 text-sm leading-6 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row items-center">
          <SiteFooterText/>
        </div>
      </div>
    </div>
  )
}
