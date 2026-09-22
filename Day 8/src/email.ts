/**
 * Everything EmailJS, in one file.
 *
 * A web page cannot send email on its own — sending needs mail credentials,
 * and anything in a page can be read by anyone. EmailJS holds the credentials
 * instead: you connect your Gmail to it once, write the email body on their
 * dashboard with {{placeholders}} in it, and the page makes a single HTTPS
 * call saying "send template X, here are the values". EmailJS fills in the
 * blanks and relays the mail through your account.
 *
 * So EmailJS owns delivery. It has no scheduling of any kind — every call
 * sends immediately — which is why the "when" lives in schedule.ts.
 */

import emailjs from "@emailjs/browser";
import type { Appointment, ReminderKind, SendRecord, TimedKind } from "./types";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Two templates cover all three emails, which is also the limit on the free
 * plan. The confirmation is a genuinely different email; the two reminders are
 * the same email with a different urgency line, so they share one template and
 * differ only in `when` and `headline`.
 */
const TEMPLATES = {
  confirmation: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION,
  reminder: import.meta.env.VITE_EMAILJS_TEMPLATE_REMINDER
};

export const CLINIC_NAME = "Model Town Clinic";

/** What distinguishes the two reminders inside the shared template. */
const REMINDER_COPY: Record<TimedKind, { when: string; headline: string }> = {
  m30: { when: "30 minutes", headline: "Time to leave" },
  m5: { when: "5 minutes", headline: "You are next" }
};

/**
 * True once all four values are present in .env. The UI checks this so a
 * missing key shows a setup notice instead of failing silently on first send.
 */
export const isConfigured = Boolean(
  SERVICE_ID && PUBLIC_KEY && TEMPLATES.confirmation && TEMPLATES.reminder
);

if (isConfigured) {
  emailjs.init({ publicKey: PUBLIC_KEY });
}

/**
 * Template values are plain strings — the template itself cannot format a
 * date — so the appointment time is turned into readable text here.
 */
const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true
});

export function formatAppointmentTime(startsAt: string): string {
  return TIME_FORMAT.format(new Date(startsAt));
}

/**
 * Send one email and report what happened. Never throws: the caller stores
 * the returned record either way, so a failure stays visible in the tracker
 * rather than disappearing into an unhandled rejection.
 */
export async function sendEmail(
  appointment: Appointment,
  kind: ReminderKind
): Promise<SendRecord> {
  const at = new Date().toISOString();

  // The dashboard template's "To Email" field must be {{to_email}} — EmailJS
  // only allows a changing recipient when it comes from a template value.
  const values: Record<string, string> = {
    to_email: appointment.email,
    patient_name: appointment.patientName,
    doctor_name: appointment.doctor,
    appointment_time: formatAppointmentTime(appointment.startsAt),
    clinic_name: CLINIC_NAME
  };

  const templateId =
    kind === "confirmation" ? TEMPLATES.confirmation : TEMPLATES.reminder;

  if (kind !== "confirmation") {
    Object.assign(values, REMINDER_COPY[kind]);
  }

  try {
    await emailjs.send(SERVICE_ID, templateId, values);
    return { status: "sent", at };
  } catch (error) {
    return { status: "failed", at, error: describe(error) };
  }
}

/** EmailJS rejects with { status, text } rather than an Error. */
function describe(error: unknown): string {
  if (typeof error === "object" && error !== null && "text" in error) {
    return String((error as { text: unknown }).text);
  }
  return error instanceof Error ? error.message : String(error);
}
