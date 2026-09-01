# Decisions

Build decisions that CLAUDE.md explicitly asks to be confirmed rather than
assumed away, plus anything where the blueprint left a genuine choice open.
CLAUDE.md stays the source of truth for *what* we're building; this records
*what was chosen* where it allowed more than one answer.

Newest first. Each entry states the decision, why, and what it commits us to.

---

## 2026-08-27 — Foundation scaffold

### 1. Transactional email: Supabase Custom SMTP, no separate email vendor

**Asked by:** CLAUDE.md §5.5 — "flag this as a build decision to confirm, not
something to skip silently".

**Decision:** stay within Supabase. One set of SMTP credentials serves both
paths:

- **Auth emails** (signup confirmation, password reset) — Supabase Auth's
  built-in flow, per §5.9. Configured in the dashboard under
  Authentication → Emails → SMTP Settings.
- **Order confirmation** (§5.5) — a Supabase Edge Function sending over those
  same SMTP credentials.

**Why this shape:** Supabase Auth has no API for arbitrary transactional mail —
it only sends its own auth templates — so it cannot send an order confirmation
on its own. Custom SMTP is the piece that covers both without introducing
Resend/Brevo/SendGrid as a fourth vendor. It is also needed regardless: the
default Supabase sender is rate-limited to a handful of emails per hour and is
not usable in production.

**Commits us to:** SMTP credentials for the brand mailbox
(`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM_EMAIL`, see
`.env.example`). **Blocked** until the brand mailbox exists — the same gap that
leaves `siteConfig.contact.email` pending. Order confirmation email cannot be
built before then; the confirmation *page* is unaffected.

**Revisit if:** deliverability over raw SMTP turns out to be poor, or we want
open/click tracking. Swapping in a provider later touches one Edge Function.

---

### 2. SEO pre-rendering: deferred

**Asked by:** CLAUDE.md §7 — "flag this as a decision point rather than assuming
it away".

**Decision:** ship as a client-rendered SPA for now. No pre-rendering.

**Consequence, stated plainly:** crawlers that don't execute JavaScript see only
`index.html`. Google does run JS and will index the site; some others won't.
Per-route `<title>`/`<meta>` via `src/components/common/Seo.tsx` is already in
place and correct for crawlers that do.

**Revisit if:** organic search becomes a real acquisition channel. The fix is
`vite-plugin-prerender` over the homepage, `/shop`, the three category routes
and every PDP at build time. It needs no change to `Seo.tsx` or to any page
component, so deferring costs nothing but time-to-index.

---

### 3. `site_config` values: confirmed

**Asked by:** seeded values in
`supabase/migrations/20260827120500_style_assistant_newsletter_config.sql` were
marked pending brand confirmation.

**Decision — confirmed as real values, not placeholders:**

| Key | Value | Shown to customers in |
| --- | --- | --- |
| `free_shipping_threshold_inr` | `2000` | Cart progress bar, PDP, Shipping & Returns |
| `standard_shipping_fee_inr` | `99` | Cart, checkout summary |
| `returns_window_days` | `7` | Shipping & Returns, order confirmation |

**Commits us to:** reading all three from `site_config` at every display site.
Never hardcode any of them in a component — §5.3 exists because the previous
site showed ₹600 in one place and ₹6000 in another. Changing a value is a row
edit, no redeploy.

---

### 4. Newsletter incentive: early access, not a discount

**Asked by:** CLAUDE.md §5.11 requires a stated incentive; §8 forbids promising
what the system can't deliver.

**Decision:** keep the current copy — *"First access to new drops — before they
go live to everyone else."* No percentage discount offered.

**Why:** a discount promise obliges us to actually issue a code. The
`newsletter_subscribers.discount_code` column exists but nothing generates
codes, so "10% off your first order" would be a promise with a null code behind
it — precisely the §8 failure.

**Commits us to:** if this copy ever changes to an offer, build code generation
in the same change. The migration comment on `discount_code` says so at the
schema level too.

---

## Still open

Not decisions anyone has been asked for yet — listed so they don't get lost:

- **Google OAuth** — §2 and §5.9 both say "optionally". Email/password only for
  now unless asked.
- **Pincode auto-suggestion at checkout** — §5.4 says "if feasible". Needs a
  pincode dataset or an India Post API call; no source picked.
- **Reference-brand dropdown in the Size Finder** — §5.7 says "if feasible,
  otherwise a simple chest/waist measurement input". No brand size data sourced,
  so the Size Finder currently offers "measure yourself" or "pick your usual
  Saints Crew size", not a brand list.
- **Static host** — §2 allows Vercel or Netlify. Either works; nothing depends
  on the choice yet.

### Opened by the 2026-08-27 UI-only build

- **Supabase project** — none exists. No project ref, no keys, no `config.toml`,
  no CLI login, and Docker is unavailable so `supabase start` is not an option
  either. The migrations and `supabase/seed.sql` are written and reviewed but
  **have never been applied**. Everything below depends on this.
- **Anonymous auth must be enabled** in the Supabase project before guest carts
  and guest checkout can work, since ownership is `auth.uid()` throughout.
- **Style Assistant backend** — §5.6 specifies an Edge Function calling the
  Anthropic API. Deferred by request; matching currently runs in the browser
  (`src/features/style-assistant/lib/recommend.ts`) against the local catalog.
  The `Recommendation[]` contract is the seam, so swapping it in later does not
  touch the results screen.
- **Razorpay merchant account** — checkout collects and validates details but
  takes no payment and creates no order.
- **Real size chart** — the grading in `src/data/sizeChart.ts` and `seed.sql` is
  standard Indian menswear sizing, not Saints Crew's measured garments. The Size
  Finder's answers are only as good as this table.
- **Product photography and copy** — every sample product carries generated SVG
  placeholder images and `{{TODO}}` description/fabric/care fields.
- **Cart and wishlist persistence** is `localStorage` for now, so neither
  follows a customer between devices.
- **Search** — the header search icon has no overlay behind it. §4 lists the
  icon but §5 never specifies search behaviour, so it needs a scope decision.
- **Back-in-stock notification** — the PDP says every size is sold out but
  offers no way to be told when it returns. Out of scope until asked.
