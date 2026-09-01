# SAINTS CREW — a menswear storefront, rebuilt

**AI Bootcamp · Day 2 · Task submission**

A ground-up redesign and rebuild of [saintscrew.co.in](https://www.saintscrew.co.in) — an
Indian direct-to-consumer menswear label selling knitwear, shirts and trousers.

The old store was a drag-and-drop website builder template with the demo content
still in it. This is a React storefront built from a written brief, with a
guided Style Assistant and a Size Finder as the reason to buy here instead of a
marketplace.

**Live locally:** `npm install && npm run dev` → http://localhost:5173

---

## 1. What was wrong with the old site

Before designing anything, I read the existing store. Every one of these is a
real finding from the live site, not a hypothetical:

| Found on saintscrew.co.in | Why it costs sales |
| --- | --- |
| `mailto:info@feyer.com` in the footer | Feyer is the template's demo brand. Nobody reads that inbox. |
| `tel:123-456-7890` | A placeholder phone number on a live commerce site. |
| "Name of street 12, Name of city, Post code 123" | The template's address, never replaced. |
| *"It all started with two guys who loved hats."* | The template's founding story. Saints Crew does not sell hats. |
| Header → real Instagram `@saintscrewoutfits`. Footer → generic `instagram.com` | Two sources of truth for one link. |
| WhatsApp link → `whatsapp.com` homepage | Goes nowhere useful. |
| Homepage: *"Free Shipping on orders over 6000"* · Shop page: *"over 600"* | The same promise, two different numbers, one page apart. |
| Three leftover demo products, including a "Knitted Hat" at ₹25 | Template stock mixed into the real catalogue. |
| No fabric, fit or care information on any product | The exact uncertainty that pushes people to Myntra instead. |

The last row is the actual business problem. Everything else is hygiene.

**The thesis of this rebuild:** men don't abandon small menswear sites because
the design is bad. They abandon them because they can't tell whether it will
fit, and returning something to an unfamiliar brand feels like a hassle. So the
entire store is organised around removing that doubt.

---

## 2. The rebuild

### Design direction

Quiet-premium menswear, not marketplace and not hype-streetwear. The test
applied to every screen: *does this look like a small, confident, independent
label — or a stock e-commerce template?*

| Token | Value | Where it's used |
| --- | --- | --- |
| `ink` | `#101012` | Hero, header, footer. Deliberately not `#000` — pure black reads cheap next to warm off-white. |
| `bone` | `#F6F2EC` | Page ground. Not `#FFF`, for the same reason. |
| `clay` | `#A85C3B` | The one colour that stands out: CTAs, prices, active states. Used sparingly. |
| `stone` | `#8C8579` | Secondary text, borders. |
| `moss` / `brick` | `#4C6B4F` / `#9C4B41` | Success and error, desaturated so they don't fight the palette. |

Type is **Fraunces** (editorial serif) for headings against **Inter** for
everything else — the serif is what stops it reading as another Tailwind
default. Hero steps 48px → 72px. Uppercase nav and eyebrow labels carry loosened
tracking. Radii cap at 8px; nothing is pill-shaped. Motion is 200ms ease
throughout — *precise, not playful*.

Every one of those values lives in exactly one place, `src/styles/index.css`, as
Tailwind v4 `@theme` tokens. **No component in this codebase contains a hex
value.**

### The two features that justify the site existing

**Style Assistant** — five tapped questions (category, occasion, fit, size,
budget) and you get three to five specific pieces back, each with a plain-language
reason: *"Regular fit, exactly as you asked, suits the office, in stock in M."*

Not a chatbot. Fixed choices, deterministic scoring, and every reason assembled
from real product fields — so it can never recommend something the catalogue
can't back up. It won't suggest a garment that isn't in stock in your size,
because that's the hesitation it exists to remove. Any single answer can be
changed from the results screen without redoing the flow.

**Size Finder** — give a chest or waist measurement, or your usual size
elsewhere, and it maps you onto the size chart **and shows its working**:

> A 40 inch chest puts you in our M, and a relaxed fit means one size up. Our L
> is cut for a 42 inch chest.

You can check the arithmetic yourself. That's the point — a size chart nobody
trusts is worse than none.

### Everything else built

Product grid with category / size / colour / price filters and three sort
orders · real bookmarkable `/shop/knitwear` URLs · empty states that name the
filter that emptied the grid · product cards with hover-swap, sizes at a glance,
sold-out and sale states · PDP with a 3-shot gallery, an explicit Fabric & Fit
block, a stock-aware size selector where out-of-stock sizes are genuinely
disabled, and related products chosen by real top↔bottom pairing logic · cart as
both a slide-out drawer and a full page, with a free-shipping progress bar ·
guest-first checkout with inline validation · wishlist with live availability ·
account · size guide · newsletter · full Privacy and Terms · a real 404.

Seventeen routes. All of them render.

---

## 3. Two bugs worth naming

**The ₹600 / ₹6000 bug can't recur.** The old site contradicted itself one page
apart because the number was typed twice. Here the free-shipping threshold lives
in one module, read through one hook, and *all* cart arithmetic lives in one
file (`features/cart/lib/pricing.ts`). The cart drawer, cart page, checkout
summary and Shipping page cannot disagree, because none of them does its own
maths.

**The Size Finder was wrong and got caught.** First version added "ease" inches
on top of a chart whose values already included the garment's ease — double
counting. A 40" chest came out as **XL**. Rewrote it as "find your size, then
step for fit preference", which also made the two input paths agree with each
other. Now: S / M / L for slim / regular / relaxed.

---

## 4. Honesty rules this codebase follows

The brief's hardest constraint was: *no placeholder content that could pass as
real, ever.* That was the old site's defining failure, so the rebuild enforces it
structurally:

- **Missing copy renders as a visible `{{TODO: copy needed — …}}` marker** in red
  monospace. It is impossible to mistake for finished text. There are 26 of them
  across the site right now, each naming the specific fact it needs.
- **Missing contact details produce no link at all.** A `PENDING` value in the
  config renders a TODO marker rather than falling back to `instagram.com`.
- **The brand story on `/about` is deliberately unwritten.** Four labelled facts
  with TODO markers, because inventing a founding story is exactly what the old
  site did.
- **Nothing claims a payment happened.** Checkout says no card is charged.

What *is* real: product names, prices and photography (extracted from the live
store), the Instagram handle, and every word describing how the store works —
those are facts about what was built, not claims about the brand.

**Placeholders currently in place**, to be swapped before launch:
`hello@saintscrew.co.in`, `+91 99999 99999`, and a size chart using standard
Indian grading rather than Saints Crew's own measured garments.

---

## 5. Stack

React 19 + Vite + TypeScript · React Router 7 · Tailwind v4 · shadcn/ui
primitives · Context for state (no Redux — the app doesn't justify it) ·
Supabase and Razorpay planned, not yet connected.

```
src/
  app/           router + providers
  components/    layout · ui primitives · shared
  config/        routes, brand identity (single source of truth)
  data/          catalogue, size chart, settings  ← the seam to Supabase
  features/      shop · product · cart · checkout · style-assistant ·
                 size-finder · wishlist · account · newsletter · content
  styles/        design tokens
supabase/        8 migrations + seed  (written, not applied)
```

`src/data/` is the whole swap point. Every query the UI needs goes through those
three modules, so moving to Postgres changes them and nothing else.

---

## 6. State of play

| | |
| --- | --- |
| **Working now** | Full UI, all 17 routes, catalogue, filters, PDP, cart, wishlist, Style Assistant, Size Finder. Cart and wishlist persist across reloads. |
| **Written, not connected** | Supabase schema — 15 tables across 8 migrations, RLS on every one, plus seed data. Never applied. |
| **Not built** | Payments (needs a Razorpay merchant account), auth, order records, transactional email. |
| **Verified** | `tsc` clean · `eslint` 0 errors · production build passes (364 KB JS / 110 KB gzipped) · zero runtime errors · zero broken images. |

Estimated **11–18 working days** to a live store, though the critical path is
external: Razorpay approval, photography, and legal copy, not engineering.

Decisions taken along the way — and the ones still open — are logged in
[`DECISIONS.md`](./DECISIONS.md). The full brief this was built against is
[`CLAUDE.md`](./CLAUDE.md).

---

## 7. Running it

```bash
npm install
```

```bash
npm run dev
```

Then walk it: **homepage → Style Assistant → a product → add to bag → checkout**.
Try `/shop` with the size filter set to `38` to see an empty state that explains
itself, `/size-guide` for the Size Finder, and `/product/black-and-white-geometric-sweater`
for a sold-out piece.

`npm run build` · `npm run lint` · `npm run typecheck`
