import { Link } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { routes } from '@/config/routes'

/**
 * Shared shell for the policy pages — CLAUDE.md §5.10.
 *
 * Long-form legal text needs a narrower measure than the rest of the site and a
 * consistent section rhythm, which is why Privacy and Terms share this rather
 * than each inventing their own layout.
 */
export function LegalPage({
  title,
  eyebrow,
  summary,
  needsReview,
  children,
}: {
  title: string
  eyebrow: string
  summary: string
  /** Shown as a standing note. Omit once the page has been through legal. */
  needsReview?: string
  children: React.ReactNode
}) {
  return (
    <>
      <Seo title={title} description={summary} />

      <div className="container-page py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-clay">{eyebrow}</p>
          <h1 className="text-display mt-4">{title}</h1>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed">{summary}</p>

          {needsReview && (
            <div className="border-border bg-muted/40 mt-8 rounded-md border px-5 py-4">
              <p className="eyebrow text-muted-foreground">Draft — pending legal review</p>
              <p className="mt-2.5 text-sm leading-relaxed">{needsReview}</p>
            </div>
          )}

          <div className="mt-14 space-y-14">{children}</div>

          <div className="border-border mt-16 border-t pt-8">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Questions about any of this?{' '}
              <Link to={routes.contact} className="text-clay hover:underline">
                Get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed">{children}</div>
    </section>
  )
}
