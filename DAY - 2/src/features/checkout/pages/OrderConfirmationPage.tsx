import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useSiteSettings } from '@/data/siteSettings'
import { useCart } from '@/features/cart/CartContext'
import { cartTotals } from '@/features/cart/lib/pricing'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'
import type { CartLine } from '@/types/models'

/**
 * Order confirmation — CLAUDE.md §5.5.
 *
 * PHASE 1: no order exists, because no payment was taken. This page shows what
 * was in the bag at the moment of "checkout" and states plainly that nothing
 * was ordered. The layout is the real one, so wiring it to a genuine `orders`
 * row later is a data swap rather than a redesign.
 */
export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const cart = useCart()
  const settings = useSiteSettings()

  // Snapshot the bag on mount, then clear it — mirroring what a real order does,
  // and stopping a refresh from showing an empty confirmation.
  const [snapshot, setSnapshot] = useState<CartLine[]>([])

  useEffect(() => {
    setSnapshot(cart.lines)
    cart.clear()
    // Intentionally mount-only: this is a one-time snapshot of the bag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totals = cartTotals(snapshot, settings)

  const deliveryEstimate = () => {
    // 4–7 working days from now, stated as a range rather than a false promise.
    const from = new Date()
    from.setDate(from.getDate() + 4)
    const to = new Date()
    to.setDate(to.getDate() + 7)
    const fmt = (date: Date) => date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    return `${fmt(from)} – ${fmt(to)}`
  }

  return (
    <>
      <Seo title="Order confirmed" noIndex />

      <div className="container-page py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="border-border bg-muted/40 rounded-md border px-5 py-4">
            <p className="eyebrow text-muted-foreground">Preview</p>
            <p className="mt-2.5 text-sm leading-relaxed">
              This is a preview. No payment was taken and no order was placed.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <span className="bg-moss text-bone flex size-8 items-center justify-center rounded-full">
              <Check className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <p className="eyebrow text-muted-foreground">Order reference {orderId ?? 'demo'}</p>
          </div>

          <h1 className="text-display mt-5">Thank you</h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            We have your details. Once payment is live you will get a confirmation email straight
            away, and a dispatch note with tracking when the parcel leaves us.
          </p>

          {snapshot.length > 0 && (
            <div className="border-border mt-12 rounded-md border p-6">
              <h2 className="eyebrow text-muted-foreground">What you chose</h2>

              <ul className="divide-border mt-5 divide-y">
                {snapshot.map((line) => (
                  <li key={line.id} className="flex gap-4 py-4">
                    {line.variant.product.image && (
                      <img
                        src={line.variant.product.image.url}
                        alt={line.variant.product.image.alt_text}
                        className="bg-bone-sunk aspect-4/5 w-14 rounded-sm object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{line.variant.product.name}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {line.variant.size} · {line.variant.color} · Qty {line.qty}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm">
                      {formatPrice(line.variant.product.price * line.qty)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="border-border mt-4 space-y-3 border-t pt-4 text-sm">
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
            </div>
          )}

          <div className="border-border mt-10 rounded-md border p-6">
            <h2 className="eyebrow text-muted-foreground">What happens next</h2>
            <ol className="mt-5 space-y-4 text-sm leading-relaxed">
              <Step n={1} title="We pack it">
                Usually within one working day.
              </Step>
              <Step n={2} title={`Delivery, ${deliveryEstimate()}`}>
                {`{{TODO: copy needed — courier partner name}}`} carries it to your PIN code.
              </Step>
              <Step n={3} title={`${settings.returnsWindowDays} days to change your mind`}>
                If the fit is wrong, a size exchange is the easiest fix.
              </Step>
            </ol>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={routes.shop}>Keep browsing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routes.account}>View your account</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="text-clay eyebrow mt-0.5 shrink-0">{String(n).padStart(2, '0')}</span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-muted-foreground block">{children}</span>
      </span>
    </li>
  )
}
