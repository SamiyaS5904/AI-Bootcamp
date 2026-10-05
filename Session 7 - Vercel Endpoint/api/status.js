/**
 * GET /api/status?appointment_id=a29
 *
 * Returns the patient's live queue position and when their consultation is
 * likely to start. GET, because it only reads — safe for the app to poll.
 */

import {
  DOCTOR,
  NOW_SERVING,
  findAppointment,
  predictStart,
  reportedEtas
} from "../lib/data.js";

// Show a clock time like "16:33" instead of a raw timestamp.
function clock(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const { appointment_id } = req.query;

  if (!appointment_id) {
    return res.status(400).json({ error: "appointment_id is required" });
  }

  const appointment = findAppointment(appointment_id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const prediction = predictStart(appointment.token);

  return res.status(200).json({
    appointment_id: appointment.appointment_id,
    token: appointment.token,
    patient_name: appointment.patient_name,
    doctor: DOCTOR.name,
    department: DOCTOR.department,

    now_serving: NOW_SERVING,
    patients_ahead: prediction.patients_ahead,
    estimated_wait_minutes: prediction.wait_minutes,

    // A range, not a single time — consultation lengths vary.
    predicted_start: {
      earliest: clock(prediction.earliest),
      likely: clock(prediction.likely),
      latest: clock(prediction.latest)
    },

    // Filled in once the patient has sent their location to POST /api/location.
    departure: reportedEtas[appointment.appointment_id] || null,

    last_updated: new Date().toISOString()
  });
}
