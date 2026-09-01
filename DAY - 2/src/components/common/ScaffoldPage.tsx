import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/common/Seo'

/**
 * Shared shell for a route that exists but has no feature built behind it yet.
 *
 * Per CLAUDE.md §8, a scaffold page must be impossible to mistake for finished
 * work: it says so in plain language, lists what will actually live here, and
 * cites the blueprint section that specifies it. This component is deleted from
 * each route as that route's real feature lands.
 */
export function ScaffoldPage({
  route,
  title,
  summary,
  blueprint,
  willInclude,
  noIndex = false,
}: {
  /** The URL pattern, shown verbatim so the route map is verifiable in the browser. */
  route: string
  title: string
  /** One line: what this page is for. */
  summary: string
  /** The CLAUDE.md section(s) that specify this page. */
  blueprint: string
  /** The concrete things still to be built here. */
  willInclude: string[]
  noIndex?: boolean
}) {
  return (
    <>
      <Seo title={title} description={summary} noIndex={noIndex} />

      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-clay">{route}</p>
          <h1 className="text-display mt-5">{title}</h1>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed">{summary}</p>

          <div className="border-border bg-muted/40 mt-12 rounded-md border p-6">
            <p className="eyebrow text-muted-foreground">Scaffold — not built yet</p>
            <p className="mt-3 text-sm leading-relaxed">
              This route renders so the site map is navigable. No feature logic, catalog data or
              copy exists behind it. Specified in{' '}
              <span className="font-medium">CLAUDE.md {blueprint}</span>.
            </p>

            <ul className="mt-5 space-y-2">
              {willInclude.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                  <ArrowRight
                    className="text-brick mt-1 size-3.5 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/"
            className="text-clay eyebrow mt-10 inline-flex items-center gap-2 hover:underline"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </>
  )
}
