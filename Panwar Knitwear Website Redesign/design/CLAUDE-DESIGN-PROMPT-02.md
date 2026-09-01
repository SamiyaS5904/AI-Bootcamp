# Claude Design — Prompt 02: motion, texture and brand character

**Context.** Prompt 01 (`CLAUDE-DESIGN-PROMPT.md`) produced a structurally correct single-page design: right sections, right information, right palette. The verdict was *decent, but too plain* — it reads as a competent layout rather than as a brand. This prompt is a **refinement pass on the existing canvas**, not a restart.

**Do not change:** the palette, the single-page structure, the section order, the copy, or the 29 real product photographs. Everything below is added on top of what already exists.

**How to use:** run this in the same Claude Design canvas as prompt 01, so it edits the existing artboards rather than starting fresh.

---

Refine the Panwar Knitwear single-page design. The structure and content are right; what is missing is **motion, texture and brand character**. Right now it reads like a well-organised layout. It needs to read like a real, established Ludhiana knitwear house that happens to have excellent taste.

## 1. The feeling we are aiming for

**Heavy, deliberate, confident.** This factory's signature product is a **320 GSM hoodie** — a genuinely heavy garment. The motion should feel like that: substantial, slow, settling into place with weight. Nothing bouncy, nothing springy, nothing that pings or pops elastically. Think a heavy fabric bolt being unrolled, not a UI toy.

The reference points are premium industrial and textile brands — the confidence of a manufacturer that has been doing this since 2016 and does not need to shout. **Classier, but not cold.** It should still feel like Ludhiana: a working textile city with real craft in it, not a Silicon Valley SaaS page.

## 2. The motion system — define this first, apply it everywhere

Create a single, consistent motion language and use it across the whole page. Inconsistent animation is what makes a site feel cheap.

**Timing.** Slow is the whole point here.

| Motion | Duration | Easing |
|---|---|---|
| Section reveal on scroll | 800–1200ms | `cubic-bezier(0.16, 1, 0.3, 1)` — a long, decelerating settle |
| Staggered children within a section | 90–120ms between items | same |
| Hover / micro-interaction | 250–350ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Number count-up | 1600–2000ms | ease-out |
| Ambient / looping motion | 3000–8000ms | linear or gentle sine |

**Rules.**

- Everything **fades up from 16–24px** as it enters. Never fade in place, never slide sideways.
- Stagger everything that comes in groups — cards, list items, process steps.
- Reveal **once** on first scroll into view, then stay. Do not re-animate on scroll back up; it gets irritating fast.
- **No parallax on text, ever.** Parallax only on images, and gently — 8–12% maximum drift.
- **Respect `prefers-reduced-motion`.** Design a reduced state where everything is simply present, with opacity transitions only. Show this on the motion spec board.

## 3. The production steps — this is the signature moment of the page

The nine-step process flow (fabric sourcing → knitting → dyeing → cutting → stitching → printing & embroidery → quality check → packing → dispatch) is currently a static row of numbers. **Turn it into the most memorable thing on the site.**

**The core idea: a thread that stitches itself through the process.**

A continuous line — drawn as a **yarn or stitch line, not a plain rule** — runs through all nine steps. As the visitor scrolls through the section, that thread **draws itself forward**, step by step, like a seam being sewn. This is the one place where the knitwear metaphor should be literal, and it is worth doing properly because it is genuinely on-brand for a knitting factory.

**How it behaves:**

- The section is **scroll-driven and pinned** — the section holds while the thread advances, so the visitor scrolls *through* the production line rather than past it. Slow: the full sequence should take a comfortable, unhurried scroll, never a flick.
- The thread is rendered as a **stitch path** — short dashes with the look of a running stitch, or a subtle chain-stitch loop — in **amber `#D98324`**, drawing along a warm-grey track.
- As the thread reaches each step, that step **activates**: its large numeral (`01`–`09`) brightens from warm grey to off-white, the step label fades up, and a short one-line description appears beneath it. Previously completed steps stay lit; upcoming steps stay dim. At any moment the visitor can see exactly where they are in the line.
- Each activation is **staggered and unhurried** — roughly 400–600ms of scroll per step.
- Give the currently active step a **very subtle ambient pulse** on its numeral so the live step is obvious.
- **Desktop:** the thread runs horizontally, the section pinned while it advances. **Mobile:** the same sequence rotated vertical, the thread running down the left edge with steps stacked beside it — a scroll-progress spine.

