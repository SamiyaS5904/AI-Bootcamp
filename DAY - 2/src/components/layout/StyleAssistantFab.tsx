import { Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { routes } from '@/config/routes'

/**
 * Persistent Style Assistant entry point — CLAUDE.md §4 and §5.6 both call for
 * this to be reachable from anywhere on the site, not only its own route.
 *
 * Hidden on the Style Assistant route itself, and on checkout, where nothing
 * should compete with completing the order.
 */
export function StyleAssistantFab() {
  const { pathname } = useLocation()

  const hidden =
    pathname.startsWith(routes.styleAssistant) ||
    pathname.startsWith(routes.checkout) ||
    pathname.startsWith('/order-confirmation')

  if (hidden) return null

  return (
    <Link
      to={routes.styleAssistant}
      className="bg-clay text-bone hover:bg-clay-dark eyebrow fixed right-5 bottom-5 z-40 flex items-center gap-2.5 rounded-md px-4 py-3.5 shadow-lg transition-colors md:right-8 md:bottom-8"
    >
      <Sparkles className="size-4" strokeWidth={1.5} aria-hidden />
      <span className="hidden sm:inline">Style Assistant</span>
      <span className="sr-only sm:hidden">Style Assistant</span>
    </Link>
  )
}
