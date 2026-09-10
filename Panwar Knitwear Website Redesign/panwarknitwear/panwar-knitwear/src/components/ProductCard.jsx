import { useEnquiry } from "../lib/enquiry.jsx";
import { CheckIcon, PlusIcon } from "./Icons.jsx";

function Swatches({ colours }) {
  // Only shown where the run reads clearly enough to be worth stating.
  if (!colours || colours.length < 3) return null;
  return (
    <div className="pk-swatches">
      {colours.map((c) => (
        <span key={c} className="pk-swatch" style={{ background: c }} />
      ))}
      <span className="pk-swatches__note">sampled from this photo</span>
    </div>
  );
}

/**
 * One style.
 *
 * The whole photo is the button and it opens the quick view, in both variants.
 * That matters for two reasons: the overlay pill used to be a real button on
 * the home showcase, and because the overlay is hover-revealed a touch user
 * could not see it — so tapping a card silently added a style to the enquiry
 * and jerked the page down to the form. Now the visible affordance and the hit
 * area are the same element, and a buyer sees the spec sheet before enquiring.
 *
 * `catalogue` additionally carries an add-to-enquiry toggle in the card body.
 */
export default function ProductCard({
  product,
  variant = "showcase",
  onQuickView,
  priority,
  ...rest
}) {
  const { toggle, has } = useEnquiry();
  const added = has(product.id);

  const media = (
    <>
      <img
        src={product.img}
        alt={product.alt}
        width={982}
        height={1147}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="pk-card__overlay" aria-hidden="true">
        <Swatches colours={product.colours} />
        <span
          className={`pk-btn pk-btn--sm pk-btn--block pk-card__cta ${
            variant === "showcase" ? "pk-btn--primary" : "pk-btn--ghost"
          }`}
        >
          Quick view
        </span>
      </div>
    </>
  );

  return (
    <article className="pk-card" {...rest}>
      <button
        type="button"
        className="pk-card__media"
        onClick={() => onQuickView?.(product)}
        aria-label={`Quick view: ${product.name}`}
        style={{ border: "none", padding: 0, cursor: "pointer", display: "block", width: "100%" }}
      >
        {media}
      </button>

      <div className="pk-card__body">
        <h3 className="pk-card__name">{product.name}</h3>

        <div className="pk-card__meta">
          <span>{product.fabric}</span>
          <span
            className={`pk-card__gsm${product.gsmConfirmed ? "" : " pk-card__gsm--tbc"}`}
            title={product.gsmConfirmed ? undefined : "Weight still to be confirmed by the mill"}
          >
            {product.gsm}
          </span>
        </div>

        {variant === "catalogue" && (
          <button
            type="button"
            className="pk-card__add"
            data-added={added}
            aria-pressed={added}
            onClick={() => toggle(product)}
          >
            {added ? (
              <>
                <CheckIcon width={14} height={14} style={{ verticalAlign: "-2px" }} /> In your
                enquiry
              </>
            ) : (
              <>
                <PlusIcon width={14} height={14} style={{ verticalAlign: "-2px" }} /> Add to
                enquiry
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
