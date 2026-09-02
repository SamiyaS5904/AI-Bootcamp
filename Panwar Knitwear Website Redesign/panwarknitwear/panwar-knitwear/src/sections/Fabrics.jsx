import { FABRIC_LIBRARY, PLACEHOLDERS } from "../data/company.js";
import { useCountUp, useReveal } from "../hooks/index.js";

const CROPS = [
  ["/img/p06.jpg", "Fleece texture crop from a 320 GSM hood", "30% 30%"],
  ["/img/p22.jpg", "Matty collar knit texture crop", "40% 45%"],
  ["/img/p26.jpg", "Bird-eye cotton texture crop", "50% 40%"],
  ["/img/p16.jpg", "Bonded sweatshirt texture crop", "45% 35%"],
];

function Gsm({ value }) {
  const [count, ref] = useCountUp(Number(value));
  if (!value) {
    return <div className="pk-fabric__gsm pk-fabric__gsm--tbc pk-ph">{PLACEHOLDERS.gsm}</div>;
  }
  return (
    <div className="pk-fabric__gsm">
      <span ref={ref}>{count}</span>
      <small>GSM</small>
    </div>
  );
}

/** A warm off-white break in the dark scroll. Ruled, technical, no stock imagery. */
export default function Fabrics() {
  const headRef = useReveal();
  const gridRef = useReveal({ stagger: 90 });
  const cropsRef = useReveal({ stagger: 110 });

  return (
    <section className="pk-section pk-section--cream" id="fabrics">
      <span className="pk-section-num" aria-hidden="true">
        04
      </span>

      <div className="pk-shell">
        <div className="pk-head" ref={headRef}>
          <div>
            <div className="pk-eyebrow">Our fabrics</div>
            <h2>Eight knitted fabrics we work with.</h2>
          </div>
          <p className="pk-head__aside">
            Fabric is sourced to your spec. Tell us the hand feel and the season, and we will match
            it or send a sample.
          </p>
        </div>

        <div className="pk-fabrics">
          <div className="pk-fabrics__grid" ref={gridRef}>
            {FABRIC_LIBRARY.map((fabric) => (
              <div className="pk-fabric" key={fabric.name}>
                <Gsm value={fabric.gsm} />
                <div>
                  <h3>{fabric.name}</h3>
                  <p>{fabric.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pk-fabrics__foot">
          <p>
            Per-fabric GSM ranges marked{" "}
            <span className="pk-ph">{PLACEHOLDERS.gsm}</span> are pending confirmation from the
            mill.
          </p>
          <a className="pk-link-arrow" href="#enquiry">
            Ask for a fabric sample →
          </a>
        </div>

        <div className="pk-crops" ref={cropsRef}>
          {CROPS.map(([src, alt, position]) => (
            <figure key={src}>
              <img src={src} alt={alt} loading="lazy" decoding="async" style={{ objectPosition: position }} />
            </figure>
          ))}
        </div>
        <p className="pk-crops__note">
          Texture crops taken from our own product photography. No fabric macros exist yet.
        </p>
      </div>
    </section>
  );
}
