# NextUp — Patient API

Two endpoints from the NextUp project: a patient checks their live position in
the OPD queue, and finds out when to leave home.

```
nextup-api/
├── api/
│   ├── status.js      GET   — live queue position and predicted start time
│   └── location.js    POST  — travel time and recommended departure time
├── lib/
│   └── data.js        mock appointments and the prediction logic
├── server.js          local test server (Vercel does not use this)
└── package.json
```

---

## Run it locally

No installation needed — Node 18 or newer is enough.

```bash
node server.js
```

If port 3000 is already in use, the server moves to 3001 by itself and prints
the address it settled on. **Read that line** — the rest of these examples
assume 3000, so adjust the number if yours differs.

Open it in a browser:

```
http://localhost:3000/api/status?appointment_id=a29
```

To force a specific port, note that the syntax differs by terminal:

| Terminal | Command |
|---|---|
| Command Prompt | `set PORT=3005` then `node server.js` |
| PowerShell | `$env:PORT=3005; node server.js` |
| Git Bash / macOS / Linux | `PORT=3005 node server.js` |

The POST endpoint needs a body, so a browser address bar cannot call it.
Use curl:

```bash
curl -X POST http://localhost:3000/api/location -H "Content-Type: application/json" -d "{\"appointment_id\":\"a29\",\"lat\":30.85,\"lng\":75.95}"
```

---

## Deploy it to Vercel

Vercel turns every file in `/api` into its own serverless function, named after
the file. No configuration and no server code is required — `server.js` exists
only so the same handlers can be tested locally.

**1. Sign up** at vercel.com with your GitHub account.

**2. Deploy from this folder:**

```bash
npx vercel
```

The first run asks a few questions — accept the defaults, and choose this
folder as the project directory. It gives you a preview URL.

**3. Publish the production version:**

```bash
npx vercel --prod
```

You now have a public URL, for example
`https://nextup-api.vercel.app/api/status?appointment_id=a29`

**Deploying from GitHub instead**, which is easier to redo: push this folder to
a repository, then on vercel.com choose New Project, import the repository, and
accept the defaults. Every push to the main branch redeploys automatically.

---

## The two endpoints

### GET /api/status

Reads the queue. GET because it changes nothing, so the app can poll it safely.

| Input | Where | Required |
|---|---|---|
| `appointment_id` | query string | yes |

```json
{
  "appointment_id": "a29",
  "token": 29,
  "doctor": "Dr. Kaur",
  "now_serving": 26,
  "patients_ahead": 2,
  "estimated_wait_minutes": 24,
  "predicted_start": { "earliest": "18:20", "likely": "18:27", "latest": "18:35" },
  "departure": null,
  "last_updated": "2026-09-21T12:33:55.664Z"
}
```

`predicted_start` is a range rather than one time, because consultation
lengths genuinely vary. That range is what makes a departure time computable.

### POST /api/location

Works out when to leave. POST for two reasons: location is personal data and
belongs in a body rather than a URL that gets logged, and the call saves the
arrival estimate so reception can see who is on the way.

```json
{ "appointment_id": "a29", "lat": 30.85, "lng": 75.95 }
```

```json
{
  "token": 29,
  "travel_minutes": 40,
  "buffer_minutes": 8,
  "leave_by": "17:32",
  "minutes_until_leaving": -31,
  "advice": "Leave now."
}
```

The departure time is calculated from the **earliest** the turn could come,
not the average — arriving late can cost the whole day, arriving early costs
a few minutes.

### Error responses

| Code | When |
|---|---|
| 400 | `appointment_id` missing, or `lat`/`lng` not valid numbers |
| 404 | No appointment with that id |
| 405 | Wrong method, for example GET on `/api/location` |

---

## What this version does not do

Worth saying out loud rather than being caught on:

- **No authentication.** Anyone who guesses an appointment id can read it.
  A real version would check a signed-in patient against `appointment.patient_id`
  and return 403 otherwise.
- **No real database.** `lib/data.js` holds mock data in memory, and Vercel
  functions are stateless, so anything saved is lost on the next cold start.
- **No real traffic data.** Travel time is estimated from straight-line
  distance at an assumed 22 km/h. The real system calls the Google Maps
  Routes API here.
- **Simple prediction.** Patients ahead multiplied by an average consultation
  length, with a fixed ±30% range.
