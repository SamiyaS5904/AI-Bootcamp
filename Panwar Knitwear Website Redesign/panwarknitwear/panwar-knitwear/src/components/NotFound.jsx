import { Link } from "react-router-dom";

/**
 * A real not-found page.
 *
 * The catch-all route used to render the home page at HTTP 200, which is a
 * soft 404: a crawler is told a mistyped URL is a valid page, and a visitor is
 * silently moved somewhere else without being told they took a wrong turn.
 */
export default function NotFound() {
  return (
    <main id="main" className="pk-section" style={{ minHeight: "60vh" }}>
      <div className="pk-shell">
        <div className="pk-eyebrow">404</div>
        <h1 style={{ fontSize: "var(--t-h2)", lineHeight: 1.05, marginTop: 20 }}>
          That page is not here.
        </h1>
        <p style={{ color: "var(--text-dim)", marginTop: 20, maxWidth: "52ch" }}>
          The link may be out of date. Everything we make is on the home page and in the
          catalogue.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
          <Link className="pk-btn pk-btn--primary" to="/">
            Back to the home page
          </Link>
          <Link className="pk-btn pk-btn--ghost" to="/catalogue">
            See all 29 products
          </Link>
        </div>
      </div>
    </main>
  );
}
