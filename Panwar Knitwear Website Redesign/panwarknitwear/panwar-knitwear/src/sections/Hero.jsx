import { useEffect, useRef, useState } from "react";

import { ArrowIcon } from "../components/Icons.jsx";
import { useReducedMotion, useReveal, useScroll } from "../hooks/index.js";

const LINES = ["Knitwear manufacturing", "from Ludhiana,", "since 2016."];

/* What comes off the line. Categories only — no claims we cannot stand behind. */
const MAKES = [
  "hoodies",
  "sweatshirts",
  "T-shirts",
  "jackets",
  "track pants",
  "shorts",
];

export default function Hero() {
  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const [cueHidden, setCueHidden] = useState(false);
  const [word, setWord] = useState(0);
  const copyRef = useReveal({ stagger: 110 });
  const reduced = useReducedMotion();

  // The headline lines mask up, then the seam sews itself across.
  useEffect(() => {
    const id = requestAnimationFrame(() => sectionRef.current?.classList.add("is-in"));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setWord((n) => (n + 1) % MAKES.length), 2800);
    return () => window.clearInterval(id);
  }, [reduced]);

  useScroll(() => {
    setCueHidden(window.scrollY > 120);

    // Gentle parallax — images only, and well under the 12% ceiling.
    if (reduced || !photoRef.current) return;
    const drift = Math.min(window.scrollY, window.innerHeight) * 0.08;
    photoRef.current.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`;
  });

  return (
    <section className="pk-hero pk-knit" id="top" ref={sectionRef}>
      <div className="pk-hero__photo" ref={photoRef}>
        <img
          src="/img/p01.jpg"
          alt="A ZONIXA 320 GSM round-neck hoodie laid flat on charcoal, with a six-colour run and branded poly-bag packaging beside it"
          width={982}
          height={1147}
          fetchpriority="high"
        />
      </div>

      <div className="pk-hero__glow" aria-hidden="true" />

      <div className="pk-hero__inner">
        <div className="pk-hero__copy">
          <div ref={copyRef}>
            <div className="pk-hero__eyebrow">
              <span className="pk-eyebrow">
                Knitwear manufacturing · Ludhiana<span className="pk-hero__punjab">, Punjab</span>
              </span>
              <span className="pk-hero__gurmukhi" lang="pa">
                ਲੁਧਿਆਣਾ
              </span>
            </div>

            <h1>
              {LINES.map((line, i) => (
                <span className="pk-hero__line" key={line}>
                  <span style={{ "--line-delay": `${i * 120 + 120}ms` }}>{line}</span>
                </span>
              ))}
            </h1>

            <div className="pk-hero__seam" aria-hidden="true" />

            <p className="pk-hero__now">
              <span>We manufacture</span>
              <span className="pk-cycle">
                <span className="pk-cycle__word" key={word}>
                  {MAKES[word]}
                </span>
              </span>
              <span className="pk-vh">
                — hoodies, sweatshirts, T-shirts, jackets, track pants and shorts.
              </span>
            </p>

            <p className="pk-hero__lede">
              Hoodies, sweatshirts and T-shirts under ZONIXA. Lowers, track pants and shorts under
              MSP Sports. Produced in bulk for wholesalers, retailers, distributors and
              institutional buyers across India.
            </p>

            <div className="pk-hero__ctas">
              <a className="pk-btn pk-btn--primary" href="#enquiry">
                Request a quote
                <ArrowIcon className="pk-btn__arrow" width={16} height={16} />
              </a>
              <a className="pk-btn pk-btn--ghost" href="#products">
                See our products
              </a>
            </div>

            <div className="pk-hero__facts">
              <span>320 GSM heavy knits</span>
              <span>8 knitted fabrics</span>
              <span>29 styles in the catalogue</span>
            </div>
          </div>

          <div className="pk-hero__cue" data-hidden={cueHidden} aria-hidden="true">
            <span />
            SCROLL
          </div>
        </div>
      </div>

      <p className="pk-hero__caption">ZONIXA · 320 GSM round-neck hoodie · 6 colourways shown</p>
    </section>
  );
}