**Also design the static end state** — how the section looks once every step is lit — because that is what a visitor sees on scroll-back and what appears with reduced motion on.

## 4. The floating WhatsApp and call buttons — make them pop, properly

This is the primary instant-conversion path and it should be impossible to miss without being obnoxious.

**Desktop — an expanding cluster, bottom right:**

- **Resting state:** a single circular **amber** button carrying a chat icon.
- **On hover:** it expands upward into two labelled pills — **WhatsApp** (in WhatsApp green `#25D366`, with the WhatsApp glyph) and **Call now** (ink with an amber border, phone glyph). They spring out with a **60ms stagger**, each sliding up and fading in. Labels are visible on expansion, not icon-only guesswork.
- **Ambient pulse:** a slow **3s** concentric ring expanding outward from the WhatsApp button and fading — one ring, low opacity, continuous. This is the "popping" element. It must read as a gentle heartbeat, never as a flashing alert.
- **Entrance:** the cluster **does not appear on page load.** It scales and fades in after the visitor has scrolled roughly one viewport — so it arrives as a helpful offer once they are engaged, rather than as another popup. This matters: the old site's auto-opening modal is the single worst thing about it, and we are not repeating that pattern in a new costume.

**Mobile — a fixed bottom bar:**

- Two large tap targets side by side: **WhatsApp** (green, filled) and **Call** (amber, filled). Full labels, generous height, safe-area padding at the bottom.
- Same slow pulse on the WhatsApp half.
- The bar **slides down out of the way** when the enquiry form is in view — the visitor is already converting, so do not cover the form.

Design **all states** on the artboard: resting, hover, expanded, mobile bar, and the form-in-view hidden state.

## 5. Texture and brand character — this is what fixes "too plain"

Concrete additions, not vague polish:

**A knit-stitch motif as a brand device.** Build a small repeating stitch or loop pattern from the knitwear vocabulary, and use it deliberately: as a very low-opacity texture on ink sections, as section dividers, and as the visual language for the production thread in section 3. One motif, used consistently, is what turns a layout into an identity.

**A fabric marquee.** A slow, continuously scrolling horizontal band listing the eight fabrics — `SPUN FLEECE · DRY FIT · HONEYCOMB LYCRA · 100% COTTON · COTTON LYCRA · NS BONDED · RUSSIAN FLEECE · SHERPA` — in large outlined or ghosted type, drifting at a genuinely slow pace (roughly 40–60s per full loop). It is modern, it adds movement to an otherwise still page, and it does real work by showing the fabric range. Place it as a transition band between two sections.

**Oversized section numerals.** Number the sections `01`–`09` in very large, low-opacity type set behind or beside each section heading. Editorial, technical, and it gives the long scroll a spine.

**A vertical running label** down one page edge — `PANWAR KNITWEAR · LUDHIANA · EST. 2016` in small letter-spaced uppercase, rotated. A small detail that reads as considered.

**Count-up statistics.** The proof-strip numbers — `2016`, `320` GSM, `29` styles, `8` fabrics — count up when they scroll into view, over roughly 1800ms. Make the numerals large enough to carry the section on their own.

**A Ludhiana signal, handled with restraint.** Set **ਲੁਧਿਆਣਾ** in Gurmukhi small beside the English "Ludhiana" — in the hero eyebrow or the footer, **once, in exactly one place**. Typographic and quiet. This is the detail that makes it a Punjab manufacturer rather than a generic template. Do not add motifs, patterns, mandalas, or anything ornamental beyond this — restraint is what keeps it classy.

**Grain and depth.** A fine film-grain overlay at very low opacity across dark sections, to stop large ink areas reading as flat digital black. Layer cards with real elevation — soft, wide, low-opacity shadows, not hard drop shadows.

