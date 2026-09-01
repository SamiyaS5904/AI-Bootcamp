# Claude Design — Prompt 01 (v2): Panwar Knitwear single-page redesign

**Revision note.** v1 assumed a rich factory photo library and an 8-page site. Both assumptions were wrong. After downloading and inspecting every image on the source site, and after the client confirmed a single-page scope, this version is built around **29 real product photographs on a consistent dark charcoal background**, and a **one-page site plus one secondary catalogue page**.

**How to use:** copy everything between the two rulers and paste it into Claude Design as one message.

---

Design a complete **single-page website** for **Panwar Knitwear**, a knitwear manufacturer in Ludhiana, Punjab, India. One long, well-structured scrolling page with anchor navigation, plus one secondary page for the full product catalogue. Nothing more.

The current site is panwarknitwear.com and is being replaced entirely. Do not carry over its layout, its purple gradient, its tabbed brand boxes, or its structure.

## 1. Who this is for

This is a **B2B manufacturing site, not an online store.** No cart, no checkout, no prices, no "add to bag."

The visitor is a **wholesaler, retailer, distributor, corporate/institutional buyer or export agent** deciding whether this factory can produce 500–5,000 garments to their spec, on time, at a workable price. They are usually on a phone, usually comparing several Ludhiana manufacturers in the same hour, and impatient.

**The page has one job: turn an anonymous buyer into a qualified bulk enquiry.** WhatsApp and a phone call are the instant secondary paths and must be reachable from anywhere — Indian B2B buyers convert on WhatsApp far more readily than on forms.

Because this is one page, everything must be **immediately visible and scannable while scrolling**. Do not hide specifications behind tabs or accordions. Favour clear information density over airy minimalism — this buyer came for facts.

## 2. Real company facts — use these, invent nothing

- Established **2016**. **Ludhiana, Punjab, India.** Sole proprietorship, GST registered 2017. **26–50 employees.**
- Two in-house brands: **ZONIXA** (top wear — T-shirts, sweatshirts, hoodies) and **MSP Sports** (bottom wear — lowers, track pants, shorts, nikkar, capri).
- **Fabrics:** Spun Fleece, Dry Fit, Honeycomb Lycra, 100% Cotton, Cotton Lycra, NS Bonded, Russian Fleece, Sherpa.
- **Signature spec:** heavy **320 GSM** hoodies and sweatshirts. This number is a genuine selling point — most competitors work lighter. Feature it prominently.
- **In-house branding services, evidenced in the photography:** embroidered logos, woven labels, hang tags, chest prints, sleeve prints, digital prints, and branded poly-bag packaging.
- **Their own quality language:** smooth texture, skin-friendly, long-lasting, colourfast.
- **Their own selling points:** transparent dealings, customised options, affordable pricing, prompt delivery, well-equipped warehouse, wide distribution network.
- **Leadership:** founded by Mohar Singh Panwar; Prabhu Panwar and Bhala Ram Panwar, co-founders and CEOs.
- **Phones (all three are real — make every one tap-to-call, and wire WhatsApp to the first):**
  - +91 98760 45457
  - +91 98157 03769
  - +91 99999 82998
- **Instagram:** @panwarknitwear · **Facebook:** /Panwarknitwear1
- **Brand sites:** zonixa.com · mspsports.in
- **Listed on:** JustDial, IndiaMART, TradeIndia, Google Business, LinkedIn

**Do not invent** turnover, MOQ, lead times, monthly capacity, machine counts, certifications, export markets or client names. Where a layout needs one, show a visibly bracketed placeholder such as `{{MOQ}}` or `{{lead time}}` so it is obvious a real figure is still required. Same for the email address — the client has not supplied one yet, so use `{{email}}`.

## 3. The photography — read this before designing anything

This is the most important constraint. **You have exactly one usable image set**, and the design must be built around its actual character.

**What exists:** 29 product photographs, 982 × 1147 portrait, all shot on the **same dark charcoal textured floor**. Each frame shows a hero garment laid flat with a **stacked run of the same style in 4–6 colourways** beside it. Several include the branded ZONIXA poly-bag packaging printed with wash-care symbols. Garments visibly carry embroidered logos, woven labels, hang tags and chest prints.

**Design with the dark background, not against it.** The charcoal sits naturally next to the ink palette below, so these photographs placed in dark sections read as deliberate art direction. Do not mock up cutouts on white backgrounds — it will look worse and it will not match what gets built.

**Treat the colour-run stacks as a feature.** They answer a real buyer question — "what colours can I get?" — so crop and frame them so those stacks stay visible, rather than tightly cropping to the single hero garment.

**What does not exist, and must not be faked:**

