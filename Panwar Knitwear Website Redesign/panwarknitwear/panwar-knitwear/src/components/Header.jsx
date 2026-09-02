import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { NAV, PHONES } from "../data/company.js";
import { useScroll, useScrollSpy } from "../hooks/index.js";

const SECTION_IDS = NAV.map(([, id]) => id);

export default function Header() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  const [compact, setCompact] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const active = useScrollSpy(onHome ? SECTION_IDS : [], 120);

  useScroll(() => {
    const doc = document.documentElement;
    const span = doc.scrollHeight - window.innerHeight;
    setCompact(window.scrollY > 80);
    setProgress(span > 0 ? (window.scrollY / span) * 100 : 0);
  });

  // Never leave the menu open across a navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const href = (id) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className="pk-header" data-compact={compact}>
      <div className="pk-header__inner">
        <Link to="/" className="pk-wordmark" aria-label="Panwar Knitwear, home">
          <div className="pk-wordmark__name">Panwar Knitwear</div>
          <div className="pk-wordmark__sub">ZONIXA · MSP SPORTS · LUDHIANA</div>
        </Link>

        <nav className="pk-nav" aria-label="Sections">
          {NAV.map(([label, id]) => (
            <a
              key={id}
              href={href(id)}
              aria-current={onHome && active === id ? "true" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="pk-header__actions">
          <a className="pk-header__tel" href={`tel:${PHONES[0].tel}`}>
            {PHONES[0].display}
          </a>
          <a className="pk-btn pk-btn--primary pk-btn--sm" href={href("enquiry")}>
            Get a quote
          </a>
        </div>

        <a
          className="pk-btn pk-btn--primary pk-btn--sm pk-header__quote"
          href={href("enquiry")}
        >
          Get a quote
        </a>

        <button
          type="button"
          className="pk-burger"
          aria-expanded={menuOpen}
          aria-controls="pk-mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="pk-burger__bars" />
        </button>
      </div>

      <div className="pk-mobnav" id="pk-mobile-nav" data-open={menuOpen}>
        <div className="pk-mobnav__list">
          {NAV.map(([label, id]) => (
            <a key={id} href={href(id)} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <Link to="/catalogue" onClick={() => setMenuOpen(false)}>
            All 29 products
          </Link>
          <a href={`tel:${PHONES[0].tel}`} onClick={() => setMenuOpen(false)}>
            {PHONES[0].display}
          </a>
        </div>
      </div>

      <div className="pk-progress" style={{ "--progress": `${progress}%` }} />
    </header>
  );
}
