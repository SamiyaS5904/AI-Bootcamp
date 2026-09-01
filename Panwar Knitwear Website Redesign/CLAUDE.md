# CLAUDE.md — Panwar Knitwear Website Redesign

Single source of truth for this project. Read completely before planning, scaffolding, or writing code.

---

## 0. HARD RULES (non-negotiable)

1. **NEVER touch git or GitHub.** No `git add`, no `git commit`, no `git push`, no branches, no PRs, no remotes. Not even `git status` unless explicitly asked. The user manages version control personally.
2. **No placeholder content, ever.** The site being replaced ships `email@example.com` in production. Every phone number, email, address, product name and stat on the new site is real, or is marked `{{TODO: ...}}` in a way that could never be mistaken for real content.
3. **Document every prompt.** Every user prompt gets an entry in `DOCUMENTATION.md` (purpose, output, duration, tokens, decisions) before the turn ends. See Section 9.
4. **Ask before scope changes.** Every feature must map to Section 5. No silent additions.

---

## 1. What We Are Building

A complete redesign of **panwarknitwear.com** — the website of Panwar Knitwear, a knitwear manufacturer in Ludhiana, Punjab, India (est. 2016).

**This is a B2B manufacturer site, not a D2C store.** Nobody buys a single hoodie here. The visitor is a wholesaler, retailer, distributor, corporate/institutional buyer or export agent, evaluating whether Panwar Knitwear can reliably produce 500–5,000 pieces to spec, on time, at a workable price.

**The job of the site:** turn an anonymous buyer into a qualified enquiry. It must answer, without the visitor having to ask:

- What exactly do you make? (categories, GSM, fabrics, fits, sizes)
- Can you handle my volume? (capacity, MOQ, lead time, team size, machinery)
- Can you do *my* branding? (private label / OEM / custom printing and embroidery)
- Are you real and reliable? (factory photos, years in business, leadership, listings, GST)
- How do I get a quote? (one obvious, low-friction path, everywhere)

**No cart. No checkout. No payments.** The primary conversion is a **bulk enquiry / RFQ (request for quote)**, plus WhatsApp and phone as instant secondary paths — Indian B2B buyers convert on WhatsApp far more than on forms.

---

## 2. What Is Wrong With The Current Site (the problem we are solving)

Verified by inspecting https://panwarknitwear.com on 2026-09-01:

| # | Problem | Consequence |
|---|---------|-------------|
| 1 | A **contact modal auto-opens on page load**, covering the content | The visitor's first experience is dismissing a popup before seeing anything |
| 2 | **No hero section at all** — the page opens straight into two tabbed brand blocks | No positioning statement, no idea what the company does above the fold |
| 3 | Nav is only **Home / About / Contact** | No product catalog, no capabilities page, no way to browse |
| 4 | Contact email is literally **`email@example.com`** | Destroys credibility instantly for a serious buyer |
| 5 | **Page renders blank on scroll** after the modal is dismissed | The site appears broken |
| 6 | Body copy is in **Title Case On Every Single Word** | Reads amateur, hurts readability |
| 7 | Product photos are **shot on a floor / carpet**, inconsistent lighting | Looks like a WhatsApp catalogue, not a manufacturing partner |
| 8 | **Zero B2B information**: no MOQ, no lead time, no capacity, no OEM/private-label offer, no certifications | The buyer has to ask basic qualifying questions, so most just leave |
| 9 | **No trust signals**: no factory imagery, no year founded, no team size, no scale numbers | Nothing separates them from a middleman |
| 10 | Generic purple/magenta gradient, stock Unsplash lifestyle images mixed with real product shots | No coherent brand identity |
| 11 | Footer says **© 2024** | The site reads as abandoned |
| 12 | Not built mobile-first | Most Indian B2B traffic is mobile |

**The redesign must visibly fix every row in this table. This table is the acceptance criteria.**

---

## 3. Real Company Facts (verified — use these, invent nothing)

- **Name:** Panwar Knitwear
- **Established:** 2016
- **Location:** Ludhiana, Punjab, India (New Shakti Nagar / Sunder Nagar area)
- **Legal status:** Sole proprietorship, GST registered (2017)
- **Team size:** 26–50 people
- **Brands:**
  - **ZONIXA** — top wear: T-shirts, sweatshirts, hoodies
  - **MSP Sports** — bottom wear: lowers, track pants, shorts, nikkar, capri
