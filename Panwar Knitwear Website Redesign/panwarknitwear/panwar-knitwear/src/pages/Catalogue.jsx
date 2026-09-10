import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard.jsx";
import QuickView from "../components/QuickView.jsx";
import JsonLd from "../components/JsonLd.jsx";
import { SearchIcon } from "../components/Icons.jsx";
import { PLACEHOLDERS } from "../data/company.js";
import { CATEGORIES, FABRICS, GSM_FILTERS, PRODUCTS } from "../data/products.js";
import { useReveal } from "../hooks/index.js";
import { SITE_URL } from "../lib/meta.js";
import { useEnquiry } from "../lib/enquiry.jsx";

const SORTS = {
  default: { label: "Catalogue order", fn: (a, b) => a.id - b.id },
  "name-asc": { label: "Name, A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
  "gsm-first": {
    label: "Confirmed weight first",
    fn: (a, b) => Number(b.gsmConfirmed) - Number(a.gsmConfirmed) || a.id - b.id,
  },
};

const DEFAULTS = { cat: "All", fabric: "All", gsm: "All", q: "", sort: "default" };

// Mirrors the breadcrumb rendered at the top of the page.
const BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Product catalogue",
      item: `${SITE_URL}/catalogue`,
    },
  ],
};

export default function Catalogue() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { add } = useEnquiry();
  const [openId, setOpenId] = useState(null);

  const headRef = useReveal();

  // Filters live in the URL, so a buyer can send the exact view to a colleague.
  const value = (key) => params.get(key) ?? DEFAULTS[key];

  const setFilter = (key, next) => {
    const draft = new URLSearchParams(params);
    if (next === DEFAULTS[key]) draft.delete(key);
    else draft.set(key, next);
    setParams(draft, { replace: true });
  };

  const reset = () => setParams(new URLSearchParams(), { replace: true });

  const cat = value("cat");
  const fabric = value("fabric");
  const gsm = value("gsm");
  const q = value("q");
  const sort = value("sort");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      if (cat !== "All" && p.cat !== cat) return false;
      if (fabric !== "All" && p.fabric !== fabric) return false;
      if (gsm === "Weight to confirm" && p.gsmConfirmed) return false;
      if (gsm.endsWith(" GSM") && p.gsm !== gsm) return false;
      // `haystack` includes the client's original product title and article
      // number, so trade terms like "filice", "ben collar" and "half baju"
      // still find the right style.
      if (needle && !p.haystack.includes(needle)) return false;
      return true;
    });
    return list.sort((SORTS[sort] ?? SORTS.default).fn);
  }, [cat, fabric, gsm, q, sort]);

  const activeFilters = [
    cat !== "All" && ["cat", cat],
    fabric !== "All" && ["fabric", fabric],
    gsm !== "All" && ["gsm", gsm],
    q.trim() && ["q", `“${q.trim()}”`],
  ].filter(Boolean);

  const openIndex = results.findIndex((p) => p.id === openId);
  const open = openIndex >= 0 ? results[openIndex] : null;

  // If filters change the open style out of the results, close the quick view.
  useEffect(() => {
    if (openId !== null && openIndex === -1) setOpenId(null);
  }, [openId, openIndex]);

  const step = (delta) => {
    const next = results[openIndex + delta];
    if (next) setOpenId(next.id);
  };

  const enquire = (product) => {
    add(product);
    setOpenId(null);
    navigate("/", { state: { scrollTo: "enquiry" } });
  };

  const chip = (key, options) =>
    options.map((option) => (
      <button
        key={option}
        type="button"
        className="pk-chip"
        aria-pressed={value(key) === option}
        onClick={() => setFilter(key, option)}
      >
        {option}
      </button>
    ));

  return (
    <main id="main">
      <JsonLd data={BREADCRUMB} />
      <section className="pk-shell pk-cat-hero">
        <nav className="pk-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / Product catalogue
        </nav>

        <div className="pk-cat-hero__row" ref={headRef}>
          <div>
            <h1>Product catalogue</h1>
            <p>
              All 29 styles we currently run, photographed as they ship: hero garment plus the
              colour run available on each style. Add any style to your enquiry and it travels to
              the quote form.
            </p>
          </div>

          <div className="pk-moq">
            <span className="pk-label">MINIMUM ORDER</span>
            <div className="pk-moq__val">Depends on the style</div>
            <p>
              Fabric, colour count and branding all move it. Tell us the style and quantity
              and we confirm the minimum in writing with your rate.
            </p>
            <Link className="pk-link-arrow" to="/" state={{ scrollTo: "enquiry" }}>
              Ask for a quote →
            </Link>
          </div>
        </div>
      </section>

      <section className="pk-shell pk-cat-body">
        <div className="pk-cat-layout">
          <aside className="pk-filters" aria-label="Filter the catalogue">
            <div className="pk-filters__head">
              <span className="pk-label">FILTERS</span>
              <button
                type="button"
                className="pk-filters__reset"
                onClick={reset}
                disabled={!activeFilters.length}
              >
                Reset
              </button>
            </div>

            <div className="pk-filters__group pk-filters__group--first">
              <div className="pk-search">
                <label className="pk-vh" htmlFor="catalogue-search">
                  Search styles
                </label>
                <input
                  id="catalogue-search"
                  type="search"
                  placeholder="Search styles…"
                  value={q}
                  onChange={(e) => setFilter("q", e.target.value)}
                />
                {q ? (
                  <button
                    type="button"
                    className="pk-search__clear"
                    onClick={() => setFilter("q", "")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                ) : (
                  <span
                    className="pk-search__clear"
                    style={{ pointerEvents: "none" }}
                    aria-hidden="true"
                  >
                    <SearchIcon width={15} height={15} />
                  </span>
                )}
              </div>
            </div>

            <fieldset className="pk-filters__group">
              <legend className="pk-filters__legend">Category</legend>
              <div className="pk-chiprow">{chip("cat", CATEGORIES)}</div>
            </fieldset>

            <fieldset className="pk-filters__group">
              <legend className="pk-filters__legend">Fabric</legend>
              <div className="pk-chiprow">{chip("fabric", FABRICS)}</div>
            </fieldset>

            <fieldset className="pk-filters__group">
              <legend className="pk-filters__legend">GSM</legend>
              <div className="pk-chiprow">{chip("gsm", GSM_FILTERS)}</div>
            </fieldset>

            <p className="pk-filters__note">
              Confirmed weights come from our own spec sheets. Styles marked{" "}
              <span className="pk-ph">{PLACEHOLDERS.gsm}</span> are still to be confirmed
              against the mill — ask and we will send the figure.
            </p>
          </aside>

          <div>
            <div className="pk-results__bar">
              <p className="pk-results__count" aria-live="polite">
                {results.length} of {PRODUCTS.length} styles
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <span className="pk-results__hint">Click any style for full specifications</span>
                <label className="pk-sort">
                  Sort
                  <select value={sort} onChange={(e) => setFilter("sort", e.target.value)}>
                    {Object.entries(SORTS).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="pk-active-filters">
                {activeFilters.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="pk-active-filters__tag"
                    onClick={() => setFilter(key, DEFAULTS[key])}
                    aria-label={`Remove filter: ${label}`}
                  >
                    {label}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 ? (
              <div className="pk-grid pk-grid--3 pk-grid--wrap" style={{ marginTop: 28 }}>
                {results.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="catalogue"
                    priority={i < 6}
                    onQuickView={() => setOpenId(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="pk-empty">
                <h2>No styles match this combination.</h2>
                <p>
                  We manufacture to spec, so a style you cannot see here can still be made. Clear
                  the filters, or tell us what you need.
                </p>
                <div className="pk-empty__ctas">
                  <button type="button" className="pk-btn pk-btn--primary" onClick={reset}>
                    Reset all filters
                  </button>
                  <Link className="pk-btn pk-btn--ghost" to="/" state={{ scrollTo: "enquiry" }}>
                    Send a custom enquiry
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <QuickView
        product={open}
        index={openIndex}
        total={results.length}
        onClose={() => setOpenId(null)}
        onStep={step}
        onEnquire={enquire}
      />
    </main>
  );
}
