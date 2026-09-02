import { REASONS } from "../data/company.js";
import { useReveal } from "../hooks/index.js";

const MARK_CLASS = {
  square: "",
  ring: "pk-why__mark--ring",
  diamond: "pk-why__mark--diamond",
  "ring-circle": "pk-why__mark--ring pk-why__mark--circle",
  circle: "pk-why__mark--circle",
  "ring-diamond": "pk-why__mark--ring pk-why__mark--diamond",
};

export default function WhyUs() {
  const headRef = useReveal();
  const gridRef = useReveal({ stagger: 100 });

  return (
    <section className="pk-section">
      <span className="pk-section-num" aria-hidden="true">
        07
      </span>

      <div className="pk-shell">
        <div ref={headRef}>
          <div className="pk-eyebrow">Why buyers work with us</div>
          <h2 style={{ fontSize: "var(--t-h2)", lineHeight: 1.05, marginTop: 20 }}>
            Six reasons repeat orders come back.
          </h2>
        </div>

        <div className="pk-why" ref={gridRef}>
          {REASONS.map(([title, note, mark]) => (
            <div className="pk-why__item" key={title}>
              <span className={`pk-why__mark ${MARK_CLASS[mark]}`} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
