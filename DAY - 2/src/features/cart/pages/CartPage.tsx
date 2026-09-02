import { Link } from 'react-router-dom'
import { useSiteSettings } from '@/data/siteSettings'
import { useCart } from '@/features/cart/CartContext'
import { CartLineItem } from '@/features/cart/components/CartLineItem'
import { FreeShippingProgress } from '@/features/cart/components/FreeShippingProgress'
import { cartTotals } from '@/features/cart/lib/pricing'
import { Seo } from '@/components/common/Seo'
import { ProductRail } from '@/features/shop/components/ProductRail'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'

/** Full bag page — CLAUDE.md §5.3. */
export function CartPage() {
  const cart = useCart()
  const settings = useSiteSettings()
  const totals = cartTotals(cart.lines, settings)

  return (
    <>
      <Seo title="Your bag" noIndex />

      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-clay">Bag</p>
        <h1 className="text-display mt-4">
          {totals.itemCount === 0
            ? 'Your bag is empty'
            : `${totals.itemCount} ${totals.itemCount === 1 ? 'piece' : 'pieces'}`}
        </h1>

        {cart.lines.length === 0 ? (
          <>
            <div className="mt-8 max-w-lg">
              <p className="text-muted-foreground text-base leading-relaxed">
                Nothing in here yet. If you are not sure where to start, answer five quick questions
                and we will point you at specific pieces.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to={routes.shop}>Browse the shop</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={routes.styleAssistant}>Find your fit</Link>
                </Button>
              </div>
            </div>

            <ProductRail
              title="Just in"
              subtitle="In stock across most sizes."
              className="mt-16 md:mt-20"
            />
          </>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
            <ul className="divide-border border-border divide-y border-t">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border-border rounded-md border p-6">
                <h2 className="eyebrow text-muted-foreground">Summary</h2>

                <div className="mt-6">
                  <FreeShippingProgress subtotal={totals.subtotal} />
                </div>

                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{formatPrice(totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd>
                  </div>
                  <div className="border-border flex justify-between border-t pt-3 text-base">
                    <dt>Total</dt>
                    <dd>{formatPrice(totals.total)}</dd>
                  </div>
                </dl>

                <Button asChild size="lg" className="mt-8 w-full">
                  <Link to={routes.checkout}>Checkout</Link>
                </Button>

                <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                  Returns accepted within {settings.returnsWindowDays} days of delivery.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
