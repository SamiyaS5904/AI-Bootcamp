import { CATEGORY_CARDS } from "../data/company.js";
import { useReveal } from "../hooks/index.js";

export default function Categories() {
  const headRef = useReveal();
  const gridRef = useReveal({ stagger: 110 });

  return (
    <section className="pk-section" id="categories">
      <span className="pk-section-num" aria-hidden="true">
        01
      </span>

      <div className="pk-shell">
        <div className="pk-head" ref={headRef}>
          <div>
            <div className="pk-eyebrow">What we make</div>
            <h2>Six categories, produced in bulk to your spec.</h2>
          </div>
          <p className="pk-head__aside">
            Every category is cut, stitched and finished in-house. Sizes, fits, GSM and branding are
            set by your order.
          </p>
        </div>

        <div className="pk-cats" ref={gridRef}>
          {CATEGORY_CARDS.map((card) => (
            <article className="pk-cat" key={card.name}>
              {card.img ? (
                <div className="pk-cat__media">
                  <img src={card.img} alt={card.alt} loading="lazy" decoding="async" />
                </div>
              ) : (
                /* No bottom-wear photography exists — mark the slot, never fake it. */
                <div className="pk-slot">
                  <p className="pk-slot__inner">
                    IMAGE SLOT
                    <br />
                    {card.slot}
                  </p>
                </div>
              )}

              <div className="pk-cat__body">
                <div className="pk-cat__top">
                  <h3>{card.name}</h3>
                  <span className={`pk-cat__gsm${card.confirmed ? "" : " pk-cat__gsm--tbc"}`}>
                    {card.gsm}
                  </span>
                </div>
                <p>{card.note}</p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
