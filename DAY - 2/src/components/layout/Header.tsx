import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { categoryNav, routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import { useCart } from '@/features/cart/CartContext'
import { cartItemCount } from '@/features/cart/lib/pricing'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { useHeaderScroll } from '@/hooks/useHeaderScroll'
import { cn } from '@/lib/utils'

/**
 * Persistent site header — CLAUDE.md §4.
 *
 * Sits on the near-black surface (`.dark`) so it reads as part of the brand
 * frame rather than the page. Nav labels use the loosened uppercase tracking
 * from §3.
 *
 * Scroll behaviour: condenses once you leave the top, then slides away going
 * down and returns instantly on the way up — so the bag and nav are always one
 * upward flick away without the bar occupying the screen while reading.
 *
 * Search is the one icon with nothing behind it yet; §4 lists it but §5 never
 * specifies the behaviour.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const shopRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const cart = useCart()
  const wishlist = useWishlist()

  const bagCount = cartItemCount(cart.lines)
  const { condensed, hidden } = useHeaderScroll()

  // Never hide the bar while a menu is open — it would take the menu with it.
  const slideAway = hidden && !mobileOpen && !shopOpen

  // Close both menus on navigation — otherwise the dropdown outlives the click.
  useEffect(() => {
    setMobileOpen(false)
    setShopOpen(false)
  }, [location.pathname])

  // Dismiss the Shop dropdown on outside click or Escape.
  useEffect(() => {
    if (!shopOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!shopRef.current?.contains(event.target as Node)) setShopOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setShopOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [shopOpen])

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        // sticky, not fixed: it keeps its space in the flow, so no page needs
        // extra top padding and nothing slides underneath it.
        'dark text-bone sticky top-0 z-50',
        'transition-[transform,background-color,border-color,height] duration-300 ease-out',
        slideAway ? '-translate-y-full' : 'translate-y-0',
        condensed
          ? 'bg-ink/90 border-border border-b backdrop-blur-md'
          : 'bg-ink border-b border-transparent',
      )}
    >
      {/* Fixed height. A condense-on-scroll height change was tried and
          dropped: the bar's content sets its own floor, so the shrink never
          actually took effect. The border, blur and slide-away below do the
          work instead. */}
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        {/* Mobile: menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="hover:text-clay -ml-2 p-2 transition-colors lg:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>

        {/* Wordmark. Text-only for now — no logo asset exists yet. */}
        <Link
          to={routes.home}
          className="font-display shrink-0 text-lg leading-none tracking-tight md:text-xl"
        >
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-8 lg:flex" aria-label="Main">
          <div ref={shopRef} className="relative">
            <button
              type="button"
              onClick={() => setShopOpen((open) => !open)}
              className={cn(
                'eyebrow tracking-nav hover:text-clay flex items-center gap-1.5 py-2 text-xs transition-colors',
                location.pathname.startsWith(routes.shop) && 'text-clay',
              )}
              aria-expanded={shopOpen}
              aria-haspopup="true"
            >
              Shop
              <ChevronDown
                className={cn('size-3.5 transition-transform', shopOpen && 'rotate-180')}
                strokeWidth={1.5}
              />
            </button>

            {shopOpen && (
              <div className="bg-ink-raised border-border animate-in fade-in slide-in-from-top-1 absolute top-full left-0 min-w-52 rounded-md border p-2 shadow-xl duration-150">
                <NavItem to={routes.shop}>All Products</NavItem>
                <div className="bg-border my-2 h-px" />
                {categoryNav.map((category) => (
                  <NavItem key={category.slug} to={routes.shopCategory(category.slug)}>
                    {category.label}
                  </NavItem>
                ))}
              </div>
            )}
          </div>

          <TopNavLink to={routes.styleAssistant}>Style Assistant</TopNavLink>
          <TopNavLink to={routes.about}>About</TopNavLink>
        </nav>

        {/* Icon actions */}
        <div className="flex items-center gap-0.5 md:gap-1">
          {/* TODO: opens the search overlay — not built (no route in §4; search is UI-only). */}
          <button
            type="button"
            className="hover:text-clay p-2.5 transition-colors"
            aria-label="Search"
          >
            <Search className="size-5" strokeWidth={1.5} />
          </button>

          <IconLink to={routes.wishlist} label="Wishlist" badge={wishlist.count}>
            <Heart className="size-5" strokeWidth={1.5} />
          </IconLink>

          <IconLink to={routes.account} label="Account">
            <User className="size-5" strokeWidth={1.5} />
          </IconLink>

          {/* Opens the drawer rather than navigating — §5.3 wants the bag
              editable from anywhere without leaving the page. */}
          <button
            type="button"
            onClick={cart.openDrawer}
            className="hover:text-clay relative p-2.5 transition-colors"
            aria-label={bagCount > 0 ? `Bag, ${bagCount} items` : 'Bag'}
          >
            <ShoppingBag className="size-5" strokeWidth={1.5} />
            {bagCount > 0 && <CountBadge count={bagCount} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="bg-ink/70 animate-in fade-in absolute inset-0 duration-150"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div className="bg-ink animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col duration-200">
            <div className="flex h-16 items-center justify-between px-5">
              <span className="eyebrow text-stone">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="hover:text-clay -mr-2 p-2 transition-colors"
                aria-label="Close menu"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 overflow-y-auto px-3 pb-8" aria-label="Mobile">
              <MobileLink to={routes.shop}>All Products</MobileLink>
              {categoryNav.map((category) => (
                <MobileLink key={category.slug} to={routes.shopCategory(category.slug)} indented>
                  {category.label}
                </MobileLink>
              ))}
              <div className="bg-border mx-3 my-3 h-px" />
              <MobileLink to={routes.styleAssistant}>Style Assistant</MobileLink>
              <MobileLink to={routes.sizeGuide}>Size Guide</MobileLink>
              <MobileLink to={routes.about}>About</MobileLink>
              <MobileLink to={routes.contact}>Contact</MobileLink>
              <div className="bg-border mx-3 my-3 h-px" />
              <MobileLink to={routes.account}>Account</MobileLink>
              <MobileLink to={routes.wishlist}>Wishlist</MobileLink>
              <MobileLink to={routes.cart}>Bag</MobileLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

function TopNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} className="group relative py-2">
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'eyebrow tracking-nav group-hover:text-clay text-xs transition-colors',
              isActive && 'text-clay',
            )}
          >
            {children}
          </span>
          {/* Underline wipes in from the left on hover, and stays put for the
              active route. */}
          <span
            className={cn(
              'bg-clay absolute -bottom-0.5 left-0 h-px w-full origin-left transition-transform duration-300 ease-out',
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
            )}
            aria-hidden
          />
        </>
      )}
    </NavLink>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'hover:bg-bone/5 block rounded-sm px-3 py-2 text-sm transition-colors',
          isActive && 'text-clay',
        )
      }
    >
      {children}
    </NavLink>
  )
}

function IconLink({
  to,
  label,
  badge = 0,
  children,
}: {
  to: string
  label: string
  badge?: number
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className="hover:text-clay relative p-2.5 transition-colors"
      aria-label={badge > 0 ? `${label}, ${badge} items` : label}
    >
      {children}
      {badge > 0 && <CountBadge count={badge} />}
    </Link>
  )
}

/** Small clay count bubble on the bag and wishlist icons. */
function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="bg-clay text-bone absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] leading-4 font-medium"
      aria-hidden
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}

function MobileLink({
  to,
  children,
  indented = false,
}: {
  to: string
  children: React.ReactNode
  indented?: boolean
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'hover:bg-bone/5 rounded-sm px-3 py-3 text-base transition-colors',
          indented && 'text-stone pl-7 text-sm',
          isActive && 'text-clay',
        )
      }
    >
      {children}
    </NavLink>
  )
}
