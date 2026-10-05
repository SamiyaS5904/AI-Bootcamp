/**
 * POST /api/location
 * Body: { "appointment_id": "a29", "lat": 30.85, "lng": 75.90 }
 *
 * Works out how long the journey takes and when the patient should leave.
 *
 * POST, not GET, for two reasons:
 *   1. Location is personal data, so it belongs in a body, not a URL that
 *      ends up in server logs and browser history.
 *   2. It changes server state — the arrival estimate is saved so reception
 *      can see who is actually on the way.
 */

import {
  HOSPITAL,
  findAppointment,
  predictStart,
  reportedEtas
} from "../lib/data.js";

const BUFFER_MINUTES = 8; // parking, walking in, reaching the counter

function clock(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
}

/** Straight-line distance between two points, in kilometres. */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimated driving time. Roads are not straight, so distance is multiplied
 * by 1.4, and 22 km/h is a realistic average city speed.
 * A real deployment would call the Google Maps Routes API here instead.
 */
function travelMinutes(lat, lng) {
  const km = distanceKm(lat, lng, HOSPITAL.lat, HOSPITAL.lng) * 1.4;
  return Math.max(5, Math.round((km / 22) * 60));
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { appointment_id, lat, lng } = req.body || {};

  if (!appointment_id) {
    return res.status(400).json({ error: "appointment_id is required" });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat and lng must be numbers" });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: "lat or lng is out of range" });
  }

  const appointment = findAppointment(appointment_id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const prediction = predictStart(appointment.token);
  const travel = travelMinutes(lat, lng);

  // Aim at the EARLIEST the turn could come, not the average — arriving late
  // can cost the whole day, arriving early costs a few minutes.
  const leaveBy = new Date(
    prediction.earliest.getTime() - (travel + BUFFER_MINUTES) * 60000
  );

  const minutesUntilLeaving = Math.round((leaveBy - Date.now()) / 60000);

  const result = {
    travel_minutes: travel,
    buffer_minutes: BUFFER_MINUTES,
    leave_by: clock(leaveBy),
    minutes_until_leaving: minutesUntilLeaving,
    advice:
      minutesUntilLeaving <= 0
        ? "Leave now."
        : `Leave in about ${minutesUntilLeaving} minutes.`
  };

  // Save it so reception knows this patient is on the way.
  reportedEtas[appointment_id] = result;

  return res.status(200).json({
    appointment_id: appointment.appointment_id,
    token: appointment.token,
    predicted_start: {
      earliest: clock(prediction.earliest),
      likely: clock(prediction.likely)
    },
    ...result,
    calculated_at: new Date().toISOString()
  });
}