- **Leadership:** Founded by Mohar Singh Panwar. Prabhu Panwar and Bhala Ram Panwar are co-founders and CEOs. Online presence managed by Rohitash Panwar.
- **Fabrics:** Spun Fleece, Dry Fit, Honeycomb Lycra, 100% Cotton, Cotton Lycra, NS Bonded, Russian Fleece, Sherpa
- **Known product lines:** Heavy 320 GSM round-neck hoodies (with logo / with chest print), two-thread fleece round-neck hoodies, 320 GSM heavy zip hoodies, dry-fit Ben-collar half-sleeve T-shirts, men's and boys' lowers, sweatshirts, men's shorts, round-neck T-shirts
- **Quality claims (their own words):** smooth texture, skin-friendliness, longevity, colourfastness
- **Stated advantages:** transparent dealings, customised options, affordable pricing, prompt delivery, well-equipped warehouse, wide distribution network
- **Phones:** +91 98760 45457 · +91 98157 03769 · +91 99999 82998
- **Email:** `{{TODO: real email needed}}` — **confirmed by HTML inspection on 1 Sep 2026 that no real email exists anywhere on the source site.** There is no `mailto:` link in the markup; the only address present is the literal string `email@example.com`. This must come from the client.
- **Social:** Instagram @panwarknitwear · Facebook /Panwarknitwear1
- **Brand sites:** zonixa.com · mspsports.in
- **Listings:** JustDial, IndiaMART, TradeIndia, TextileInfomedia, Google Business, LinkedIn

Facts we do **not** have and must not invent: annual turnover, exact MOQ, exact lead times, monthly production capacity, machine count, certifications (ISO / OEKO-TEX / GOTS), export markets, client names. These get `{{TODO}}` placeholders and are flagged to the user for real numbers.

---

## 4. Tech Stack (fixed — do not add anything outside this without asking)

- **Build tool:** Vite
- **Framework:** React 19 (plain SPA, not Next.js)
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui primitives (copy-in), Lucide icons
- **State:** React Context + hooks only. No Redux / Zustand.
- **Backend:** Supabase — Postgres for enquiries and product catalogue, Storage for images, RLS on the enquiries table (public insert, no public read)
- **Forms:** react-hook-form + zod validation
- **Animation:** **Framer Motion** for the scroll-pinned production sequence, staggered reveals and filter layout transitions; plain CSS for hovers, the fabric marquee and the pulse ring. (Upgraded from "CSS only" on 1 Sep 2026 — the scroll-driven production line genuinely requires it. See `design/CLAUDE-DESIGN-PROMPT-02.md`.)
- **Hosting:** static build, Netlify or Vercel

Matches the stack already used in `../DAY - 2`. No CMS, no GraphQL, no microservices.

---

## 5. Scope — Pages and Features

### 5.1 Pages — SINGLE-PAGE SCOPE

The client confirmed this is a **single-page project**, with at most one or two additional pages. Final structure:

| Route | Purpose |
|---|---|
| `/` | **The site.** One long scrolling page with anchor navigation: hero → proof strip → categories → brands → product showcase → fabrics → manufacturing process → private label/OEM → why us → about & leadership → enquiry form → footer |
| `/products` | The one secondary page: all 29 products, filterable by category / fabric / GSM |

Product detail is a **quick-view modal** on the catalogue page, not 29 separate routes — this keeps the whole site to two pages.

Anchor nav in the header: Products · Fabrics · Manufacturing · Private label · About · Contact.

### 5.2 Core Features

1. **Bulk enquiry / RFQ form** — product interest, quantity, target GSM/fabric, branding needed (print / embroidery / label), delivery city, timeline, name, company, phone, email. Saves to Supabase. This is the primary conversion.
2. **Sticky WhatsApp and Call buttons** — floating on desktop, a fixed bottom bar on mobile. WhatsApp wired to **+91 98760 45457** via `https://wa.me/919876045457` with a pre-filled enquiry message. All three numbers are tap-to-call `tel:` links.
3. **Product catalogue with real filters** — category, fabric, GSM range. Real empty states. ~12 products shown inline on the home page with a link to all 29.
4. **Per-product enquiry** — "Enquire about this product" pre-fills the RFQ with that product name, and scrolls to the on-page form.
5. **Fabric library** — each of the 8 fabrics explained in plain language: what it is, what it suits, typical GSM.
6. **Manufacturing process section** — a visual step flow: fabric sourcing → knitting → dyeing → cutting → stitching → printing/embroidery → QC → packing → dispatch.
7. **Private label / OEM section** — stated explicitly, because it is the highest-value service and is completely absent today.
8. **Trust block** — established 2016, team size, GST registered, platform listings, factory photos.
9. **Fully responsive, mobile-first.**
10. **Real SEO** — per-route meta tags, LocalBusiness / Organization schema, honest local keywords ("t-shirt manufacturer in Ludhiana", "hoodie manufacturer Punjab").

### 5.3 Explicitly Out Of Scope

Cart, checkout, payments, user accounts, login, wishlist, multi-language, AI chatbot, blog, admin dashboard beyond Supabase's own table view.

---

## 6. Design Direction

The full visual spec lives in `design/DESIGN-BRIEF.md` and is produced via Claude Design. Summary:

**Vibe:** a serious, modern manufacturing partner — industrial confidence with textile warmth. A well-run factory that also has taste. Not a purple gradient template. Not a fast-fashion D2C store. Not a stock corporate site.

