# Appointment Reminders — EmailJS

A mock clinic books an appointment and sends three emails: a confirmation straight
away, a reminder 30 minutes before, and a reminder 5 minutes before.

The point of the project is EmailJS, so everything else is kept small — one screen,
one dependency, five source files.

---

## What EmailJS is

A web page cannot send email on its own. Sending needs mail credentials, and anything
in a page can be read by anyone who opens devtools.

EmailJS holds the credentials instead. You connect your Gmail to it once, write the
email body on their dashboard with `{{placeholders}}` in it, and the page makes one
HTTPS call:

```js
emailjs.send(serviceId, templateId, { to_email, patient_name, ... });
```

EmailJS fills in the blanks and relays the mail through your account. It arrives from
your address.

So EmailJS owns **delivery**. It has no scheduling of any kind — every call sends
immediately — which is the interesting part of this project.

---

## How the timing works

Since EmailJS cannot schedule, the "when" is ours.

One `setInterval` in `App.tsx` ticks every 10 seconds and asks `schedule.ts` a single
question: *which emails are due and not sent yet?* Whatever comes back gets sent.

One loop rather than a `setTimeout` per email, because the loop:

- survives a page reload — appointments live in `localStorage`, and each send is
  recorded, so nothing goes out twice;
- survives laptop sleep and background-tab throttling — it just catches up on the
  next tick;
- cannot double-send, because it checks the stored record first.

All of that logic sits in `schedule.ts`, which is pure: no timers, no network, no
React, and `now` comes in as an argument. The same function would work unchanged
inside a server-side cron job if this ever outgrew the browser.

### The limits, stated plainly

**Reminders only fire while this tab is open.** There is no server. Close the tab and
nothing sends. The tracker marks such a reminder `missed` rather than pretending.

**Reminders already in the past at booking time are skipped.** Book 10 minutes ahead
and the 30-minute reminder never had a chance, so it is recorded as `skipped`.

**Late reminders are only sent for 5 minutes past their moment** (`CATCH_UP_MS`). An
email reading "leave in 30 minutes" is false if it turns up 20 minutes late, so past
that window it becomes `missed` instead.

**A failed send is not retried.** It shows as `✕` with the EmailJS error on hover.

---

## Setup

### 1. EmailJS dashboard

1. **Email Services** → add Gmail → connect → copy the **Service ID**.
2. **Account → API Keys** → copy the **Public Key**.
3. **Email Templates** → create **two** templates and copy both IDs.
4. **Account → Security** → add `http://localhost:5173` to the allowed origins.

Two templates cover all three emails, which is also the free plan's limit:

| Template | Sent when | Values it receives |
|---|---|---|
| confirmation | On booking | `to_email`, `patient_name`, `doctor_name`, `appointment_time`, `clinic_name` |
| reminder | 30 min and 5 min before | the same, plus `when` and `headline` |

The confirmation is a genuinely different email. The two reminders are the same email
with a different urgency line, so they share one template and differ only in `when`
("30 minutes" / "5 minutes") and `headline` ("Time to leave" / "You are next").

**The one setting people get wrong:** each template's **To Email** field must be
`{{to_email}}`, not a typed-in address. EmailJS only allows a changing recipient when
it comes from a template value.

A reminder template body might read:

```
{{headline}}

Hello {{patient_name}},

Your appointment with {{doctor_name}} is in {{when}}, at {{appointment_time}}.

— {{clinic_name}}
```

### 2. This project

```bash
npm install
cp .env.example .env    # then fill in the four values
npm run dev
```

The app shows a warning and disables the booking button until all four values are
present.

---

## Files

```
src/
├── main.tsx        mounts React
├── types.ts        Appointment, and the three email kinds
├── email.ts        everything EmailJS: init, template values, one send function
├── schedule.ts     pure: when each email is due, and what is due right now
├── App.tsx         booking form, tracker, and the one interval
└── index.css
```

