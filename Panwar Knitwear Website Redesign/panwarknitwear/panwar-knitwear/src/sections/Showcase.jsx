import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard.jsx";
import { CATEGORIES, PRODUCTS } from "../data/products.js";
import { useMediaQuery, useReducedMotion, useReveal } from "../hooks/index.js";
import { scrollToEnquiry } from "../lib/enquiry.jsx";

const SHOWN = 12;

/**
 * Filtered cards glide to their new positions rather than snapping, using a
 * FLIP pass: measure before, measure after, animate the difference away.
 */
function useFlip(deps, enabled) {
  const containerRef = useRef(null);
  const positions = useRef(new Map());

  // Record where everything is before React commits the new list.
  const snapshot = () => {
    const node = containerRef.current;
    if (!node) return;
    positions.current = new Map();
    Array.from(node.children).forEach((child) => {
      positions.current.set(child.dataset.key, child.getBoundingClientRect());
    });
  };

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled) return;

    Array.from(node.children).forEach((child) => {
      const before = positions.current.get(child.dataset.key);
      const after = child.getBoundingClientRect();

      if (!before) {
        // New to the list: fade it up in place.
        child.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 500, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
        );
        return;
      }

      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (!dx && !dy) return;

      child.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [containerRef, snapshot];
}

export default function Showcase() {
  const [filter, setFilter] = useState("All");
  const headRef = useReveal();
  const barRef = useReveal();
  const reduced = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 760px)");

  const counts = useMemo(() => {
    const map = { All: PRODUCTS.length };
    PRODUCTS.forEach((p) => {
      map[p.cat] = (map[p.cat] || 0) + 1;
    });
    return map;
  }, []);

  const shown = useMemo(
    () => (filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter)).slice(0, SHOWN),
    [filter]
  );

  const [gridRef, snapshot] = useFlip([filter], !reduced && !isMobile);

  const pick = (next) => {
    if (next === filter) return;
    snapshot();
    setFilter(next);
  };

  return (
    <section className="pk-section pk-section--raised" id="products">
      <span className="pk-section-num" aria-hidden="true">
        03
      </span>

      <div className="pk-shell">
        <div className="pk-head" ref={headRef}>
          <div>
            <div className="pk-eyebrow">Product showcase</div>
            <h2>Styles we are running now.</h2>
          </div>
          <Link className="pk-link-arrow" to="/catalogue">
            View all 29 products →
          </Link>
        </div>

        <div className="pk-showcase__bar" ref={barRef} role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="pk-chip"
              aria-pressed={cat === filter}
              onClick={() => pick(cat)}
            >
              {cat}
              <span className="pk-chip__count">{counts[cat] ?? 0}</span>
            </button>
          ))}
          <span className="pk-showcase__count" aria-live="polite">
            {shown.length} of {PRODUCTS.length} shown
          </span>
        </div>

        <div className="pk-grid" ref={gridRef}>
          {shown.map((product, i) => (
            <ProductCard
              key={product.id}
              data-key={product.id}
              product={product}
              priority={i < 4}
              onQuickView={() => scrollToEnquiry()}
            />
          ))}
        </div>

        {isMobile && <p className="pk-rail__hint">SWIPE FOR MORE →</p>}

        <div className="pk-showcase__more">
          <Link className="pk-btn pk-btn--ghost" to="/catalogue">
            View all 29 products, with fabric and GSM filters
          </Link>
        </div>
      </div>
    </section>
  );
}
