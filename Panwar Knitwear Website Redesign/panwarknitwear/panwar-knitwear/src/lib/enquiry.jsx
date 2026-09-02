import { createContext, useCallback, useContext, useMemo } from "react";

import { WHATSAPP_NUMBER } from "../data/company.js";
import { usePersistentState } from "../hooks/index.js";

/**
 * The enquiry list.
 *
 * A buyer comparing several Ludhiana manufacturers usually wants a rate on a
 * handful of styles at once, not one at a time. This collects the styles they
 * picked and carries them into the RFQ form. There are no prices and no
 * checkout — it is a quote request, not a cart.
 */

const EnquiryContext = createContext(null);

const STORAGE_KEY = "pk.enquiry.styles";

export function EnquiryProvider({ children }) {
  const [picked, setPicked] = usePersistentState(STORAGE_KEY, []);

  const add = useCallback(
    (product) => {
      setPicked((list) =>
        list.some((p) => p.id === product.id)
          ? list
          : [...list, { id: product.id, name: product.name }]
      );
    },
    [setPicked]
  );

  const remove = useCallback(
    (id) => setPicked((list) => list.filter((p) => p.id !== id)),
    [setPicked]
  );

  const toggle = useCallback(
    (product) =>
      setPicked((list) =>
        list.some((p) => p.id === product.id)
          ? list.filter((p) => p.id !== product.id)
          : [...list, { id: product.id, name: product.name }]
      ),
    [setPicked]
  );

  const clear = useCallback(() => setPicked([]), [setPicked]);

  const has = useCallback((id) => picked.some((p) => p.id === id), [picked]);

  const value = useMemo(
    () => ({ picked, add, remove, toggle, clear, has, count: picked.length }),
    [picked, add, remove, toggle, clear, has]
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used inside <EnquiryProvider>");
  return ctx;
}

/** Scroll the enquiry form into view, allowing for the sticky header. */
export function scrollToEnquiry() {
  const el = document.getElementById("enquiry");
  if (!el) return;
  const header = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
    10
  );
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - (header || 72) - 12,
    behavior: reduced ? "auto" : "smooth",
  });
}

/** Compose a WhatsApp message. Indian B2B buyers convert here far more readily. */
export function whatsappUrl(text) {
  const message =
    text || "Hello Panwar Knitwear, I would like a bulk quote.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function composeEnquiryMessage(form, picked) {
  const lines = ["Hello Panwar Knitwear, I would like a bulk quote."];

  const field = (label, value) => {
    if (value) lines.push(`${label}: ${value}`);
  };

  lines.push("");
  field("Name", form.name);
  field("Company", form.company);
  field("Phone", form.phone);
  field("Email", form.email);

  if (picked?.length) {
    lines.push("", `Styles (${picked.length}):`);
    picked.forEach((p) => lines.push(`• ${p.name}`));
  } else {
    field("Product interest", form.interest);
  }

  lines.push("");
  field("Quantity", form.quantity);
  field("Fabric or GSM", form.fabric);
  field("Branding", form.branding?.join(", "));
  field("Delivery city", form.city);
  field("Timeline", form.timeline);
  field("Message", form.message);

  return lines.join("\n");
}
