import { siteConfig } from '@/config/site'

/**
 * Per-route document metadata (CLAUDE.md §7 SEO).
 *
 * No helmet library: React 19 hoists <title>, <meta> and <link> rendered
 * anywhere in the tree straight into <head>, and de-duplicates them. That
 * covers what `react-helmet-async` was listed for, without the dependency.
 *
 * Caveat worth knowing: this is client-side rendering, so crawlers that don't
 * execute JavaScript see only index.html. Pre-rendering was considered and
 * DEFERRED on 2026-08-27 (see DECISIONS.md) — the tags below are correct for
 * crawlers that do run JS, and adding `vite-plugin-prerender` later needs no
 * change to this component or to any page.
 */
export function Seo({
  title,
  description,
  /** Set true on pages that should never appear in search results (cart, checkout, account). */
  noIndex = false,
}: {
  title: string
  description?: string
  noIndex?: boolean
}) {
  const fullTitle = `${title} — ${siteConfig.titleSuffix}`
  const desc = description ?? siteConfig.description

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </>
  )
}
