import { useEffect, useRef, useState } from "react";

import { PHONES } from "../data/company.js";
import { useScroll } from "../hooks/index.js";
import { whatsappUrl } from "../lib/enquiry.jsx";
import { ChatIcon, CloseIcon, PhoneIcon, WhatsAppIcon } from "./Icons.jsx";

/**
 * Desktop: an amber cluster that expands into two labelled pills.
 * It arrives only after roughly one viewport of scroll — an offer once the
 * visitor is engaged, never a popup on load.
 *
 * Mobile: a fixed bottom bar that slides out of the way while the enquiry
 * form is on screen, because at that point they are already converting.
 */
export default function FloatingActions() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const clusterRef = useRef(null);

  useScroll(() => {
    setVisible(window.scrollY > window.innerHeight * 0.85);

    const form = document.getElementById("enquiry");
    if (!form) {
      setBarHidden(false);
      return;
    }
    const rect = form.getBoundingClientRect();
    setBarHidden(rect.top < window.innerHeight * 0.75 && rect.bottom > 120);
  });

  // Close the cluster on Escape or on an outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (!clusterRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  const wa = whatsappUrl();

  return (
    <>
      <div
        className="pk-fab"
        ref={clusterRef}
        data-visible={visible}
        data-open={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <a
          className="pk-fab__pill pk-fab__pill--whatsapp"
          href={wa}
          target="_blank"
          rel="noreferrer noopener"
          style={{ "--pill-delay": "60ms" }}
          tabIndex={open && visible ? 0 : -1}
        >
          <WhatsAppIcon width={16} height={16} />
          WhatsApp
        </a>

        <a
          className="pk-fab__pill pk-fab__pill--call"
          href={`tel:${PHONES[0].tel}`}
          style={{ "--pill-delay": "0ms" }}
          tabIndex={open && visible ? 0 : -1}
        >
          <PhoneIcon width={16} height={16} />
          Call now
        </a>

        <button
          type="button"
          className="pk-fab__trigger"
          aria-expanded={open}
          aria-label={open ? "Close contact options" : "Contact options"}
          onClick={() => setOpen((v) => !v)}
          onFocus={() => setOpen(true)}
        >
          <span className="pk-fab__ring" aria-hidden="true" />
          {open ? <CloseIcon width={22} height={22} /> : <ChatIcon width={22} height={22} />}
        </button>
      </div>

      <div className="pk-mobilebar" data-hidden={barHidden}>
        <a
          className="pk-mobilebar__wa"
          href={wa}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="pk-fab__ring" aria-hidden="true" style={{ borderColor: "rgba(20,19,26,.5)", inset: "auto", width: 52, height: 52, left: "50%", top: "50%", marginLeft: -26, marginTop: -26, position: "absolute" }} />
          <WhatsAppIcon width={18} height={18} />
          WhatsApp
        </a>
        <a className="pk-mobilebar__call" href={`tel:${PHONES[0].tel}`}>
          <PhoneIcon width={18} height={18} />
          Call now
        </a>
      </div>
    </>
  );
}
