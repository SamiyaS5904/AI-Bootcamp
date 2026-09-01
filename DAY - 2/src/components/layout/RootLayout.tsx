import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RouteTransition } from '@/components/layout/RouteTransition'
import { CartDrawer } from '@/features/cart/components/CartDrawer'

/**
 * The persistent frame every route renders inside — CLAUDE.md §4.
 *
 * Three things were mounted here and have been removed:
 *  - an intro curtain on load. A black panel over the page is theatre, and it
 *    delayed the first thing a visitor came to see.
 *  - a route progress bar. Routes render instantly, so it was animating a load
 *    that never happened.
 *  - a floating "Style Assistant" button. A permanent badge advertising the
 *    assistant made a service look like the brand's identity; the entry points
 *    now sit inside the shopping flow, where the question actually arises.
 *
 * The cart drawer stays: §5.3 wants the bag editable from anywhere.
 */
export function RootLayout() {
  const { pathname } = useLocation()

  // A client-side SPA keeps the old scroll position across navigation, which
  // lands you halfway down a fresh page. Reset it.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-clay text-bone focus:ring-clay sr-only rounded-md px-4 py-2 text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="flex-1">
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  )
}