**Palette (working direction):**

- Ink `#14131A` — dark sections, hero, footer
- Warm off-white `#F5F2ED` — light sections (never pure white)
- Deep plum `#4A2545` — evolved from their existing purple, keeps brand equity
- Saffron / amber `#D98324` — the single accent; CTAs, active states, stat highlights
- Warm grey `#8A8378` — secondary text, borders

**Type:** a confident geometric / grotesque sans for headings (Space Grotesk or Archivo), Inter for body. Large hero type, generous hierarchy, loosened uppercase tracking on eyebrow labels.

**Imagery — use only what actually exists.** Full audit in [`assets/IMAGE-INVENTORY.md`](assets/IMAGE-INVENTORY.md). Summary:

- **29 real product photographs** (982 × 1147, in `assets/source-images/`) are the entire usable image library. All shot on the same dark charcoal floor, each showing a hero garment flat plus a stacked colour run, several with branded ZONIXA poly-bag packaging, woven labels and hang tags visible.
- **Design with that dark background, not against it.** Charcoal sits naturally against ink `#14131A`, so these photos in dark sections read as deliberate art direction. Do not cut them out onto white.
- **The colour-run stacks are a feature, not clutter** — they answer "what colourways can I get?", which is exactly what a bulk buyer wants. Frame crops so the stacks stay visible.
- **No factory, MSP Sports, fabric-macro or leadership photography exists.** Those sections are built **typographically and diagrammatically**, with clearly marked empty image slots.
- **No stock imagery anywhere, ever.** Substituting generic stock factory photos would recreate the exact credibility problem this redesign exists to fix. The three existing "about" images are 500 × 160 blue stock silhouettes — discarded entirely.

**The standard for every screen:** does this look like a manufacturer a buyer would trust with a ₹10-lakh order — or does it look like a template? If the latter, redo it.

### 6.1 Motion

Full spec in `design/CLAUDE-DESIGN-PROMPT-02.md` and, once the canvas is generated, on its motion specification artboard.

**The principle: heavy, deliberate, confident.** The signature product is a 320 GSM hoodie — the motion should feel like that weight. Nothing bouncy, springy or elastic.

- Section reveals: 800–1200ms, `cubic-bezier(0.16, 1, 0.3, 1)`, fading up from 16–24px. Never fade in place.
- Grouped items stagger 90–120ms apart. Reveal once, then stay — never re-animate on scroll back.
- Hovers 250–350ms. Count-ups 1600–2000ms. Ambient loops 3–8s.
- Parallax on images only, 8–12% maximum. **Never on text.**
- **`prefers-reduced-motion` is mandatory**, not optional. Every animation needs a static fallback, and the pinned production section must release its pin entirely.
- Animate `transform` and `opacity` only.

**The signature moment** is the production process section: a stitch-line thread that draws itself through the nine steps as the visitor scrolls, lighting each step in turn. This is the one place the knitwear metaphor is literal, and it is the thing the page should be remembered for.

**The floating WhatsApp and call buttons** carry a slow 3s pulse ring and appear only after roughly one viewport of scrolling — never on load. They are buttons, not a modal; the no-auto-popup rule in §8 stands and must not be worked around.

---

## 7. Content Rules

- Sentence case for all body copy. **Never Title Case Every Word.**
- Buyer-first language: quantities, lead times, specs, materials — not marketing adjectives.
- Every claim must be backed by a real fact from Section 3 or marked `{{TODO}}`.
- Every section ends with a clear next action.
- The copyright year is generated dynamically, never hardcoded.

---

## 8. Non-Functional Requirements

- **Mobile-first.** Every feature works on a small screen before desktop polish counts as done.
- **Performance:** compressed and responsive images, lazy-load below the fold, lean bundle.
- **Accessibility:** real alt text, WCAG AA contrast (verify amber `#D98324` — use it for large elements and buttons, not small body text), keyboard-navigable forms and modals, visible focus states.
- **No auto-opening popups. Ever.** This is the single worst flaw of the existing site.

---

## 9. Documentation Protocol (mandatory)

`DOCUMENTATION.md` is maintained continuously, not retrofitted. After every user prompt, append an entry with:

number · date and time · the user's prompt · its **purpose** · what Claude did · deliverables with file paths · **duration** · **tokens** · decisions made · open questions

Duration and tokens are recorded as **estimates** unless the user supplies exact figures from `/cost` or the status line — exact per-turn counts are not readable from inside the session, and estimates are always labelled as such rather than presented as measured. Do not skip an entry; do not batch entries at the end of a session.

---

## 10. Working Style

- Plan before building; confirm the approach on anything non-trivial.
- Prefer fewer, well-executed features over many shallow ones.
- Flag drift toward unnecessary complexity immediately.
- Report honestly: if something is unverified, incomplete or assumed, say so plainly.
