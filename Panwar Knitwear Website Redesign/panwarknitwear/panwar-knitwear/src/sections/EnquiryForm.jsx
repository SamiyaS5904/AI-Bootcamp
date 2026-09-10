import { useRef, useState } from "react";

import { LOCATION, PHONES } from "../data/company.js";
import { usePersistentState, useReveal } from "../hooks/index.js";
import { composeEnquiryMessage, useEnquiry, whatsappUrl } from "../lib/enquiry.jsx";
import { WhatsAppIcon } from "../components/Icons.jsx";

const BRANDING = ["Printing", "Embroidery", "Labels & hang tags", "None, plain garments"];

const TIMELINES = [
  "As soon as possible",
  "Within a month",
  "Next season",
  "Just comparing suppliers",
];

const EMPTY = {
  name: "",
  company: "",
  phone: "",
  email: "",
  interest: "",
  quantity: "",
  timeline: "",
  branding: [],
  city: "",
  fabric: "",
  message: "",
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please tell us who we are replying to.";
  if (!form.phone.trim()) {
    errors.phone = "We reply on WhatsApp or by phone, so we need a number.";
  } else if (form.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "That does not look like a complete phone number.";
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = "Check the email address — we could not read it.";
  }
  return errors;
}

function Field({ id, label, optional, error, children }) {
  return (
    <label className="pk-field" htmlFor={id}>
      <span className="pk-field__label">
        {label}
        {optional && <span className="pk-field__opt">optional</span>}
      </span>
      {children}
      {error && (
        <span className="pk-field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * The RFQ, directly on the page — never behind a button.
 *
 * The draft is kept in local storage so a buyer who wanders off and comes back
 * does not retype everything, and the WhatsApp path carries the same details
 * for the many Indian B2B buyers who would rather not use a form at all.
 */
export default function EnquiryForm() {
  const [form, setForm] = usePersistentState("pk.enquiry.draft", EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const formRef = useRef(null);
  const handoffRef = useRef(null);

  const { picked, remove, clear } = useEnquiry();

  const introRef = useReveal();
  const cardRef = useReveal();

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const toggleBranding = (option) =>
    setForm((f) => ({
      ...f,
      branding: f.branding.includes(option)
        ? f.branding.filter((b) => b !== option)
        : [...f.branding, option],
    }));

  /**
   * The enquiry goes out over WhatsApp, which is where this trade actually
   * replies. So the primary control is a real anchor, not a submitting button:
   * opening a window after an `await` gets blocked by Safari and Firefox, but
   * native anchor navigation never is.
   *
   * Validation runs on click and cancels the navigation if anything is wrong.
   * Nothing here may ever claim the enquiry was received — this page does not
   * deliver it, WhatsApp does.
   */
  const onHandoff = (event) => {
    const found = validate(form);
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      event.preventDefault();
      formRef.current?.querySelector(`#${firstError}`)?.focus();
      return;
    }

    // The draft and the picked styles deliberately survive: WhatsApp may not
    // open, and the buyer must not lose what they typed.
    setState("handoff");
  };

  // Pressing Enter in a field must not reload the page. Validate, then trigger
  // the same anchor — a keypress is a user gesture, so this is not blocked.
  const onSubmit = (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      formRef.current?.querySelector(`#${firstError}`)?.focus();
      return;
    }
    handoffRef.current?.click();
  };

  const startOver = () => {
    setForm(EMPTY);
    clear();
    setErrors({});
    setState("idle");
  };

  const waHref = whatsappUrl(composeEnquiryMessage(form, picked));

  const note = {
    idle: "This opens WhatsApp with your details filled in — press send there and it reaches us. We reply on working days between 10:00 and 19:00 IST.",
    handoff:
      "Your enquiry is ready in WhatsApp — press send there and we have it. Nothing was sent from this page, so your details are still here if you need them.",
  }[state];

  const submitLabel = state === "handoff" ? "Open WhatsApp again" : "Send this enquiry on WhatsApp";

  return (
    <section className="pk-section pk-section--cream" id="enquiry">
      <span className="pk-section-num" aria-hidden="true">
        09
      </span>

      <div className="pk-shell pk-enquiry__grid">
        <div>
          <div ref={introRef}>
            <div className="pk-eyebrow">Request a quote</div>
            <h2 style={{ fontSize: "var(--t-h2)", lineHeight: 1.05, marginTop: 20 }}>
              Tell us what you need made.
            </h2>
            <p className="pk-enquiry__lede">
              Fill this in and it opens WhatsApp with everything filled out, ready to send. We
              come back with fabric options, a rate and a dispatch date. Prefer to talk? The
              numbers are beside this form.
            </p>
          </div>

          <form className="pk-form" onSubmit={onSubmit} ref={formRef} noValidate>
            {picked.length > 0 && (
              <div className="pk-picked">
                <div className="pk-picked__head">
                  <span className="pk-label" style={{ color: "var(--text-on-cream-soft)" }}>
                    {picked.length} {picked.length === 1 ? "STYLE" : "STYLES"} IN THIS ENQUIRY
                  </span>
                  <button type="button" className="pk-picked__clear" onClick={clear}>
                    Clear all
                  </button>
                </div>
                <ul className="pk-picked__list">
                  {picked.map((style) => (
                    <li className="pk-picked__item" key={style.id}>
                      {style.name}
                      <button
                        type="button"
                        className="pk-picked__remove"
                        onClick={() => remove(style.id)}
                        aria-label={`Remove ${style.name} from this enquiry`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Field id="name" label="Your name" error={errors.name}>
              <input
                id="name"
                className="pk-field__input"
                type="text"
                autoComplete="name"
                placeholder="Full name"
                value={form.name}
                onChange={set("name")}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </Field>

            <Field id="company" label="Company" optional>
              <input
                id="company"
                className="pk-field__input"
                type="text"
                autoComplete="organization"
                placeholder="Firm or shop name"
                value={form.company}
                onChange={set("company")}
              />
            </Field>

            <Field id="phone" label="Phone or WhatsApp" error={errors.phone}>
              <input
                id="phone"
                className="pk-field__input"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+91"
                value={form.phone}
                onChange={set("phone")}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
            </Field>

            <Field id="email" label="Email" optional error={errors.email}>
              <input
                id="email"
                className="pk-field__input"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={set("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </Field>

            {picked.length === 0 && (
              <div className="pk-form__wide">
                <Field id="interest" label="Product interest">
                  <input
                    id="interest"
                    className="pk-field__input"
                    type="text"
                    placeholder="e.g. 320 GSM round-neck hoodies"
                    value={form.interest}
                    onChange={set("interest")}
                  />
                </Field>
              </div>
            )}

            <Field id="quantity" label="Quantity" optional>
              <input
                id="quantity"
                className="pk-field__input"
                type="text"
                inputMode="numeric"
                placeholder="Pieces per style"
                value={form.quantity}
                onChange={set("quantity")}
              />
            </Field>

            <Field id="timeline" label="Timeline" optional>
              <select id="timeline" value={form.timeline} onChange={set("timeline")}>
                <option value="">Select a timeline</option>
                {TIMELINES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <fieldset className="pk-form__wide pk-fieldset">
              <legend className="pk-field__label">Branding required</legend>
              <div className="pk-chiprow" style={{ marginTop: 10 }}>
                {BRANDING.map((option) => (
                  <label className="pk-check" key={option}>
                    <input
                      type="checkbox"
                      checked={form.branding.includes(option)}
                      onChange={() => toggleBranding(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="city" label="Delivery city" optional>
              <input
                id="city"
                className="pk-field__input"
                type="text"
                autoComplete="address-level2"
                placeholder="City and state"
                value={form.city}
                onChange={set("city")}
              />
            </Field>

            <Field id="fabric" label="Target fabric or GSM" optional>
              <input
                id="fabric"
                className="pk-field__input"
                type="text"
                placeholder="e.g. spun fleece, 320 GSM"
                value={form.fabric}
                onChange={set("fabric")}
              />
            </Field>

            <div className="pk-form__wide">
              <Field id="message" label="Message" optional>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Sizes, colourways, packing, anything else we should know"
                  value={form.message}
                  onChange={set("message")}
                />
              </Field>
            </div>

            <div className="pk-form__foot pk-form__wide">
              <a
                className="pk-btn pk-btn--submit"
                data-state={state}
                href={waHref}
                ref={handoffRef}
                target="_blank"
                rel="noreferrer noopener"
                onClick={onHandoff}
              >
                <WhatsAppIcon width={17} height={17} />
                {submitLabel}
              </a>

              {state === "handoff" ? (
                <button type="button" className="pk-btn pk-btn--ghost" onClick={startOver}>
                  Start a new enquiry
                </button>
              ) : (
                <a className="pk-btn pk-btn--ghost" href={`tel:${PHONES[0].tel}`}>
                  Or call {PHONES[0].display}
                </a>
              )}

              <p className="pk-form__note" data-state={state} aria-live="polite">
                {note}
              </p>
            </div>
          </form>
        </div>

        <aside className="pk-contactcard" ref={cardRef}>
          <span className="pk-label">CALL US DIRECTLY</span>
          <div className="pk-contactcard__tels">
            {PHONES.map((phone) => (
              <a className="pk-contactcard__tel" href={`tel:${phone.tel}`} key={phone.tel}>
                {phone.display}
                {phone.whatsapp && <span>WhatsApp</span>}
              </a>
            ))}
          </div>

          <a
            className="pk-btn pk-btn--whatsapp pk-btn--block"
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer noopener"
            style={{ marginTop: 24 }}
          >
            <WhatsAppIcon width={17} height={17} />
            Message us on WhatsApp
          </a>

          <div className="pk-contactcard__block">
            <span className="pk-label">BUSINESS HOURS</span>
            <p>
              Monday to Saturday, 10:00–19:00 IST
              <br />
              Sunday closed
            </p>
          </div>

          <div className="pk-contactcard__block">
            <span className="pk-label">FACTORY</span>
            <p>
              Panwar Knitwear
              <br />
              Sunder Nagar, {LOCATION.city}
              <br />
              {LOCATION.region}, {LOCATION.country}
            </p>
            <a
              className="pk-link-arrow"
              href={LOCATION.maps}
              target="_blank"
              rel="noreferrer noopener"
            >
              See us on Google Maps ↗
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
