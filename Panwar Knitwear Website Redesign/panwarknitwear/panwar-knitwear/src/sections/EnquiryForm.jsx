import { useRef, useState } from "react";

import { PHONES, PLACEHOLDERS } from "../data/company.js";
import { usePersistentState, useReveal } from "../hooks/index.js";
import { composeEnquiryMessage, useEnquiry, whatsappUrl } from "../lib/enquiry.jsx";
import { submitEnquiry } from "../lib/submitEnquiry.js";
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

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      formRef.current?.querySelector(`#${firstError}`)?.focus();
      return;
    }

    setState("sending");
    try {
      await submitEnquiry({ ...form, styles: picked, sentAt: new Date().toISOString() });
      setState("sent");
      setForm(EMPTY);
      clear();
    } catch {
      setState("error");
    }
  };

  const note = {
    idle: "We reply on working days between 10:00 and 19:00 IST.",
    sending: "Sending — do not refresh.",
    sent: "Enquiry received. We will reply on WhatsApp or by phone within one working day.",
    error: "That did not send. Please try WhatsApp or call us directly — the numbers are beside this form.",
  }[state];

  const submitLabel = {
    idle: "Send enquiry",
    sending: "Sending your enquiry…",
    sent: "Enquiry received",
    error: "Try again",
  }[state];

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
              Fill this in and we will come back with fabric options, a rate and a dispatch date. Or
              send the same details on WhatsApp.
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
              <button
                type="submit"
                className="pk-btn pk-btn--submit"
                data-state={state}
                disabled={state === "sending" || state === "sent"}
              >
                {submitLabel}
              </button>

              <a
                className="pk-btn pk-btn--whatsapp"
                href={whatsappUrl(composeEnquiryMessage(form, picked))}
                target="_blank"
                rel="noreferrer noopener"
              >
                <WhatsAppIcon width={17} height={17} />
                Send on WhatsApp instead
              </a>

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
            <span className="pk-label">EMAIL</span>
            <p className="pk-ph" style={{ color: "var(--text-faint)" }}>
              {PLACEHOLDERS.email}
            </p>
          </div>

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
              <span className="pk-ph">{PLACEHOLDERS.address}</span>
              <br />
              Ludhiana, Punjab, India
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
