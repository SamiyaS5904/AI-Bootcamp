import { Link } from 'react-router-dom'
import { Instagram, MessageCircle } from 'lucide-react'
import { routes } from '@/config/routes'
import { emailUrl, instagramUrl, siteConfig, telUrl, whatsappUrl } from '@/config/site'
import { TodoMarker } from '@/components/common/TodoMarker'
import { NewsletterForm } from '@/features/newsletter/components/NewsletterForm'

/**
 * Persistent site footer — CLAUDE.md §4.
 *
 * Every social and contact value comes from `siteConfig` (§5.12). Where a value
 * is still PENDING, a visible {{TODO}} marker renders instead of a link — no
 * generic instagram.com fallback, which is the exact bug §5.12 calls out.
 */
export function Footer() {
  const instagram = instagramUrl()
  const whatsapp = whatsappUrl()
  const email = emailUrl()
  const tel = telUrl()

  return (
    <footer className="dark bg-ink text-bone mt-auto">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] lg:gap-16">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="font-display text-lg leading-none">{siteConfig.name}</p>
            <p className="text-stone mt-4 text-sm leading-relaxed">{siteConfig.description}</p>

            <div className="mt-6 flex items-center gap-3">
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-clay border-border rounded-sm border p-2.5 transition-colors"
                  aria-label={`Saints Crew on Instagram (@${siteConfig.social.instagramHandle})`}
                >
                  <Instagram className="size-4" strokeWidth={1.5} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Instagram className="text-stone size-4" strokeWidth={1.5} aria-hidden />
                  <TodoMarker topic="Instagram handle" />
                </span>
              )}

              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-clay border-border rounded-sm border p-2.5 transition-colors"
                  aria-label="Message Saints Crew on WhatsApp"
                >
                  <MessageCircle className="size-4" strokeWidth={1.5} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="text-stone size-4" strokeWidth={1.5} aria-hidden />
                  <TodoMarker topic="WhatsApp number" />
                </span>
              )}
            </div>
          </div>

          {/* Shop */}
          <FooterColumn title="Shop">
            <FooterLink to={routes.shop}>All Products</FooterLink>
            <FooterLink to={routes.shopCategory('knitwear')}>Knitwear</FooterLink>
            <FooterLink to={routes.shopCategory('shirts')}>Shirts</FooterLink>
            <FooterLink to={routes.shopCategory('trousers')}>Trousers</FooterLink>
            <FooterLink to={routes.styleAssistant}>Find your fit</FooterLink>
            <FooterLink to={routes.sizeGuide}>Size Guide</FooterLink>
          </FooterColumn>

          {/* Help & policies */}
          <FooterColumn title="Help">
            <FooterLink to={routes.about}>About</FooterLink>
            <FooterLink to={routes.contact}>Contact</FooterLink>
            <FooterLink to={routes.shippingReturns}>Shipping &amp; Returns</FooterLink>
            <FooterLink to={routes.privacyPolicy}>Privacy Policy</FooterLink>
            <FooterLink to={routes.terms}>Terms &amp; Conditions</FooterLink>
          </FooterColumn>

          {/* Newsletter + real contact info */}
          <div>
            <h2 className="eyebrow text-stone">Newsletter</h2>
            <div className="mt-5">
              <NewsletterForm />
            </div>

            <h2 className="eyebrow text-stone mt-10">Contact</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                {email ? (
                  <a href={email} className="hover:text-clay transition-colors">
                    {siteConfig.contact.email}
                  </a>
                ) : (
                  <TodoMarker topic="brand email address" />
                )}
              </li>
              <li>
                {tel ? (
                  <a href={tel} className="hover:text-clay transition-colors">
                    {siteConfig.contact.phone}
                  </a>
                ) : (
                  <TodoMarker topic="brand phone number" />
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border mt-16 flex flex-col gap-2 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-stone text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-stone text-xs">Made in India.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-stone">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="hover:text-clay text-sm transition-colors">
        {children}
      </Link>
    </li>
  )
}
