/**
 * When each email is due.
 *
 * Everything here is pure: no timers, no network, no React. It takes `now` as
 * an argument instead of calling Date.now() itself, which makes it trivial to
 * reason about and means the exact same logic would work unchanged inside a
 * server-side cron job if this ever outgrows the browser.
 */

import type { Appointment, SendRecord, TimedKind } from "./types";

/** How far before the appointment each reminder goes out. */
export const OFFSETS_MS: Record<TimedKind, number> = {
  m30: 30 * 60_000,
  m5: 5 * 60_000
};

export const TIMED_KINDS: readonly TimedKind[] = ["m30", "m5"];

/**
 * If the tab was closed or the laptop asleep when a reminder came due, we
 * still send it — but only for a short while afterwards. An email reading
 * "leave in 30 minutes" is simply false if it arrives 20 minutes late, so past
 * this window we report it as missed rather than sending something untrue.
 */
export const CATCH_UP_MS = 5 * 60_000;

/** The moment one reminder should go out, in epoch milliseconds. */
export function dueAt(appointment: Appointment, kind: TimedKind): number {
  return startTime(appointment) - OFFSETS_MS[kind];
}

export function startTime(appointment: Appointment): number {
  return new Date(appointment.startsAt).getTime();
}

/**
 * Everything one reminder can be. The first three come from a stored
 * SendRecord; the last three are worked out from the clock.
 */
export type ReminderState =
  | "sent"
  | "failed"
  | "skipped"
  | "waiting" // its moment has not arrived yet
  | "due" // send it on this tick
  | "missed"; // its moment passed while nothing was running

export function reminderState(
  appointment: Appointment,
  kind: TimedKind,
  now: number
): ReminderState {
  const already = appointment.sent[kind];
  if (already) return already.status;

  const due = dueAt(appointment, kind);
  if (now < due) return "waiting";
  if (now < startTime(appointment) && now - due <= CATCH_UP_MS) return "due";
  return "missed";
}

/** The reminders that should be sent right now. Drives the ticker. */
export function dueReminders(
  appointments: readonly Appointment[],
  now: number
): { appointment: Appointment; kind: TimedKind }[] {
  const due: { appointment: Appointment; kind: TimedKind }[] = [];

  for (const appointment of appointments) {
    for (const kind of TIMED_KINDS) {
      if (reminderState(appointment, kind, now) === "due") {
        due.push({ appointment, kind });
      }
    }
  }

  return due;
}

/**
 * Reminders that were already in the past the moment the appointment was
 * booked. Recorded up front so the tracker can say "skipped" — which is
 * honest — instead of "missed", which would imply we dropped something.
 */
export function skippedReminders(
  startsAt: string,
  now: number
): Partial<Record<TimedKind, SendRecord>> {
  const at = new Date(now).toISOString();
  const skipped: Partial<Record<TimedKind, SendRecord>> = {};
  const start = new Date(startsAt).getTime();

  for (const kind of TIMED_KINDS) {
    if (now > start - OFFSETS_MS[kind]) {
      skipped[kind] = { status: "skipped", at };
    }
  }

  return skipped;
}
