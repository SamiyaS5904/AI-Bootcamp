import { useEffect, useRef, useState } from "react";
import {
  CLINIC_NAME,
  formatAppointmentTime,
  isConfigured,
  sendEmail
} from "./email";
import {
  dueReminders,
  reminderState,
  skippedReminders,
  type ReminderState
} from "./schedule";
import type { Appointment, ReminderKind, SendRecord } from "./types";

const STORAGE_KEY = "day8.appointments.v1";

/** How often the ticker asks "anything due?". */
const TICK_MS = 10_000;

/** EmailJS allows one request per second, so sends are spaced out. */
const SEND_GAP_MS = 1_100;

/** All three emails, in the order the tracker shows them. */
const KINDS: readonly ReminderKind[] = ["confirmation", "m30", "m5"];

const DOCTORS = [
  "Dr. A. Mehta (General Medicine)",
  "Dr. S. Rao (Dermatology)",
  "Dr. K. Iyer (Orthopaedics)"
];

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(loadSaved);
  const [now, setNow] = useState(() => Date.now());

  // Saving on every change keeps an accidental reload from wiping the list.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {
      // A full or blocked localStorage should not take the app down.
    }
  }, [appointments]);

  // One interval for the whole app. Advancing `now` both drives the reminder
  // check below and refreshes the tracker labels.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useReminderTicker(appointments, now, setAppointments);

  async function book(draft: Omit<Appointment, "id" | "sent">) {
    const appointment: Appointment = {
      ...draft,
      id: crypto.randomUUID(),
      // A reminder whose moment already passed never had a chance to fire.
      sent: skippedReminders(draft.startsAt, Date.now())
    };

    setAppointments((prev) => [appointment, ...prev]);
    const result = await sendEmail(appointment, "confirmation");
    setAppointments((prev) =>
      withRecord(prev, appointment.id, "confirmation", result)
    );
  }

  return (
    <main>
      <header>
        <h1>{CLINIC_NAME}</h1>
        <p>Appointment reminders, sent with EmailJS.</p>
      </header>

      {!isConfigured && (
        <p className="notice warn">
          EmailJS is not configured. Copy <code>.env.example</code> to{" "}
          <code>.env</code>, fill in the four values from your dashboard, then
          restart the dev server. Until then nothing will send.
        </p>
      )}

      <BookingForm doctors={DOCTORS} onBook={book} />

      <section>
        <h2>Tracker</h2>
        <p className="notice">
          Reminders are sent by a timer in this page, because EmailJS itself
          cannot schedule anything. Closing this tab stops them.
        </p>
        {appointments.length === 0 ? (
          <p className="empty">No appointments booked yet.</p>
        ) : (
          <ul className="tracker">
            {appointments.map((appointment) => (
              <Row key={appointment.id} appointment={appointment} now={now} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/**
 * Sends whatever schedule.ts says is due, one at a time.
 *
 * `attempted` is the guard against sending twice. The stored record is the
 * durable version of that, but it only lands once the network call comes
 * back — this ref covers the window in between, including the deliberate
 * double-run of effects React does in development.
 */
function useReminderTicker(
  appointments: Appointment[],
  now: number,
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>
) {
  const attempted = useRef(new Set<string>());
  const busy = useRef(false);

  useEffect(() => {
    if (!isConfigured || busy.current) return;

    const due = dueReminders(appointments, now).filter(
      ({ appointment, kind }) =>
        !attempted.current.has(`${appointment.id}:${kind}`)
    );
    if (due.length === 0) return;

    busy.current = true;

    void (async () => {
      for (const { appointment, kind } of due) {
        attempted.current.add(`${appointment.id}:${kind}`);
        const result = await sendEmail(appointment, kind);
        setAppointments((prev) =>
          withRecord(prev, appointment.id, kind, result)
        );
        await wait(SEND_GAP_MS);
      }
      busy.current = false;
    })();
  }, [appointments, now, setAppointments]);
}

function BookingForm({
  doctors,
  onBook
}: {
  doctors: string[];
  onBook: (draft: Omit<Appointment, "id" | "sent">) => Promise<void>;
}) {
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [doctor, setDoctor] = useState(doctors[0]);
  const [at, setAt] = useState("");
  const [booking, setBooking] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (booking) return;

    setBooking(true);
    await onBook({
      patientName: patientName.trim(),
      email: email.trim(),
      doctor,
      startsAt: new Date(at).toISOString()
    });
    setBooking(false);

    setPatientName("");
    setEmail("");
    setAt("");
  }

  return (
    <form onSubmit={submit}>
      <h2>Book an appointment</h2>

      <label>
        Patient name
        <input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          autoComplete="off"
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
      </label>

      <label>
        Doctor
        <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
          {doctors.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>

      <label>
        Date and time
        <input
          type="datetime-local"
          value={at}
          min={inputValue(new Date())}
          onChange={(e) => setAt(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={booking || !isConfigured}>
        {booking ? "Sending confirmation…" : "Book and send confirmation"}
      </button>
    </form>
  );
}

const MARKS: Record<ReminderState, { mark: string; means: string }> = {
  sent: { mark: "✓", means: "sent" },
  failed: { mark: "✕", means: "failed" },
  skipped: { mark: "–", means: "skipped, its moment had already passed" },
  waiting: { mark: "·", means: "waiting" },
  due: { mark: "…", means: "sending" },
  missed: { mark: "!", means: "missed, nothing was running when it came due" }
};

function Row({ appointment, now }: { appointment: Appointment; now: number }) {
  // Shown inline rather than only in a tooltip: a send that failed is the one
  // thing you actually need to read while setting EmailJS up.
  const failures = KINDS.map((kind) => ({
    kind,
    error: appointment.sent[kind]?.error
  })).filter((f) => f.error);

  return (
    <li>
      <div className="who">
        <strong>{appointment.patientName}</strong>
        <span>{appointment.email}</span>
      </div>
      <div className="when">
        {formatAppointmentTime(appointment.startsAt)}
        <span>{appointment.doctor}</span>
      </div>
      <div className="marks">
        <Mark
          label="confirmation"
          kind="confirmation"
          appointment={appointment}
          state={appointment.sent.confirmation?.status ?? "waiting"}
        />
        <Mark
          label="30 min"
          kind="m30"
          appointment={appointment}
          state={reminderState(appointment, "m30", now)}
        />
        <Mark
          label="5 min"
          kind="m5"
          appointment={appointment}
          state={reminderState(appointment, "m5", now)}
        />
      </div>
      {failures.length > 0 && (
        <div className="errors">
          {failures.map(({ kind, error }) => (
            <div key={kind}>
              <strong>{kind}</strong> failed — {error}
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function Mark({
  label,
  kind,
  appointment,
  state
}: {
  label: string;
  kind: ReminderKind;
  appointment: Appointment;
  state: ReminderState;
}) {
  const { mark, means } = MARKS[state];
  const error = appointment.sent[kind]?.error;

  return (
    <span
      className={`mark ${state}`}
      title={error ? `${means}: ${error}` : means}
    >
      <b>{mark}</b> {label}
    </span>
  );
}

function loadSaved(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Appointment[]) : [];
  } catch {
    return [];
  }
}

/** Attach one send result to one appointment. */
function withRecord(
  appointments: Appointment[],
  id: string,
  kind: ReminderKind,
  result: SendRecord
): Appointment[] {
  return appointments.map((appointment) =>
    appointment.id === id
      ? { ...appointment, sent: { ...appointment.sent, [kind]: result } }
      : appointment
  );
}

/** A datetime-local input wants local wall-clock text, not an ISO string. */
function inputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
