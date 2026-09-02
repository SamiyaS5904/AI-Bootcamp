import { useReveal } from "../hooks/index.js";

const MSP_RANGE = ["Lowers", "Track pants", "Shorts", "Nikkar", "Capri", "Custom fits"];

/** Both brands visible at once — never tabs. That was the old site's mistake. */
export default function Brands() {
  const headRef = useReveal();
  const gridRef = useReveal({ stagger: 120 });

  return (
    <section className="pk-section" id="brands" style={{ paddingBottom: 0 }}>
      <span className="pk-section-num" aria-hidden="true">
        02
      </span>

      <div className="pk-shell">
        <div ref={headRef}>
          <div className="pk-eyebrow">Our two brands</div>
          <h2 style={{ fontSize: "var(--t-h2)", lineHeight: 1.05, marginTop: 20 }}>
            Top wear and bottom wear, under one roof.
          </h2>
        </div>

        <div className="pk-brands" ref={gridRef} style={{ marginBottom: "var(--section-y)" }}>
          <article className="pk-brand pk-brand--zonixa">
            <img
              className="pk-brand__bg"
              src="/img/p03.jpg"
              alt="ZONIXA 320 GSM hoodie with a chest print, shown with its colour run"
              loading="lazy"
              decoding="async"
            />
            <div className="pk-brand__scrim" />
            <h3 className="pk-brand__name">ZONIXA</h3>
            <div className="pk-brand__kind">TOP WEAR</div>
            <p>
              T-shirts, sweatshirts and hoodies, including our 320 GSM heavy fleece line, packed in
              branded ZONIXA poly bags.
            </p>
            <a
              className="pk-brand__link"
              href="https://zonixa.com"
              target="_blank"
              rel="noreferrer noopener"
              style={{ marginTop: 22 }}
            >
              zonixa.com →
            </a>
          </article>

          <article className="pk-brand pk-brand--msp">
            <h3 className="pk-brand__name">MSP SPORTS</h3>
            <div className="pk-brand__kind">BOTTOM WEAR</div>
            <p>
              Lowers, track pants, shorts, nikkar and capri for men and boys, in cotton, cotton
              lycra and dry fit.
            </p>

            <div className="pk-brand__range">
              {MSP_RANGE.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="pk-brand__foot">
              {/* Zero MSP Sports photography exists. The slot stays marked. */}
              <p className="pk-brand__slot">
                IMAGE SLOT — no MSP Sports photography exists yet. Flat lays of lowers, track pants
                and shorts on the same charcoal ground will drop in here.
              </p>
              <a
                className="pk-brand__link"
                href="https://mspsports.in"
                target="_blank"
                rel="noreferrer noopener"
              >
                mspsports.in →
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
