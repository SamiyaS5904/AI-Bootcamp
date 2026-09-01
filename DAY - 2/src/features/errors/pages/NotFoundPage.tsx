import { Link } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'

/**
 * 404. Real page, not a scaffold — an unknown URL is a permanent condition, so
 * this one ships as-is.
 */
export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="This page doesn't exist. Browse the collection instead."
        noIndex
      />

      <div className="container-page py-24 md:py-32">
        <div className="max-w-lg">
          <p className="eyebrow text-clay">404</p>
          <h1 className="text-display mt-5">This page doesn&apos;t exist</h1>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed">
            The link may be out of date, or the piece may have sold out and been retired. The
            collection is still here.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={routes.shop}>Browse the shop</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routes.styleAssistant}>Ask the Style Assistant</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
