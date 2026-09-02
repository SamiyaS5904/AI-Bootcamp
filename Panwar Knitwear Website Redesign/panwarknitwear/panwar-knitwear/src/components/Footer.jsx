import { Link } from "react-router-dom";

import { NAV, PHONES, PLACEHOLDERS } from "../data/company.js";

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
            <span className="pk-ph">{PLACEHOLDERS.address}</span>
            <br />
            Ludhiana, Punjab, India
            <br />
            GST registered 2017
          </address>
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
            <a href="https://zonixa.com" rel="noreferrer noopener" target="_blank">
              zonixa.com
            </a>
            <a href="https://mspsports.in" rel="noreferrer noopener" target="_blank">
              mspsports.in
            </a>
            <a
              href="https://instagram.com/panwarknitwear"
              rel="noreferrer noopener"
              target="_blank"
            >
              Instagram @panwarknitwear
            </a>
            <a
              href="https://facebook.com/Panwarknitwear1"
              rel="noreferrer noopener"
              target="_blank"
            >
              Facebook /Panwarknitwear1
            </a>
          </div>

          <span className="pk-label" style={{ display: "block", margin: "28px 0 12px" }}>
            LISTED ON
          </span>
          <div style={{ color: "var(--text-faint)", fontSize: 14, lineHeight: 1.7 }}>
            JustDial · IndiaMART
            <br />
            TradeIndia · Google · LinkedIn
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
            <span className="pk-ph" style={{ fontSize: 15 }}>
              {PLACEHOLDERS.email}
            </span>
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
