# Template 1 of 2 — confirmation

Sent once, immediately, when the patient books.

Its ID goes in `.env` as `VITE_EMAILJS_TEMPLATE_CONFIRMATION`.

---

## Subject

```
Appointment confirmed — {{doctor_name}}, {{appointment_time}}
```

## To Email

```
{{to_email}}
```

## From Name

```
{{clinic_name}}
```

## Content

Paste the whole of **[`confirmation.html`](confirmation.html)**.

In the EmailJS content editor, switch to code view first (the `{ }` / `</>`
toggle above the editing area), or the HTML will be pasted as visible text
instead of being interpreted.