- **No factory photography at all.** No knitting machines, no stitching line, no dyeing, no cutting, no QC, no packing floor. **Do not use generic stock factory photos as substitutes** — fake stock imagery is precisely the credibility problem this redesign exists to fix. The manufacturing section must be built **typographically and diagrammatically** instead: large numerals, rules, a spec-sheet grid, icons. Make that a deliberate, confident design choice, not an apology.
- **No MSP Sports photography.** There are zero images of lowers, track pants or shorts. Design the MSP Sports block to work **without product photos** — use a typographic treatment listing the range, and leave a clearly marked image slot for when the client supplies shots.
- **No fabric macro shots.** Build the fabric section as a spec sheet: fabric name, large GSM figure, one plain line on what it suits. Texture crops pulled from existing product photos may support it.
- **No leadership portraits.** Keep the leadership block typographic — names and roles set well. No fake headshots.
- The three existing "about" images on the old site are generic blue stock silhouettes at 500 × 160 px. **Discard them entirely.**

## 4. What is broken today — the design must visibly fix all of it

1. A contact popup **auto-opens on page load** and covers everything. → **Never use an auto-opening modal.**
2. **There is no hero section.** The page opens cold into two tabbed brand boxes. → Open with a real hero.
3. Nav is only Home / About / Contact — **no product catalogue.** → Products are central.
4. The published email is literally `email@example.com`. → Contact must look real and deliberate.
5. Copy is set in **Title Case On Every Single Word.** → Sentence case throughout.
6. **No B2B information whatsoever** — no MOQ, lead time, capacity or private-label offer. → These get prominent space.
7. **No trust signals** — no founding year, no team size, no scale. → Build a real trust layer.
8. Purple gradient plus mismatched Unsplash stock. → A coherent, owned identity.
9. Footer reads © 2024. → Current and maintained.
10. Not built mobile-first. → Mobile is designed properly.

## 5. Visual direction

**The feeling: a serious modern manufacturing partner — industrial confidence with textile warmth.** A well-run factory that also has taste. Structured, grid-driven, precise. Never a purple gradient template, never a fast-fashion D2C store, never a generic corporate stock-photo site.

### Colour

| Role | Hex | Use |
|---|---|---|
| Ink | `#14131A` | Hero, product sections, footer — the dominant surface |
| Warm off-white | `#F5F2ED` | Light sections — never pure white |
| Deep plum | `#4A2545` | Secondary dark surfaces, brand accents |
| Saffron / amber | `#D98324` | The single accent: CTAs, active filters, stat numbers, eyebrow labels |
| Warm grey | `#8A8378` | Secondary text, borders, dividers |

Deep plum is a deliberate evolution of their existing purple — it keeps brand recognition while dropping the dated gradient. **Use amber sparingly**: one confident highlight per view. Never for small body text.

Because the product photography is dark, the page should **lean dark overall** — ink as the primary surface, with warm off-white used for two or three deliberate breaks (the fabric spec sheet, the enquiry form) so the long scroll has rhythm.

### Typography

- **Headings:** Space Grotesk or Archivo — geometric, confident, slightly technical. Tight tracking at large sizes.
- **Body and UI:** Inter.
- **Eyebrow labels** above sections: uppercase, small, wide letter-spacing, amber — `WHAT WE MAKE`, `OUR FABRICS`, `PRIVATE LABEL`.
- **Scale:** hero headline 56–80px desktop, section headings 36–48px, body 16–18px. Obvious jumps between levels.
- **Numbers carry the design.** `2016`, `320 GSM`, `29 styles`, `8 fabrics` set large and typographic — with no factory photography available, this typographic weight is what makes the page feel substantial.

### Layout language

- Wide structured grid, max content width ~1320px.
- Sharp, small corner radii (4–8px). No pill buttons — too soft for a factory.
- Thin `1px` warm-grey rules and bordered cards for a technical, spec-sheet feel.
- Subtle knit texture overlay on dark sections — very low opacity, felt not seen.
- Because this is one long page, give each section a **clear visual identity** — alternating surfaces, distinct section headers — so the scroll never blurs into one undifferentiated column.

## 6. Artboards to produce

### Artboard 1 — The single page, desktop (full length)

**1. Header** — sticky, compact on scroll. Logo left. Anchor nav: Products · Fabrics · Manufacturing · Private label · About · Contact. A phone number visible in the header. Amber `Get a quote` button right.

**2. Hero** — ink background. A large product photograph used as an asymmetric block on one side (its charcoal ground blending into the section), headline and CTAs on the other. Headline states position plainly, e.g. *"Knitwear manufacturing from Ludhiana, since 2016."* One supporting line naming what they make and for whom. Two CTAs: `Request a quote` (amber solid) and `See our products` (outlined). No auto-popup, no carousel.

**3. Proof strip** — a thin band directly under the hero, four facts: **Est. 2016 · 26–50 person team · 320 GSM heavy knits · Private label ready**. Large amber numerals.

**4. What we manufacture** — 6 category cards, each using a real product photograph: Hoodies · Sweatshirts · T-shirts · Jackets · Track pants & lowers · Shorts. Each card carries the category name, a one-line description and a typical GSM range. The two bottom-wear cards have no photography yet — treat them typographically with a marked image slot.

**5. Our two brands** — a split section, both visible at once, never tabs. **ZONIXA** (top wear) backed by a real product photo; **MSP Sports** (bottom wear) as a typographic panel listing lowers, track pants, shorts, nikkar and capri, with a marked image slot. One sentence each, both linking out to zonixa.com and mspsports.in.

