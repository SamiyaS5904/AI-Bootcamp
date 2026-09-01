import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useSiteSettings } from '@/data/siteSettings'
import { useCart } from '@/features/cart/CartContext'
import { CartLineItem } from '@/features/cart/components/CartLineItem'
import { FreeShippingProgress } from '@/features/cart/components/FreeShippingProgress'
import { cartTotals } from '@/features/cart/lib/pricing'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'

/**
 * Slide-out bag — CLAUDE.md §5.3 requires the cart to be viewable and editable
 * from anywhere on the site, not only its own page.
 *
 * Mounted once in RootLayout; visibility lives in CartContext so any Add to Bag
 * button can open it.
 */
export function CartDrawer() {
  const cart = useCart()
  const settings = useSiteSettings()
  const totals = cartTotals(cart.lines, settings)

  // Escape to close, and lock body scroll while open.
  useEffect(() => {
    if (!cart.isDrawerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cart.closeDrawer()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [cart])

  if (!cart.isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-60" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        className="bg-ink/60 animate-in fade-in absolute inset-0 duration-150"
        onClick={cart.closeDrawer}
        aria-label="Close bag"
        tabIndex={-1}
      />

      <div className="bg-background animate-in slide-in-from-right absolute inset-y-0 right-0 flex w-[min(26rem,100vw)] flex-col shadow-2xl duration-200">
        <div className="border-border flex items-center justify-between border-b px-6 py-5">
          <h2 className="eyebrow">Your bag ({totals.itemCount})</h2>
          <button
            type="button"
            onClick={cart.closeDrawer}
            aria-label="Close bag"
            className="hover:text-clay -mr-2 p-2 transition-colors"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-xl">Your bag is empty</p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Nothing saved here yet. The Style Assistant is the fastest way to find something that
              fits.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild onClick={cart.closeDrawer}>
                <Link to={routes.shop}>Browse the shop</Link>
              </Button>
              <Button asChild variant="outline" onClick={cart.closeDrawer}>
                <Link to={routes.styleAssistant}>Ask the Style Assistant</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-border flex-1 divide-y overflow-y-auto px-6">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} compact />
              ))}
            </ul>

            <div className="border-border space-y-5 border-t px-6 py-6">
              <FreeShippingProgress subtotal={totals.subtotal} />

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd>
                </div>
                <div className="border-border flex justify-between border-t pt-2 text-base">
                  <dt>Total</dt>
                  <dd>{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-2">
                <Button asChild size="lg" onClick={cart.closeDrawer}>
                  <Link to={routes.checkout}>Checkout</Link>
                </Button>
                <Button asChild variant="ghost" onClick={cart.closeDrawer}>
                  <Link to={routes.cart}>View full bag</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
