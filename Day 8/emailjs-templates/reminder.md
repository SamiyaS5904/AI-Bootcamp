# Template 2 of 2 — reminder

Sent twice: 30 minutes before the appointment, and 5 minutes before.

Its ID goes in `.env` as `VITE_EMAILJS_TEMPLATE_REMINDER`.

One template serves both emails. `{{headline}}` and `{{when}}` are what differ —
`src/email.ts` fills them in per send. That is also why two templates is enough for
all three emails, which matters because the free plan allows exactly two.

---

## Subject

```
{{headline}} — your appointment is in {{when}}
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

Paste the whole of **[`reminder.html`](reminder.html)**.

In the EmailJS content editor, switch to code view first (the `{ }` / `</>`
toggle above the editing area), or the HTML will be pasted as visible text
instead of being interpreted.

---

## What the two sends look like

**30 minutes before**

> Subject: Time to leave — your appointment is in 30 minutes
>
> Time to leave
> Hello Ramesh Kumar,
> Your appointment with Dr. A. Mehta — General Medicine is in 30 minutes.

**5 minutes before**

> Subject: You are next — your appointment is in 5 minutes
>
> You are next
> Hello Ramesh Kumar,
> Your appointment with Dr. A. Mehta — General Medicine is in 5 minutes.
