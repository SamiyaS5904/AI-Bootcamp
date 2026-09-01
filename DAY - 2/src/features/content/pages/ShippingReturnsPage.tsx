import { useSiteSettings } from '@/data/siteSettings'
import { Seo } from '@/components/common/Seo'
import { TodoMarker } from '@/components/common/TodoMarker'
import { formatPrice } from '@/lib/utils'

/**
 * Shipping & Returns — CLAUDE.md §5.10.
 *
 * The numbers here come from `useSiteSettings()`, the same source the cart and
 * checkout read, so this page can never contradict the bag (§5.3). Everything
 * that needs real brand policy — courier, who pays return postage, exchange
 * terms — stays a visible {{TODO}} rather than invented policy (§8).
 */
export function ShippingReturnsPage() {
  const settings = useSiteSettings()

  return (
    <>
      <Seo
        title="Shipping & Returns"
        description="What delivery costs, how long it takes, and how to send something back."
      />

      <div className="container-page py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-clay">Help</p>
          <h1 className="text-display mt-4">Shipping &amp; Returns</h1>

          <section className="mt-14">
            <h2 className="eyebrow text-muted-foreground">Shipping</h2>
            <dl className="mt-5 space-y-5 text-sm">
              <Row label="Free shipping over">{formatPrice(settings.freeShippingThresholdInr)}</Row>
              <Row label="Below that">
                {formatPrice(settings.standardShippingFeeInr)} flat, anywhere in India
              </Row>
              <Row label="Dispatch">Usually within one working day</Row>
              <Row label="Courier">
                <TodoMarker topic="courier partner name" />
              </Row>
              <Row label="Delivery time">
                <TodoMarker topic="delivery timelines by region" />
              </Row>
            </dl>
          </section>

          <section className="mt-14">
            <h2 className="eyebrow text-muted-foreground">Returns</h2>
            <dl className="mt-5 space-y-5 text-sm">
              <Row label="Window">{settings.returnsWindowDays} days from delivery</Row>
              <Row label="Return postage">
                <TodoMarker topic="who pays return shipping" />
              </Row>
              <Row label="Size exchanges">
                <TodoMarker topic="exchange policy, especially size exchanges" />
              </Row>
              <Row label="How to start one">
                <TodoMarker topic="returns process — email, form, or WhatsApp" />
              </Row>
            </dl>
          </section>

          <div className="border-border bg-muted/40 mt-14 rounded-md border px-5 py-4">
            <p className="eyebrow text-muted-foreground">Policy not final</p>
            <p className="mt-2.5 text-sm leading-relaxed">
              The shipping fee, threshold and returns window above are live values, editable in one
              place. Everything marked TODO needs a real policy decision before launch — none of it
              has been invented here.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="leading-relaxed">{children}</dd>
    </div>
  )
}
