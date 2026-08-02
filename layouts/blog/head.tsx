import Head from 'next/head'
import { useRouter } from 'next/router'
import { joinURL } from 'ufo'

import type { PageMeta } from '@/lib/server/page'
import { execTemplate } from '@/lib/utils'
import { useConfig } from '@/contexts/config'
import { getPostLanguage, hasMeaningfulUpdate } from '@/lib/post'

type Props = {
  post?: PageMeta
}

export default function LayoutHead ({ post = {} as PageMeta }: Props) {
  const config = useConfig()
  const router = useRouter()

  const title = post.title || config.title
  const routePath = post.slug || post.hash || router.asPath.split(/[?#]/)[0]
  const url = joinURL(config.link, config.path, routePath || '')
  const description = post.summary || config.description
  const isArticle = post.type === 'Post' || post.type === 'Doc'
  const language = post.id ? getPostLanguage(post, config.lang) : config.lang
  const showUpdatedAt = post.id && hasMeaningfulUpdate(post)
  const publishedTime = post.date ? new Date(post.date).toISOString() : undefined
  const modifiedTime = showUpdatedAt ? new Date(post.updatedAt).toISOString() : publishedTime
  const ogImageService = config.ogImageGenerateURL && (
    config.ogImageGenerateURL === 'https://og-image-craigary.vercel.app'
      // Backward compatibility
      // TODO: remove in v2.0
      ? joinURL(config.ogImageGenerateURL, `${encodeURIComponent(title)}.png?theme=dark&md=1&fontSize=125px&images=https%3A%2F%2Fnobelium.vercel.app%2Flogo-for-dark-bg.svg`)
      : execTemplate(config.ogImageGenerateURL, { title: encodeURIComponent(title) })
  )
  const structuredData = isArticle ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: language,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Person',
      name: config.author,
      url: config.socialLink || config.link,
    },
  } : undefined

  return (
    <Head>
      <title>{title}</title>

      <meta name="robots" content="follow, index"/>
      <link rel="canonical" href={url}/>

      {config.seo?.keywords && (
        <meta name="keywords" content={config.seo.keywords.join(',')}/>
      )}
      {config.seo?.googleSiteVerification && (
        <meta name="google-site-verification" content={config.seo.googleSiteVerification}/>
      )}

      <meta property="og:title" content={title}/>
      <meta name="twitter:title" content={title}/>
      {description && <>
        <meta name="description" content={description}/>
        <meta property="og:description" content={description}/>
        <meta name="twitter:description" content={description}/>
      </>}
      <meta property="og:image" content={ogImageService}/>
      <meta name="twitter:image" content={ogImageService}/>
      <meta name="twitter:card" content="summary_large_image"/>
      <meta property="og:url" content={url}/>
      <meta property="og:locale" content={language.replace('-', '_')}/>
      <meta property="og:type" content={isArticle ? 'article' : 'website'}/>
      {isArticle && <>
        <meta property="article:author" content={config.author}/>
        {publishedTime && <meta property="article:published_time" content={publishedTime}/>}
        {modifiedTime && <meta property="article:modified_time" content={modifiedTime}/>}
        {post.tags.map(tag => <meta property="article:tag" content={tag} key={tag}/>)}
      </>}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c'),
          }}
        />
      )}
    </Head>
  )
}
