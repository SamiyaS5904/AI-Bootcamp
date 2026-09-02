import { Link } from 'react-router-dom'
import { Instagram, Mail, MessageCircle, Phone } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { TodoMarker } from '@/components/common/TodoMarker'
import { aboutImage } from '@/data/editorial'
import { useSiteSettings } from '@/data/siteSettings'
import { emailUrl, instagramUrl, siteConfig, telUrl, whatsappUrl } from '@/config/site'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'

/**
 * Contact — CLAUDE.md §5.10 and §5.12.
 *
 * Every channel reads from `siteConfig`, the same source the header and footer
 * use, so the three can never disagree. A channel we don't have renders a
 * {{TODO}} marker and no link (§8).
 *
 * The "before you write" column is deliberate: most questions a menswear
 * customer has are about sizing, delivery or returns, and all three already
 * have real answers elsewhere on the site. Pointing at them is more useful than
 * a bare list of addresses — and it gives the page substance without inventing
 * anything.
 */
export function ContactPage() {
  const settings = useSiteSettings()
  const email = emailUrl()
  const tel = telUrl()
  const whatsapp = whatsappUrl('Hi Saints Crew — I have a question about')
  const instagram = instagramUrl()

  return (
    <>
      <Seo
        title="Contact"
        description="Reach Saints Crew by email, phone, WhatsApp or Instagram — questions about fit, orders and returns."
      />

      <div className="container-page py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-clay">Contact</p>
          <h1 className="text-display mt-4">Talk to us</h1>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed">
            Questions about fit, fabric, an order or a return — a person reads every message. For
            anything size-related, the fit guide will usually get you an answer faster.
          </p>
        </div>

        <div className="mt-16 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-20">
          {/* Channels */}
          <div className="lg:col-span-5">
            <h2 className="eyebrow text-muted-foreground">Reach us</h2>
            <dl className="mt-8 space-y-8">
              <Channel icon={<Mail className="size-4" strokeWidth={1.5} />} label="Email">
                {email ? (
                  <a href={email} className="hover:text-clay transition-colors">
                    {siteConfig.contact.email}
                  </a>
                ) : (
                  <TodoMarker topic="brand email address" />
                )}
              </Channel>

              <Channel icon={<Phone className="size-4" strokeWidth={1.5} />} label="Phone">
                {tel ? (
                  <a href={tel} className="hover:text-clay transition-colors">
                    {siteConfig.contact.phone}
                  </a>
                ) : (
                  <TodoMarker topic="brand phone number" />
                )}
              </Channel>

              <Channel
                icon={<MessageCircle className="size-4" strokeWidth={1.5} />}
                label="WhatsApp"
              >
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-clay transition-colors"
                  >
                    Message us on WhatsApp
                  </a>
                ) : (
                  <TodoMarker topic="WhatsApp business number" />
                )}
              </Channel>

              <Channel icon={<Instagram className="size-4" strokeWidth={1.5} />} label="Instagram">
                {instagram ? (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-clay transition-colors"
                  >
                    @{siteConfig.social.instagramHandle}
                  </a>
                ) : (
                  <TodoMarker topic="Instagram handle" />
                )}
              </Channel>
            </dl>

            <div className="border-border mt-12 border-t pt-8">
              <h2 className="eyebrow text-muted-foreground">Before you write</h2>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                These three come up most, and each already has a full answer:
              </p>

              <ul className="mt-6 space-y-4">
                <Shortcut to={routes.sizeGuide} title="Which size am I?">
                  Our fit guide maps your own measurement onto the size chart and shows the working.
                </Shortcut>
                <Shortcut to={routes.shippingReturns} title="What does delivery cost?">
                  Free over {formatPrice(settings.freeShippingThresholdInr)}, otherwise{' '}
                  {formatPrice(settings.standardShippingFeeInr)} flat, anywhere in India.
                </Shortcut>
                <Shortcut to={routes.shippingReturns} title="Can I send something back?">
                  Yes — within {settings.returnsWindowDays} days of delivery, unworn with tags on.
                </Shortcut>
              </ul>
            </div>
          </div>

          {/* Image */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="bg-bone-sunk aspect-4/5 overflow-hidden">
              <img
                src={aboutImage.url}
                alt={aboutImage.alt}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Channel({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <span className="text-clay mt-0.5 shrink-0" aria-hidden>
        {icon}
      </span>
      <div>
        <dt className="eyebrow text-muted-foreground">{label}</dt>
        <dd className="mt-2 text-base">{children}</dd>
      </div>
    </div>
  )
}

function Shortcut({
  to,
  title,
  children,
}: {
  to: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link to={to} className="group block">
        <span className="group-hover:text-clay text-sm font-medium transition-colors">{title}</span>
        <span className="text-muted-foreground mt-1.5 block text-sm leading-relaxed">
          {children}
        </span>
      </Link>
    </li>
  )
}
