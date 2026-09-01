import { LegalPage, LegalSection } from '@/features/content/components/LegalPage'
import { TodoMarker } from '@/components/common/TodoMarker'
import { useSiteSettings } from '@/data/siteSettings'
import { siteConfig } from '@/config/site'

/**
 * Privacy Policy — CLAUDE.md §5.10.
 *
 * The structure and the factual sections are real: what the store collects and
 * which processors touch it are properties of how this was built, so they can
 * be stated accurately. The parts that depend on the registered business —
 * legal entity, address, grievance officer — carry TODO markers, and the page
 * says plainly that it needs legal review before launch.
 */
export function PrivacyPolicyPage() {
  const settings = useSiteSettings()

  return (
    <LegalPage
      title="Privacy Policy"
      eyebrow="Legal"
      summary="What we collect when you shop with us, why we collect it, and who else handles it."
      needsReview="This policy has not been reviewed by a lawyer. The sections marked below need your registered business details before it can be published."
    >
      <LegalSection title="Who we are">
        <p>
          Saints Crew is an Indian menswear label selling knitwear, shirts and trousers directly
          through this website.
        </p>
        <dl className="mt-5 space-y-3">
          <Row label="Registered entity">
            <TodoMarker topic="registered legal entity name" />
          </Row>
          <Row label="Registered address">
            <TodoMarker topic="registered business address" />
          </Row>
          <Row label="Grievance officer">
            <TodoMarker topic="grievance officer name and contact, required under Indian IT rules" />
          </Row>
          <Row label="Contact">
            <span>{siteConfig.contact.email ?? '—'}</span>
          </Row>
        </dl>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>We only ask for what an order actually needs.</p>
        <ul className="mt-5 space-y-3">
          <Bullet term="Order details">
            Your name, email address, phone number and delivery address. Without these we cannot get
            a parcel to you or tell you where it is.
          </Bullet>
          <Bullet term="Account details">
            If you create an account, your email and a securely hashed password. We never see or
            store your password in readable form.
          </Bullet>
          <Bullet term="Bag and wishlist">
            What you have saved, so it is still there when you come back.
          </Bullet>
          <Bullet term="Style Assistant answers">
            The occasion, fit, size and budget you select. We keep these to understand what people
            are looking for and what we should be making.
          </Bullet>
          <Bullet term="Payment details">
            <strong>We never see your card.</strong> Payment is handled entirely by Razorpay; we
            receive only a confirmation that a payment succeeded and a reference number.
          </Bullet>
        </ul>
      </LegalSection>

      <LegalSection title="Who else handles it">
        <p>
          We use three service providers. Each sees only the data it needs to do its job, and none
          of them may use it for their own marketing.
        </p>
        <ul className="mt-5 space-y-3">
          <Bullet term="Supabase">Hosts our database and accounts.</Bullet>
          <Bullet term="Razorpay">Processes payments. Governed by their own privacy policy.</Bullet>
          <Bullet term="Anthropic">
            Powers the Style Assistant. It receives your answers and our product list — never your
            name, address or payment details.
          </Bullet>
        </ul>
        <p className="mt-5">We do not sell your data. We have never done so and will not.</p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Order records are kept as long as tax and accounting rules require. Account data stays
          until you ask us to delete it. Style Assistant answers are kept without anything that
          identifies you.
        </p>
        <div className="mt-5">
          <TodoMarker topic="exact retention periods, once confirmed with an accountant" />
        </div>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You can ask us for a copy of what we hold about you, ask us to correct it, or ask us to
          delete it. Write to {siteConfig.contact.email ?? 'us'} and we will respond within{' '}
          {settings.returnsWindowDays * 4} days.
        </p>
        <p className="mt-4">
          You can close your account at any time. Doing so removes your profile and saved addresses;
          order records are kept where the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use browser storage to keep you signed in and to remember your bag and wishlist. There
          is no advertising or cross-site tracking on this site.
        </p>
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

function Bullet({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <li className="border-border border-l-2 pl-4">
      <span className="block text-sm font-medium">{term}</span>
      <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">{children}</span>
    </li>
  )
}
