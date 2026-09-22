# The two email templates

**These files are reference copies, not something the app reads.** Nothing in `src/`
loads them. They exist so the dashboard setup is written down somewhere and you are
not re-typing it from memory.

The real templates live on the EmailJS dashboard. Your code only ever refers to them
by ID. That split is the whole idea of EmailJS: the email text sits on their server,
so the browser never needs mail credentials.

## Creating them

For each of the two files here:

1. Go to **Email Templates** on the EmailJS dashboard → **Create New Template**.
2. Name it (the name is yours to choose — it is not the ID).
3. Copy the **Subject**, **To Email** and **From Name** from the `.md` file into the
   matching fields.
4. For **Content**, paste the whole matching `.html` file. Switch the content editor
   to code view first (the `{ }` / `</>` toggle above the editing area) — otherwise
   the HTML is pasted as visible text rather than being interpreted.
5. **Save.**
6. Open the template's **Settings** tab and copy the **Template ID**. It looks like
   `template_a1b2c3d`.
7. Paste that ID into `.env`:
   - `confirmation.md` → `VITE_EMAILJS_TEMPLATE_CONFIRMATION`
   - `reminder.md` → `VITE_EMAILJS_TEMPLATE_REMINDER`
8. Restart `npm run dev`. Vite only reads `.env` at startup.

## The part that silently breaks everything

The **To Email** field must contain exactly `{{to_email}}`.

If you type a real address there, every email goes to that one address no matter who
booked. If you leave it blank, sends fail. EmailJS only allows a changing recipient
when it comes from a template variable.

## Variables

Both templates receive these, from `sendEmail()` in `src/email.ts`:

| Variable | Example |
|---|---|
| `to_email` | `patient@example.com` |
| `patient_name` | `Ramesh Kumar` |
| `doctor_name` | `Dr. A. Mehta — General Medicine` |
| `appointment_time` | `Tue, 22 Sept, 4:07 pm` |
| `clinic_name` | `Model Town Clinic` |

The reminder template also receives:

| Variable | 30-minute email | 5-minute email |
|---|---|---|
| `headline` | `Time to leave` | `You are next` |
| `when` | `30 minutes` | `5 minutes` |

`when` is **measured when the email is sent**, not a fixed label — usually "30
minutes" and "5 minutes", but "27 minutes" if the send was delayed. Templates cannot
do arithmetic, so the subtraction happens in `timeUntil()` in `src/email.ts` and
arrives here as finished text.

A variable you reference in the dashboard but never send arrives empty. A variable you
send but never reference is ignored. Both fail quietly, so the names have to match
`src/email.ts` exactly.
