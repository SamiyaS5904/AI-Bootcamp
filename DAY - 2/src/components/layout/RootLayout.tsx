import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StyleAssistantFab } from '@/components/layout/StyleAssistantFab'
import { RouteTransition } from '@/components/layout/RouteTransition'
import { RouteProgress } from '@/components/layout/RouteProgress'
import { IntroCurtain } from '@/components/common/IntroCurtain'
import { CartDrawer } from '@/features/cart/components/CartDrawer'

/**
 * The persistent frame every route renders inside — CLAUDE.md §4.
 * The cart drawer is mounted once here so any Add to Bag button can open it
 * from anywhere on the site (§5.3).
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
      {/* First visit only, once per session. Never blocks paint. */}
      <IntroCurtain />
      <RouteProgress />

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
      <StyleAssistantFab />
      <CartDrawer />
    </div>
  )
}
