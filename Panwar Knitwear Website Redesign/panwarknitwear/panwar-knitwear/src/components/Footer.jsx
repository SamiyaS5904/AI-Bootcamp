import { Link } from "react-router-dom";

import { LISTINGS, LOCATION, NAV, PHONES, SOCIAL } from "../data/company.js";

export default function Footer() {
  return (
    <footer className="pk-footer">
      <div className="pk-footer__seam" aria-hidden="true" />

      <div className="pk-shell pk-footer__grid">
        <div className="pk-footer__col">
          <div style={{ font: "700 20px/1 var(--font-display)" }}>Panwar Knitwear</div>
          <div
            className="pk-mono"
            style={{
              font: "500 9px/1 var(--font-mono)",
              letterSpacing: "0.28em",
              color: "var(--text-faint)",
              marginTop: 6,
            }}
          >
            ZONIXA · MSP SPORTS
          </div>
          <p style={{ color: "var(--text-dim)", marginTop: 18, maxWidth: "38ch", fontSize: 15 }}>
            Knitwear manufacturer in Ludhiana, Punjab, established 2016. Hoodies, sweatshirts,
            T-shirts, jackets, lowers and shorts, produced in bulk with private-label branding.
          </p>
          <address
            style={{
              fontStyle: "normal",
              color: "var(--text-faint)",
              marginTop: 18,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Sunder Nagar, {LOCATION.city}
            <br />
            {LOCATION.region}, {LOCATION.country}
            <br />
            GST registered 2017
          </address>
          <a
            className="pk-link-arrow"
            href={LOCATION.maps}
            style={{ marginTop: 14, display: "inline-block" }}
            rel="noreferrer noopener"
            target="_blank"
          >
            Get directions &#8599;
          </a>
        </div>

        <div className="pk-footer__col">
          <span className="pk-label">ON THIS PAGE</span>
          <div className="pk-footer__links">
            {NAV.map(([label, id]) => (
              <a key={id} href={`/#${id}`}>
                {label}
              </a>
            ))}
            <Link to="/catalogue" style={{ color: "var(--amber)" }}>
              All 29 products
            </Link>
          </div>
        </div>

        <div className="pk-footer__col">
          <span className="pk-label">BRANDS &amp; SOCIAL</span>
          <div className="pk-footer__links">
            {SOCIAL.map((item) => (
              <a key={item.url} href={item.url} rel="noreferrer noopener" target="_blank">
                {item.name}
              </a>
            ))}
          </div>

          <span className="pk-label" style={{ display: "block", margin: "28px 0 12px" }}>
            LISTED ON
          </span>
          <div className="pk-footer__links">
            {LISTINGS.map((item) => (
              <a key={item.url} href={item.url} rel="noreferrer noopener" target="_blank">
                {item.name} &#8599;
              </a>
            ))}
          </div>
        </div>

        <div className="pk-footer__col">
          <span className="pk-label">TALK TO US</span>
          <div className="pk-footer__links">
            {PHONES.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className="pk-footer__tel">
                {phone.display}
              </a>
            ))}
          </div>
          <a
            href="/#enquiry"
            className="pk-btn pk-btn--primary pk-btn--sm"
            style={{ marginTop: 24 }}
          >
            Get a quote
          </a>
        </div>
      </div>

      <div className="pk-footer__bottom">
        <span>© {new Date().getFullYear()} Panwar Knitwear, Ludhiana. All rights reserved.</span>
        <span>Sole proprietorship · GST registered 2017 · 26–50 employees</span>
      </div>
    </footer>
  );
}
