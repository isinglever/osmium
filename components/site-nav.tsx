import cn from 'classnames'
import { stopPropa } from '@/lib/utils'
import Link from 'next/link'
import { useRef } from 'react'
import { useConfig } from '@/contexts/config'
import { useLocale } from '@/contexts/locale'

type NavItem = {
  label: string
  href: string
  icon?: string
}

type Props = BasicProps & {
  items: NavItem[]
}

export default function SiteNav ({ items, className, children }: Props) {
  const config = useConfig()
  const locale = useLocale()

  const root = useRef<HTMLElement>(null)

  function toggleMenu () {
    if (!root.current) return
    if (root.current.dataset.menuOpen) {
      delete root.current.dataset.menuOpen
    } else {
      root.current.dataset.menuOpen = 'true'
    }
  }

  return (
    <nav ref={root} className={cn(className, 'site-nav')}>
      <ul className="site-nav-list">
        {items.map((it, idx) => (
          <li key={idx}>
            <Link href={it.href} target={/^\w+:\/\//.test(it.href) ? '_blank' : undefined}>
              {it.icon && <i className={it.icon}/>}
              <span>{it.label}</span>
            </Link>
          </li>
        ))}
        {config.rss && (
          <li className="site-nav-item-feed">
            <Link href="/-/feed" title={locale.NAV.RSS} target="_blank">
              <i/>
              <span>Feed</span>
            </Link>
          </li>
        )}
      </ul>
      {children}
      <button type="button" className="site-nav-item-more" onClick={stopPropa(toggleMenu)}>
        <i/>
      </button>
    </nav>
  )
}