## 6. Elevate specific sections

**Hero.** The headline reveals **line by line with a mask-up**, each line sliding up from behind an invisible edge, staggered ~120ms. The product photograph gets a **very slow ambient drift** — 20s, 3–4% scale, imperceptible frame to frame but alive. Add a small scroll-cue at the bottom that fades out once scrolling starts.

**Product grid.** Cards reveal on a **stagger**. On hover: the photograph scales slowly to 1.04 over 400ms, the amber `Enquire` bar rises up from the bottom edge of the card, and a thin amber rule draws across the top. Because these photos contain **colour-run stacks**, consider revealing a small row of colour dots on hover, sampled from the actual colourways in the shot — real product information delivered as an interaction.

**Filters.** When a filter is applied, cards **reposition smoothly** rather than snapping — items fading out and remaining items gliding to their new positions over ~500ms.

**Fabric spec sheet.** Each row's large GSM figure counts up as it enters. On hover, the row's background shifts subtly and a thin amber rule draws left to right.

**Private label & OEM.** This is the highest-value service on the page — give it more visual weight than it currently has. The product photographs showing the **branded ZONIXA poly-bag, woven labels and hang tags** should be presented large and layered, with a slow reveal, as direct evidence of the service.

**Enquiry form.** Fields get a **calm focus treatment** — the label lifts, the border transitions to amber over 250ms, no jumping or layout shift. The submit button fills from left to right on hover. Design the loading and success states with real transitions.

## 7. Artboards to add

Keep the existing four. Add these:

**Artboard 5 — The production line, as a storyboard.** Four to five frames showing the thread sequence at 0%, 25%, 60%, 100%, plus the reduced-motion static state. Annotate each frame with what is animating, its duration and its easing.

**Artboard 6 — Floating action buttons, all states.** Desktop resting, desktop hover-expanded, the pulse ring at three points in its cycle, the mobile bottom bar, and the hidden state when the form is in view. Annotate with timings.

**Artboard 7 — Motion specification sheet.** The full timing and easing table, the reveal pattern, stagger values, the hover vocabulary, scroll-trigger thresholds, and the `prefers-reduced-motion` fallbacks. This becomes the implementation reference, so make it precise and complete.

**Artboard 8 — Texture and brand device sheet.** The knit-stitch motif at several scales, the grain overlay, the marquee treatment, oversized numerals, the vertical running label, and the Gurmukhi detail in place.

## 8. Non-negotiables — carried forward, still binding

- **No auto-opening modals or popups on load.** The floating buttons appear only after a scroll, and they are buttons, not a modal.
- **Only the 29 real product photographs.** No stock imagery anywhere — not for the factory, not the team, not the fabrics.
- **Sentence case for all copy.** No prices, no cart, no checkout.
- **Motion must never block content.** Anything animating in must be readable if the visitor scrolls fast, and everything must be fully present with reduced motion enabled.
- **Mobile gets the same care.** The production thread, the floating buttons and the reveals are all designed for a small screen, not squeezed down afterwards.
- Keep `{{curly brace}}` markers for figures we still do not have.

---

## Notes for implementation (not part of the Claude Design prompt)

- **This changes the tech stack decision.** `CLAUDE.md` §4 currently allows Framer Motion "only if genuinely needed". A scroll-pinned, scroll-progress-driven production sequence qualifies. Plan on **Framer Motion** for the pinned production line, staggered reveals and layout transitions on filters; keep plain CSS for hovers, the marquee and the pulse ring.
- **Watch the performance budget.** Grain overlays, parallax and a pinned section are all cheap individually and expensive together. Animate only `transform` and `opacity`. The 29 photos are 100–560 KB each and must be converted to responsive WebP before any of this ships.
- **The stitch-drawing thread** is an SVG path with animated `stroke-dashoffset` driven by scroll progress — inexpensive and smooth.
- **`prefers-reduced-motion` is not optional.** Every animation above needs a static fallback, and the pinned section must release its pin entirely in that mode.
