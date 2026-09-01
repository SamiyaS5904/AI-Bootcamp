import { Instagram, Mail, MessageCircle, Phone } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { TodoMarker } from '@/components/common/TodoMarker'
import { emailUrl, instagramUrl, siteConfig, telUrl, whatsappUrl } from '@/config/site'

/**
 * Contact page — CLAUDE.md §5.10 and §5.12.
 *
 * Every channel here reads from `siteConfig`, the same source the header and
 * footer use, so the three can never disagree. Nothing is invented: a channel
 * we don't have yet renders a {{TODO}} marker and no link, per §8. The previous
 * site's failure was fake contact details, and a visible placeholder is
 * strictly better than a phone number nobody answers.
 */
export function ContactPage() {
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

      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-clay">Contact</p>
          <h1 className="text-display mt-5">Talk to us</h1>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed">
            Questions about fit, fabric, an order or a return — a person reads every message. For
            anything size-related, the Style Assistant will usually get you an answer faster.
          </p>

          <dl className="mt-14 space-y-8">
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

            <Channel icon={<MessageCircle className="size-4" strokeWidth={1.5} />} label="WhatsApp">
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
