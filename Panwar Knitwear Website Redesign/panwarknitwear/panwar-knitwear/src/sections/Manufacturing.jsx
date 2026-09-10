import { useRef } from "react";

import { PROCESS } from "../data/company.js";
import { useMediaQuery, useReducedMotion, useReveal, useScrollProgress } from "../hooks/index.js";

/**
 * Capacity, minimum order and lead time are the three questions every bulk
 * buyer asks first, and all three genuinely move with the order — fabric,
 * colour count, branding and season. Rather than print three empty figures,
 * this block says what each one depends on and asks for the brief.
 */
const CAPACITY = [
  ["MONTHLY CAPACITY", "Quoted per order", "Depends on the fabric and the season."],
  ["MINIMUM ORDER", "Per style, per colour", "Fewer colourways means a lower minimum."],
  ["LEAD TIME", "Agreed up front", "Fixed with your dispatch date before we start."],
];

/**
 * The production line.
 *
 * A running-stitch thread draws itself forward through the nine steps as the
 * visitor scrolls, and each step lights as the thread reaches it. Completed
 * steps stay lit, so at any moment you can see where you are in the line.
 *
 * With reduced motion, the section un-pins and renders its finished state:
 * every step lit, the whole seam sewn.
 */
export default function Manufacturing() {
  const wrapRef = useRef(null);
  const headRef = useReveal();
  const reduced = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 760px)");

  const scrolled = useScrollProgress(wrapRef);
  const progress = reduced ? 1 : scrolled;

  const activeIndex = Math.min(
    PROCESS.length - 1,
    Math.floor(progress * PROCESS.length + 0.0001)
  );

  const state = (i) => {
    if (reduced) return "done";
    if (i === activeIndex) return "active";
    return i < activeIndex ? "done" : "todo";
  };

  const seam = reduced
    ? { [isMobile ? "height" : "width"]: "100%" }
    : { [isMobile ? "height" : "width"]: `${(progress * 100).toFixed(2)}%` };

  return (
    <section className="pk-mfg pk-knit" id="manufacturing">
      <div
        className="pk-mfg__wrap"
        ref={wrapRef}
        style={reduced ? { height: "auto" } : undefined}
      >
        <div
          className="pk-mfg__stage"
          style={reduced ? { position: "static", height: "auto", padding: "var(--section-y) 0" } : undefined}
        >
          <div className="pk-mfg__inner">
            <span className="pk-section-num" aria-hidden="true" style={{ top: -10 }}>
              05
            </span>

            <div className="pk-head" ref={headRef}>
              <div>
                <div className="pk-eyebrow">How we manufacture</div>
                <h2>Nine steps, from yarn to dispatch.</h2>
              </div>
              <p className="pk-head__aside">
                Every step runs under our own supervision in Ludhiana. Scroll to follow the line:
                the thread stitches forward as each stage completes.
              </p>
            </div>

            <div className="pk-thread">
              <div className="pk-thread__track" aria-hidden="true" />
              <div className="pk-thread__line" aria-hidden="true" style={seam} />

              <ol className="pk-thread__steps">
                {PROCESS.map(([label, desc], i) => (
                  <li className="pk-step" key={label} data-state={state(i)}>
                    <div className="pk-step__num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="pk-step__label">{label}</div>
                    <p className="pk-step__desc">{desc}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pk-capacity">
              {CAPACITY.map(([label, value, note]) => (
                <div className="pk-capacity__card" key={label}>
                  <span className="pk-label">{label}</span>
                  <div className="pk-capacity__val">{value}</div>
                  <p className="pk-capacity__note">{note}</p>
                </div>
              ))}
            </div>

            <a className="pk-btn pk-btn--primary pk-capacity__cta" href="#enquiry">
              Send your spec and we will confirm all three in writing
            </a>

            <div className="pk-mfg__foot">
              <span>
                No factory photography exists yet. This section stays diagrammatic until real shots
                of the knitting, stitching and packing floors are supplied.
              </span>
              <span className="pk-mfg__readout" aria-live="off">
                STEP {String(activeIndex + 1).padStart(2, "0")} / {String(PROCESS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
