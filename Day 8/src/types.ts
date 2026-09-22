/** The three emails one appointment produces. */
export type ReminderKind = "confirmation" | "m30" | "m5";

/** The two the clock triggers, as opposed to the one a click triggers. */
export type TimedKind = Extract<ReminderKind, "m30" | "m5">;

/**
 * What happened when we tried to send one email. Written once and never
 * changed, so it doubles as the "don't send this twice" guard.
 *
 * "skipped" is recorded at booking time for a reminder whose moment had
 * already passed — booking 10 minutes ahead means the 30-minute reminder
 * never had a chance to fire.
 */
export type SendRecord = {
  status: "sent" | "failed" | "skipped";
  at: string; // ISO
  error?: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  email: string;
  doctor: string;
  /**
   * ISO string rather than a Date, so it survives the round trip through
   * localStorage without needing a JSON.parse reviver.
   */
  startsAt: string;
  sent: Partial<Record<ReminderKind, SendRecord>>;
};