**6. Product showcase** — the visual centrepiece. A grid of the real product photographs on ink, with filter chips above: All · Hoodies · Sweatshirts · T-shirts · Jackets. Show around 12 on the page with a `View all 29 products` link to the catalogue page. Each card: photo, product name, fabric, GSM, and an `Enquire` action. Show one card in hover state with the enquire action revealed.

**7. Fabric library** — a warm off-white break in the dark scroll. All eight fabrics as a spec-sheet grid: fabric name, a large GSM figure, one plain-language line on what it suits. Spun Fleece · Dry Fit · Honeycomb Lycra · 100% Cotton · Cotton Lycra · NS Bonded · Russian Fleece · Sherpa. Ruled, technical, no stock imagery.

**8. How we manufacture** — ink section, **typographic and diagrammatic, no photography**. A numbered horizontal process flow: fabric sourcing → knitting → dyeing → cutting → stitching → printing & embroidery → quality check → packing → dispatch. Large numerals, thin connecting rules, short labels. Three capacity stats alongside using `{{...}}` placeholders. Make the absence of photos read as a confident technical diagram.

**9. Private label & OEM** — a large, deliberately prominent block; this is the highest-value service and is entirely missing today. Cover: your brand, your labels, your hang tags; screen, digital and DTF printing; embroidery; custom GSM and fabric; sampling before bulk; branded poly-bag packaging. **Anchor it with the product photos that show the ZONIXA poly-bag, woven labels and hang tags** — real evidence of the service, already in hand.

**10. Why buyers work with us** — six points from their real claims: transparent dealings, customised options, prompt delivery, in-house quality checks, well-equipped warehouse, wide distribution network. Icon plus a short line each.

**11. About** — company story since 2016 as a compact horizontal timeline: founded 2016 → GST registered 2017 → ZONIXA → MSP Sports → today. Leadership set typographically: Mohar Singh Panwar (founder), Prabhu Panwar and Bhala Ram Panwar (co-founders & CEOs). No fake portraits. A trust row of the listing logos — JustDial, IndiaMART, TradeIndia, Google, LinkedIn.

**12. Enquiry** — warm off-white. The RFQ form **directly on the page**, never behind a button. Fields: name, company, phone, email, product interest, quantity, branding required (print / embroidery / labels / none), delivery city, timeline, message. Beside it: all three phone numbers as tap-to-call, a green WhatsApp button, business hours, and the Ludhiana location.

**13. Footer** — ink. Company blurb, anchor links, both brand sites, all three phone numbers, Instagram and Facebook, the trade listings, address, and a dynamic copyright year.

Also design a **sticky WhatsApp + Call floating pair**, bottom right.

### Artboard 2 — The single page, mobile (375px)

The same story restacked. Hero type scaled but still bold. Category cards and the product grid as horizontal scroll rails. The process flow becomes vertical. **A fixed bottom bar with `WhatsApp` and `Call now`, always present.** Generous tap targets. The enquiry form single-column with comfortable field spacing.

### Artboard 3 — Products catalogue page, desktop (the one secondary page)

All 29 products. A filter rail or top filter bar: category, fabric, GSM range. Grid of product cards on ink. Result count. Each card has an `Enquire` action that carries the product name back to the enquiry form. Design the empty state too — a clear message and a reset action. **Also design the product quick-view modal** that opens on click: large photo, product name, and a spec block (fabric, GSM, fit, sizes, colourways visible in the photo, branding options, `{{MOQ}}`), plus an enquire action. Modal rather than 29 separate pages — it keeps the site to two pages.

### Artboard 4 — Design system sheet

Colour palette with hex values, type scale, buttons in all states (primary, secondary, ghost, disabled, hover), form fields with error and focus states, the product card, the category card, the filter chip in default and active states, the stat block, the eyebrow label, icon treatment, and the spacing scale.

## 7. Non-negotiables

- **No auto-opening popups or modals on load.** The single worst flaw of the existing site.
- **Sentence case for all copy.** Never Title Case Every Word.
- **No prices, no cart, no checkout.**
- **Only the 29 real product photographs.** No stock imagery anywhere — not for the factory, not for the team, not for fabrics. Where no photo exists, design typographically and mark the slot.
- **A path to enquire is visible from every screen** — header button, floating buttons, per-product actions, and the inline form.
- **All three phone numbers are real** — tap-to-call, with WhatsApp wired to the first.
- **Mobile is designed properly**, not squeezed down afterwards.
- Use `{{curly brace}}` markers for any figure not yet supplied, so they can never pass as real content.

---

## Follow-up prompts to run after this one

1. *"Show me three alternate hero directions — one with the product photo full-bleed behind the type, one split image/type, one large-typography editorial treatment with no photo at all."*
2. *"The manufacturing section has no photography. Show me two more treatments for it — one as a technical spec-sheet diagram, one as an oversized numbered vertical flow."*
3. *"Design the MSP Sports block three ways, all working without product photography."*
4. *"Give me contrast checks for the amber `#D98324` on ink `#14131A` at every text size used, and flag anything failing WCAG AA."*
