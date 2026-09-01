import { LegalPage, LegalSection } from '@/features/content/components/LegalPage'
import { TodoMarker } from '@/components/common/TodoMarker'
import { useSiteSettings } from '@/data/siteSettings'
import { formatPrice } from '@/lib/utils'

/**
 * Terms & Conditions — CLAUDE.md §5.10.
 *
 * Same approach as the Privacy Policy: the sections describing how the store
 * actually behaves are written properly, because those are facts about what was
 * built. Anything depending on the registered business or a policy decision
 * carries a TODO marker.
 *
 * Shipping and returns figures come from `useSiteSettings()`, so this page can
 * never quote a different threshold from the cart (§5.3).
 */
export function TermsPage() {
  const settings = useSiteSettings()

  return (
    <LegalPage
      title="Terms & Conditions"
      eyebrow="Legal"
      summary="The terms you agree to when you place an order with Saints Crew."
      needsReview="These terms have not been reviewed by a lawyer. The registered business details, governing law and tax sections need completing before publication."
    >
      <LegalSection title="Who you are contracting with">
        <dl className="space-y-3">
          <Row label="Registered entity">
            <TodoMarker topic="registered legal entity name" />
          </Row>
          <Row label="Registered address">
            <TodoMarker topic="registered business address" />
          </Row>
          <Row label="GSTIN">
            <TodoMarker topic="GST identification number" />
          </Row>
        </dl>
      </LegalSection>

      <LegalSection title="Orders">
        <p>
          Placing an order is an offer to buy. The contract forms when we confirm your order by
          email. If we cannot fulfil it — a piece sells out between your order and our packing it,
          or an address turns out to be undeliverable — we will tell you and refund you in full.
        </p>
        <p>
          You do not need an account to order. Every field we ask for at checkout is one we need to
          deliver the parcel or contact you about it.
        </p>
      </LegalSection>

      <LegalSection title="Prices and payment">
        <p>
          All prices are in Indian Rupees and include applicable taxes. The price you see at
          checkout is the price you pay — there are no fees added at the final step.
        </p>
        <p>
          Payment is taken through Razorpay, which supports UPI, cards and netbanking. We do not
          store your card details at any point.
        </p>
        <p>
          Shipping is free on orders over {formatPrice(settings.freeShippingThresholdInr)}. Below
          that, a flat {formatPrice(settings.standardShippingFeeInr)} applies anywhere in India.
        </p>
        <p>
          We try hard to price accurately. If a piece is listed at an obviously wrong price, we may
          cancel the order and refund you rather than fulfil it.
        </p>
      </LegalSection>

      <LegalSection title="Delivery">
        <p>
          We aim to dispatch within one working day. Delivery estimates shown at checkout are
          estimates, not guarantees — once a parcel is with the courier, its timing is out of our
          hands.
        </p>
        <div>
          <TodoMarker topic="courier partner and delivery timelines by region" />
        </div>
      </LegalSection>

      <LegalSection title="Returns and exchanges">
        <p>
          You may return an unworn piece, with its tags on, within {settings.returnsWindowDays} days
          of delivery. Size exchanges are the most common reason people write to us and we would
          rather you got the right fit than kept the wrong one.
        </p>
        <div className="space-y-3">
          <TodoMarker topic="who pays return postage" />
          <TodoMarker topic="refund method and timeline" />
        </div>
      </LegalSection>

      <LegalSection title="Cancellations">
        <p>
          You can cancel any time before we dispatch — write to us and we will refund you in full.
          After dispatch, treat it as a return.
        </p>
      </LegalSection>

      <LegalSection title="The Style Assistant and Size Finder">
        <p>
          Both tools give guidance, not guarantees. The Size Finder maps your measurement onto our
          size chart and shows its working so you can check it. The Style Assistant suggests pieces
          based on what you tell it. Neither replaces your own judgement, and getting a
          recommendation from either does not change your return rights.
        </p>
      </LegalSection>

      <LegalSection title="Using this site">
        <p>
          The photography, copy and design on this site belong to Saints Crew. You are welcome to
          share links; please do not reproduce our imagery commercially without asking.
        </p>
        <p>
          We may update these terms. The version in force is the one published when you place your
          order.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <div>
          <TodoMarker topic="governing law and jurisdiction, e.g. courts at [city]" />
        </div>
      </LegalSection>
    </LegalPage>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[12rem_1fr] sm:gap-5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}
