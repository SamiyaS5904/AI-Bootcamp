/**
 * Per-route document metadata, without pulling in react-helmet.
 *
 * Note on scope: Google executes JavaScript when indexing, so title,
 * description, canonical and JSON-LD injected here are read fine. WhatsApp,
 * Facebook, LinkedIn and Slack do NOT run JS, so the Open Graph tags that
 * matter for link previews live statically in index.html. Both are needed.
 */

/**
 * The canonical origin.
 *
 * ⚠️ Deliberately the Vercel domain, not panwarknitwear.com — the OLD site is
 * still live on that domain, so pointing canonicals at it would tell Google
 * this build is a duplicate of the site it replaces. Change this one constant
 * at cutover, and update index.html and public/sitemap.xml to match.
 */
export const SITE_URL = "https://panwarknitwear-weld.vercel.app";

const DEFAULT_META = {
  title: "Panwar Knitwear — knitwear manufacturer in Ludhiana, since 2016",
  description:
    "Panwar Knitwear manufactures hoodies, sweatshirts, T-shirts, jackets, lowers and shorts in bulk from Ludhiana, Punjab. 320 GSM heavy knits, private label and OEM, established 2016.",
};

export const ROUTE_META = {
  "/": DEFAULT_META,
  "/catalogue": {
    title: "Product catalogue — 29 styles — Panwar Knitwear",
    description:
      "All 29 knitwear styles we run from Ludhiana, filterable by category, fabric and GSM. Hoodies, sweatshirts, T-shirts and jackets with sizes, article numbers and confirmed weights.",
  },
};

/** Find a head tag by selector, or create and tag it so we can find it again. */
function upsert(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    el.setAttribute("data-pk-meta", "");
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name, content) {
  const el = upsert(`meta[name="${name}"]`, () => {
    const node = document.createElement("meta");
    node.setAttribute("name", name);
    return node;
  });
  el.setAttribute("content", content);
}

function setProperty(property, content) {
  const el = upsert(`meta[property="${property}"]`, () => {
    const node = document.createElement("meta");
    node.setAttribute("property", property);
    return node;
  });
  el.setAttribute("content", content);
}

/**
 * Apply the metadata for a route.
 *
 * The canonical is always the bare path. Catalogue filters live in the query
 * string, so without this every filter combination would present itself to a
 * crawler as a separate near-duplicate URL.
 */
export function applyRouteMeta(pathname) {
  const meta = ROUTE_META[pathname] ?? DEFAULT_META;
  const url = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

  document.title = meta.title;
  setMeta("description", meta.description);

  const canonical = upsert('link[rel="canonical"]', () => {
    const node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    return node;
  });
  canonical.setAttribute("href", url);

  setProperty("og:title", meta.title);
  setProperty("og:description", meta.description);
  setProperty("og:url", url);
  setMeta("twitter:title", meta.title);
  setMeta("twitter:description", meta.description);
}
