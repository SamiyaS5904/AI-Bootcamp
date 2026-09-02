import { SERVICES } from "../data/company.js";
import { useReveal } from "../hooks/index.js";
import { whatsappUrl } from "../lib/enquiry.jsx";

/**
 * The highest-value service, and the one entirely missing from the old site.
 * Anchored by the photographs that already show the branded poly bag, woven
 * labels and hang tags — real evidence, already in hand.
 */
export default function PrivateLabel() {
  const introRef = useReveal();
  const servicesRef = useReveal({ stagger: 100 });
  const ctaRef = useReveal();
  const evidenceRef = useReveal();

  return (
    <section className="pk-private" id="private-label">
      <span className="pk-section-num" aria-hidden="true">
        06
      </span>

      <div className="pk-shell pk-private__grid">
        <div>
          <div ref={introRef}>
            <div className="pk-eyebrow" style={{ color: "var(--amber-light)" }}>
              Private label &amp; OEM
            </div>
            <h2>We manufacture under your brand, start to finish.</h2>
            <p className="pk-private__lede">
              Your labels, your tags, your packaging. Sampling first, bulk after approval. The
              photography on this page is our own private-label work.
            </p>
          </div>

          <div className="pk-private__services" ref={servicesRef}>
            {SERVICES.map(([title, note]) => (
              <div className="pk-service" key={title}>
                <h3>{title}</h3>
                <p>{note}</p>
              </div>
            ))}
          </div>

          <div className="pk-private__ctas" ref={ctaRef}>
            <a className="pk-btn pk-btn--primary" href="#enquiry">
              Start a private-label enquiry
            </a>
            <a
              className="pk-btn pk-btn--ghost"
              href={whatsappUrl(
                "Hello Panwar Knitwear, I want to discuss private label manufacturing."
              )}
              target="_blank"
              rel="noreferrer noopener"
            >
              Discuss on WhatsApp
            </a>
          </div>
        </div>

        <div className="pk-evidence" ref={evidenceRef}>
          <figure className="pk-evidence__main">
            <img
              src="/img/p01.jpg"
              alt="A branded ZONIXA poly bag printed with wash-care symbols, beside a colour run of hoodies"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="pk-evidence__cap">
              Branded poly bag, printed wash care
            </figcaption>
          </figure>

          <figure className="pk-evidence__inset pk-evidence__inset--left">
            <img
              src="/img/p12.jpg"
              alt="An embroidered logo and woven label on a two-thread fleece hood"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="pk-evidence__cap">Embroidered logo</figcaption>
          </figure>

          <figure className="pk-evidence__inset pk-evidence__inset--right">
            <img
              src="/img/p04.jpg"
              alt="A chest and sleeve print with the hang tag still attached"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="pk-evidence__cap">Hang tag &amp; print</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