`email.ts` and `schedule.ts` are deliberately separate, because they answer different
questions: *how do we send* and *when do we send*. EmailJS only answers the first.

### The data

```ts
type Appointment = {
  id: string;
  patientName: string;
  email: string;
  doctor: string;
  startsAt: string;   // ISO, so it survives localStorage
  sent: Partial<Record<ReminderKind, {
    status: "sent" | "failed" | "skipped";
    at: string;
    error?: string;
  }>>;
};
```

`sent` does two jobs at once: it is the "do not send this twice" guard, and it is what
the tracker displays. Due times are calculated from `startsAt`, never stored — a
stored time is one that can go stale.

### The tracker

One row per appointment, with three marks:

| Mark | Meaning |
|---|---|
| `✓` | sent |
| `·` | waiting, its moment has not come |
| `…` | sending now |
| `–` | skipped, already past when the appointment was booked |
| `✕` | failed — hover for the error EmailJS returned |
| `!` | missed, nothing was running when it came due |

---

## Trying it out

Use your own email address — that is the only inbox you can check.

1. Book something **35 minutes out**. The confirmation arrives within seconds and
   `confirmation` turns `✓`.
2. About 5 minutes later the 30-minute reminder arrives and `30 min` turns `✓`.
3. About 30 minutes in, the 5-minute reminder arrives.
4. **Nothing sends twice:** reload the page in between. Anything already `✓` stays
   `✓` and is not sent again.
5. **Skipped:** book 10 minutes out — `30 min` shows `–` rather than sending late.
6. **Missed:** book 10 minutes out, close the tab, come back after 20 minutes —
   `5 min` shows `!`. The failure is visible, which is the whole idea.

### Watch your quota

The free plan allows **200 sends a month**. Three emails per appointment is about 60
appointments — fewer once you count debugging, since every test spends real quota.

---

## Deploying

The build is plain static files, so any static host works. Vercel, using the same
`npx vercel` flow as Day 7:

```bash
npm run build      # check it builds first
npx vercel         # preview URL, accept the defaults
npx vercel --prod  # public URL
```

Vite needs no Vercel config here — it is auto-detected, and with no client-side router
there are no rewrites to set up.

**Two things will break it if you skip them.**

**1. Set the four environment variables in Vercel.** `.env` is gitignored and never
uploaded, so the deployed build has nothing to send with. Add them under
**Settings → Environment Variables**, or:

```bash
npx vercel env add VITE_EMAILJS_SERVICE_ID production
```

Then **redeploy**. Vite inlines `VITE_*` values at *build* time, not at run time, so
variables added after a build have no effect until the next one. A deploy that silently
sends nothing is almost always this.

**2. Add the deployed domain to EmailJS.** Account → Security → allowed origins, e.g.
`https://day-8.vercel.app`. The allowlist works off the browser's origin, so a domain
that is not on the list has every send rejected — even though it works on localhost.

If you import from GitHub instead of using the CLI, set **Root Directory** to `Day 8`
in the Vercel project settings, since the repository root holds all the bootcamp
folders.

---

## Security

**The public key is meant to be public.** Vite inlines every `VITE_*` value into the
built JavaScript, so `.env` keeps it out of git but not out of the bundle. Anyone can
read it in devtools. That is by design, not a mistake to hide.

What it lets someone do: send mail through your service, using your templates, from
your address, until your monthly quota is gone. Because the recipient is a template
value, they could also send clinic-branded mail to anyone.

The real defence is the **allowed-origins list** under Account → Security. It rejects
requests from other sites. Leave "allow non-browser applications" **off** — this app
only ever sends from the browser.

If this needed to be genuinely abuse-proof, sending would move to a server endpoint
holding the *private* key, with the browser calling that endpoint instead. `schedule.ts`
would not change.

Also worth knowing: patient names and emails sit in `localStorage` in plain text. Fine
for a mock project with made-up names and your own inbox. Not fine in production.

---

## Not included

No accounts, no database, no cancelling or rescheduling, and no sending while the tab
is closed.
