import { LEADERSHIP, LISTINGS, TIMELINE } from "../data/company.js";
import { useReveal } from "../hooks/index.js";

/** Typographic throughout — no fake portraits, no stock. */
export default function About() {
  const introRef = useReveal();
  const timelineRef = useReveal({ stagger: 100 });
  const listingsRef = useReveal();

  return (
    <section className="pk-section pk-section--raised" id="about">
      <span className="pk-section-num" aria-hidden="true">
        08
      </span>

      <div className="pk-shell">
        <div className="pk-about__grid" ref={introRef}>
          <div>
            <div className="pk-eyebrow">About Panwar Knitwear</div>
            <h2 style={{ fontSize: "var(--t-h2)", lineHeight: 1.05, marginTop: 20 }}>
              A family-run knitwear unit in Ludhiana.
            </h2>
            <p>
              Panwar Knitwear was set up in 2016 as a sole proprietorship and registered for GST in
              2017. A team of 26 to 50 people runs knitting, stitching, printing, embroidery and
              packing under two brands, ZONIXA for top wear and MSP Sports for bottom wear.
            </p>
          </div>

          <div>
            <span className="pk-label">LEADERSHIP</span>
            <div className="pk-leaders">
              {LEADERSHIP.map(([name, role]) => (
                <div className="pk-leader" key={name}>
                  <div className="pk-leader__name">{name}</div>
                  <div className="pk-leader__role">{role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ol className="pk-timeline" ref={timelineRef}>
          {TIMELINE.map(([mark, label, key]) => (
            <li className={`pk-timeline__step${key ? " pk-timeline__step--key" : ""}`} key={mark}>
              <div className="pk-timeline__mark">{mark}</div>
              <div className="pk-timeline__label">{label}</div>
            </li>
          ))}
        </ol>

        <div className="pk-listings" ref={listingsRef}>
          <span className="pk-label">LISTED ON</span>
          {LISTINGS.map((listing) => (
            <a
              key={listing.url}
              href={listing.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {listing.name} &#8599;
              <span className="pk-vh"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
