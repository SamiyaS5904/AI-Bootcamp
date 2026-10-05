/**
 * Mock data for the NextUp patient API.
 *
 * Note: Vercel functions are stateless, so this resets on a cold start.
 * That is fine for a demo. Swapping it for a real database means changing
 * only this file.
 */

export const HOSPITAL = {
  name: "Civil Hospital, Ludhiana",
  lat: 30.9010,
  lng: 75.8573
};

export const DOCTOR = {
  name: "Dr. Kaur",
  department: "General Medicine",
  avg_minutes_per_patient: 12
};

// The token the doctor is seeing right now.
export const NOW_SERVING = 26;

// Today's appointments.
export const APPOINTMENTS = [
  { appointment_id: "a27", token: 27, patient_name: "Harpreet Singh", status: "waiting" },
  { appointment_id: "a28", token: 28, patient_name: "Meena Devi",     status: "waiting" },
  { appointment_id: "a29", token: 29, patient_name: "Ramesh Kumar",   status: "waiting" },
  { appointment_id: "a30", token: 30, patient_name: "Anita Sharma",   status: "waiting" },
  { appointment_id: "a31", token: 31, patient_name: "Jaspreet Kaur",  status: "waiting" }
];

/** Look up one appointment by its id. */
export function findAppointment(appointmentId) {
  return APPOINTMENTS.find((a) => a.appointment_id === appointmentId) || null;
}

/** How many patients are still ahead of this token. */
export function patientsAhead(token) {
  return APPOINTMENTS.filter(
    (a) => a.token < token && a.status === "waiting"
  ).length;
}

/**
 * When this patient's consultation is likely to start.
 * Simple model: patients ahead x average consultation length.
 * The range is +/- 30%, because consultation lengths genuinely vary.
 */
export function predictStart(token) {
  const ahead = patientsAhead(token);
  const waitMinutes = ahead * DOCTOR.avg_minutes_per_patient;
  const now = Date.now();

  return {
    patients_ahead: ahead,
    wait_minutes: waitMinutes,
    likely: new Date(now + waitMinutes * 60000),
    earliest: new Date(now + waitMinutes * 0.7 * 60000),
    latest: new Date(now + waitMinutes * 1.3 * 60000)
  };
}

/** Saved by POST /api/location so reception can see who is on the way. */
export const reportedEtas = {};
