import { useEffect } from "react";

import { PLACEHOLDERS } from "../data/company.js";
import { useFocusTrap } from "../hooks/index.js";
import { useEnquiry, whatsappUrl } from "../lib/enquiry.jsx";
import { CheckIcon, CloseIcon, PlusIcon, WhatsAppIcon } from "./Icons.jsx";

/**
 * Full specifications without leaving the catalogue — a modal rather than 29
 * separate pages, which keeps the site to two. Opens on click only; nothing on
 * this site ever opens a modal by itself.
 */
export default function QuickView({ product, index, total, onClose, onStep, onEnquire }) {
  const panelRef = useFocusTrap(!!product);
  const { toggle, has } = useEnquiry();

  useEffect(() => {
    if (!product) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose, onStep]);

  if (!product) return null;

  const added = has(product.id);

  // Article number, sizes and material come off our own spec sheets. Fit and
  // minimum order genuinely vary by order, so they stay bracketed rather than
  // being guessed at.
  const spec = [
    product.articleNo && ["Article no.", product.articleNo],
    ["Fabric", product.fabric],
    ["GSM", product.gsm],
    product.material && ["Material", product.material],
    ["Sizes", product.sizes ?? PLACEHOLDERS.sizeSet],
    ["Fit", PLACEHOLDERS.fit],
    ["Colourways", "Colour run as photographed"],
    [
      "Branding options",
      "Embroidery, screen, digital and DTF print, woven labels, hang tags",
    ],
    ["Minimum order", PLACEHOLDERS.moq],
    ["Packing", "Branded poly bag with wash care"],
  ].filter(Boolean);

  return (
    <div
      className="pk-modal"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="pk-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pk-quickview-title"
        ref={panelRef}
      >
        <div className="pk-modal__media">
          <img src={product.img} alt={product.alt} />
        </div>

        <div className="pk-modal__body">
          <div className="pk-modal__head">
            <div>
              <div className="pk-modal__kicker">{product.cat} · ZONIXA</div>
              <h2 id="pk-quickview-title">{product.name}</h2>
            </div>
            <button
              type="button"
              className="pk-modal__close"
              onClick={onClose}
              aria-label="Close quick view"
            >
              <CloseIcon />
            </button>
          </div>

          {product.colours.length >= 3 && (
            <div className="pk-swatches" style={{ marginTop: 20 }}>
              {product.colours.map((c) => (
                <span key={c} className="pk-swatch" style={{ background: c }} />
              ))}
              <span className="pk-swatches__note">sampled from this photo</span>
            </div>
          )}

          <dl className="pk-spec">
            {spec.map(([term, value]) => (
              <div className="pk-spec__row" key={term}>
                <dt>{term}</dt>
                <dd className={value.startsWith("{{") ? "pk-ph" : undefined}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="pk-modal__ctas">
            <button
              type="button"
              className="pk-btn pk-btn--primary"
              onClick={() => onEnquire(product)}
            >
              Enquire about this style
            </button>

            <button
              type="button"
              className="pk-btn pk-btn--ghost"
              aria-pressed={added}
              onClick={() => toggle(product)}
            >
              {added ? <CheckIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
              {added ? "In your enquiry" : "Add to enquiry"}
            </button>

            <a
              className="pk-btn pk-btn--ghost"
              href={whatsappUrl(
                `Hello Panwar Knitwear, I would like a quote for: ${product.name}.`
              )}
              target="_blank"
              rel="noreferrer noopener"
            >
              <WhatsAppIcon width={16} height={16} />
              WhatsApp
            </a>
          </div>

          <p className="pk-modal__note">
            {product.sourceNote
              ? `Note: ${product.sourceNote} Ask us and we will confirm.`
              : "Bracketed values vary by order — ask and we confirm them in writing with your rate."}
          </p>

          <div className="pk-modal__pager">
            <button type="button" onClick={() => onStep(-1)} disabled={index <= 0}>
              ← Previous
            </button>
            <span className="pk-modal__pos">
              {index + 1} / {total}
            </span>
            <button type="button" onClick={() => onStep(1)} disabled={index >= total - 1}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
