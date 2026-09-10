# DOCUMENTATION.md — Panwar Knitwear Website Redesign

A running log of every prompt in this project: what was asked, why, what came out of it, how long it took, and roughly what it cost.

**Project:** Redesign of https://panwarknitwear.com
**Started:** 1 September 2026
**Working directory:** `D:\AI Bootcamp\Panwar Knitwear Website Redesign`
**Model:** Claude Opus 5 (via Claude Code)

---

## How to read this log

Each entry records:

| Field | Meaning |
|---|---|
| **Prompt** | What the user asked, in their own words (condensed only when very long) |
| **Purpose** | *Why* the prompt was asked — the intent behind it, not just the literal text |
| **Actions** | What Claude actually did (tools used, files touched) |
| **Deliverables** | Concrete outputs, with file paths |
| **Duration** | Wall-clock time for the turn |
| **Tokens** | Tokens consumed by the turn |
| **Decisions** | Choices locked in during the turn |
| **Open questions** | Anything left unresolved |

### A note on the Duration and Tokens columns

These are **estimates unless marked "measured"**. Exact per-turn token counts and timings are not readable from inside a Claude Code session. To make them exact, run `/cost` after a turn and paste the number in — the entry will be updated and relabelled *measured*.

---

## Running totals

| Metric | Value |
|---|---|
| Prompts logged | 6 |
| Total duration (est.) | ~1 h 25 min |
| Total tokens (est.) | ~560,000 |
| Files created | 11 (+ 33 images downloaded) |
| Claude Design prompts produced | 2 |
| Lines of code written | ~7,100 (app built after Entry 05; audited and revised in Entry 06) |

**Numbering note:** documentation entries count *user prompts*; Claude Design prompts are numbered separately. Design Prompt 01 came out of Entry 01 (revised in Entry 03); Design Prompt 02 came out of Entry 04.

---

## Entry 01 — Project kickoff, CLAUDE.md, documentation system, Claude Design prompt

| | |
|---|---|
| **Date / time** | 1 September 2026, ~22:20 IST |
| **Phase** | 0 — Setup and research |
| **Duration** | ~8 min *(estimate)* |
| **Tokens** | ~58,000 *(estimate)* |

### Prompt

> I have a dash one file folder basically. So in this folder, we will be working on the project. I am attaching a reference link, and that project we have to redesign. First of all, I need a prompt from you to redesign the UI of that project with Claude Design. I have a reference link. We have to redesign it through Claude Design, and then we have to implement the coding part here with you — the features and everything. And what I want from you is also to properly document this project. Side by side you can create a DOCUMENTATION.md, in which you will be adding my prompts, how much time that output takes, how much tokens that output took — you have to document everything, and what was the purpose of the output prompt. So that later on, when we get an idea, we have to do something with that. So I want you to properly document the project. And firstly, just start giving me the first prompt for Claude Design.
> https://panwarknitwear.com/

### Purpose

Three things at once: (1) establish the project's ground rules in a `CLAUDE.md` so every later turn has shared context, (2) set up a documentation system that captures prompts, cost and intent as the project runs — so the process itself is reviewable later, not just the code, and (3) produce the first concrete deliverable: a Claude Design prompt to generate the new UI.

The underlying goal is that this project should be **reproducible and explainable after the fact** — the user wants to be able to look back and see not just what was built, but why each step was taken and what it cost.

### Actions

1. Listed `D:\AI Bootcamp` — found the project folder empty, and sibling projects (`DAY - 1`, `DAY - 2`, `GNE Website redesign`, `Bakery-website`) for convention reference.
2. Fetched https://panwarknitwear.com and extracted the full page text and content structure.
3. Ran a web search and pulled the IndiaMART company profile for verified business facts (year established, team size, legal status, product counts, stated USPs).
4. Opened the live site in the browser and captured screenshots to assess the actual visual state and UX behaviour.
5. Read `../DAY - 2/CLAUDE.md` and `package.json` to match the house tech stack and documentation style.
6. Wrote `CLAUDE.md` and `DOCUMENTATION.md`.
7. Wrote the Claude Design brief.

### Key research findings

**Verified company facts:** established 2016, Ludhiana, sole proprietorship, GST registered 2017, 26–50 employees, brands ZONIXA (top wear) and MSP Sports (bottom wear), 8 named fabrics, founded by Mohar Singh Panwar with Prabhu Panwar and Bhala Ram Panwar as co-founders/CEOs.

**Twelve concrete faults found in the existing site** — documented as a table in `CLAUDE.md` §2 and used as the acceptance criteria for the redesign. The most serious:

- A contact modal **auto-opens on page load**, blocking all content.
- There is **no hero section at all** — the page opens directly into tabbed brand blocks.
- The published contact email is literally **`email@example.com`**.
- The page **renders blank when scrolled** after dismissing the modal — the live site is partly broken.
- **Zero B2B information** — no MOQ, lead times, capacity, or private-label/OEM offer, despite being a manufacturer site whose only real conversion is a bulk enquiry.

**Positioning conclusion:** this is a **B2B manufacturer site, not a D2C store**. There is no cart and no checkout. The single conversion goal is a qualified bulk enquiry (RFQ), with WhatsApp and phone as instant secondary paths.

### Deliverables

| File | What it is |
|---|---|
| `CLAUDE.md` | Full project blueprint — hard rules, the problem being solved, verified company facts, fixed tech stack, page/feature scope, design direction, content rules, documentation protocol |
| `DOCUMENTATION.md` | This log |
| `design/CLAUDE-DESIGN-PROMPT.md` | The paste-ready Claude Design prompt (the turn's headline deliverable) |

### Decisions

| Decision | Reasoning |
|---|---|
| Treat this as **B2B, not D2C** | The company manufactures in bulk for wholesalers and retailers. A cart would be the wrong product entirely. |
| **Bulk enquiry (RFQ) is the single conversion goal** | Everything on the site funnels here; WhatsApp and phone are the instant secondary paths, because Indian B2B buyers convert on WhatsApp more than on forms. |
| Tech stack: **Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Supabase** | Matches the stack already used in `DAY - 2`, so nothing new to learn mid-project. |
| Palette: ink, warm off-white, **deep plum**, saffron/amber accent | Deep plum is an evolution of their existing purple — it keeps brand recognition instead of discarding it, while dropping the dated gradient. |
| Keep **ZONIXA and MSP Sports as distinct sub-brands** | They are real, established, and have their own domains. Flattening them would lose equity. |
| **8 artboards** for the design canvas | Enough to cover every page type plus mobile, without diluting quality across too many screens. |
| Missing facts get `{{TODO}}` markers | MOQ, lead time, capacity and certifications are unknown. Inventing them on a manufacturer's site would be actively harmful. |

### Open questions (need real answers from the client before build)

1. **Real email address** — the current site publishes `email@example.com`.
2. **MOQ** — minimum order quantity per style, per colour.
3. **Lead time** — sample turnaround and bulk production turnaround.
4. **Monthly capacity** — pieces per month.
5. **Full factory address** — for the map and LocalBusiness schema.
6. **Certifications** — any ISO / OEKO-TEX / GOTS?
7. **Photography** — can the client supply real factory and product photos? The design depends on strong imagery, and the existing carpet-floor shots are not usable.

---

## Entry 02 — Constraints clarification: no git, and a higher UI bar

| | |
|---|---|
| **Date / time** | 1 September 2026, ~22:35 IST |
| **Phase** | 0 — Setup |
| **Duration** | ~1 min *(estimate)* |
| **Tokens** | ~4,000 *(estimate)* |

### Prompt

> And strictly no commit with GitHub, nothing please, don't touch it even!! The UI that has to be redesigned has to be good, modern, and actually supporting the vibe, solving the problem, and everything clearly and nicely available on the page. I want a very nice UI for this, with images and everything I need!!

### Purpose

Two hard constraints, delivered mid-turn:

1. **A safety boundary** — version control is off-limits. The user manages git themselves and does not want any automated commits or pushes.
2. **A quality bar for the UI** — not a generic template refresh. The design must be modern, visually rich (real imagery, not empty white space), and must make information genuinely easy to find on the page rather than hidden behind clicks.

### Actions

Encoded both constraints permanently rather than just honouring them for one turn:

- `CLAUDE.md` §0 rule 1 — the git prohibition, written as an absolute rule.
- `CLAUDE.md` §6 — "imagery is mandatory and load-bearing", with the required shot list.
- `CLAUDE.md` §8 — "no auto-opening popups, ever".
- The Claude Design prompt was written to specify a dense, image-led layout where every section carries a real visual and every key fact is visible on the page.

### Deliverables

Updates folded into `CLAUDE.md` and `design/CLAUDE-DESIGN-PROMPT.md`.

### Decisions

| Decision | Reasoning |
|---|---|
| **Git is entirely off-limits** for the whole project | Explicit user instruction; recorded as hard rule #1 so it survives context loss and applies to every future turn. |
| Imagery treated as a **requirement, not decoration** | "With images and everything" was explicit. The design brief specifies exact shots per section rather than leaving imagery to chance. |
| Information density favoured over minimalism | "Everything clearly and nicely available on the page" — specs, GSM, fabrics and contact details stay visible rather than being hidden behind tabs or accordions. |

### Open questions

Unchanged from Entry 01.

---

## Entry 03 — Scope correction: single page, real assets only

| | |
|---|---|
| **Date / time** | 1 September 2026, ~22:40 IST |
| **Phase** | 0 — Setup and asset audit |
| **Duration** | ~7 min *(estimate)* |
| **Tokens** | ~30,000 *(estimate)* |

### Prompt

> Email, you can add the exact one which is given in the project. Rest phone numbers are there, you may use — like WhatsApp directly with the phone number, and you can link them. Available images are there, they are only required to be used. And the cloth design — regenerate this as a single page project. Maybe one or two pages it may add, but not more than that.

### Purpose

A course correction on three fronts, all of which invalidated parts of the v1 design brief:

1. **Use the real contact details** — stop treating the phone numbers as placeholders, wire them up properly, and make WhatsApp a first-class conversion path rather than an afterthought.
2. **Use the images that already exist** — do not plan a design around photography nobody is going to shoot. The available assets are the constraint, and the design has to fit them.
3. **Cut the scope to a single page** (plus at most one or two more). The v1 brief specified an 8-page site, which was over-built for what the client wants.

The underlying instinct is right: a brief that assumes assets and pages that do not exist produces a design that can never actually be built.

### Actions

1. Re-loaded the source site and inspected the DOM directly for `mailto:`, `tel:` and WhatsApp links, and regex-scanned the full HTML for any email address.
2. Extracted every `<img>` src and CSS background from the homepage and both product listing pages.
3. Downloaded **33 files** (29 product photos, the logo, 3 "about" images) into `assets/source-images/`.
4. Visually inspected representative images to judge real usability rather than assuming from filenames.
5. Wrote `assets/IMAGE-INVENTORY.md` — a full audit of what is usable, what is not, and what is missing.
6. Rewrote `design/CLAUDE-DESIGN-PROMPT.md` from scratch as v2.
7. Updated `CLAUDE.md` §3, §5.1, §5.2 and §6.

### Key findings

**On the email — the instruction could not be carried out.** There is no real email address anywhere in the project. Confirmed three ways: no `mailto:` link exists in the DOM, a regex scan of the entire page HTML returns exactly one match, and that match is the literal string `email@example.com`. It stays as `{{email}}` until the client supplies one.

**On the images — the product photos are considerably better than the v1 brief assumed.** v1 dismissed them as "carpet-floor photos" to be replaced. Inspecting them properly reversed that judgement:

- All 29 are shot on the **same dark charcoal floor** — consistent, not chaotic.
- Each frame shows a hero garment flat **plus a stacked run of 4–6 colourways** — which answers a real buyer question about available colours.
- Several show the **branded ZONIXA poly-bag packaging**, woven labels, hang tags and embroidered logos — direct visual proof of the private-label service, which is the highest-value thing the company sells.
- The charcoal ground is very close to the ink `#14131A` in the palette, so on dark sections they read as deliberate art direction.

**On the images — what is missing is more significant than what is there:**

- **Zero factory photography.** No knitting machines, stitching line, dyeing, cutting, QC or packing.
- **Zero MSP Sports photography.** `msp-products.php` serves the Zonixa catalogue; the page was never built. Half the product range has no imagery.
- **Zero fabric macros and zero leadership portraits.**
- The three existing "about" images are generic blue stock silhouettes at **500 × 160 px** — unusable at any real size.

### Deliverables

| File | What it is |
|---|---|
| `assets/source-images/` | 33 downloaded files — 29 product photos, logo, 3 unusable about images |
| `assets/IMAGE-INVENTORY.md` | Full audit: usable / not usable / missing, with a client asset request list |
| `design/CLAUDE-DESIGN-PROMPT.md` | **Rewritten as v2** — single page, built around the real photography |
| `CLAUDE.md` | §3 email fact corrected, §5.1 rescoped to two pages, §5.2 WhatsApp wiring specified, §6 imagery rules rewritten |

### Decisions

| Decision | Reasoning |
|---|---|
| **Single page + one catalogue page.** Product detail becomes a quick-view modal | Client instruction. A modal keeps 29 products browsable without adding 29 routes. |
| **The site leans dark overall** | The only photography available is on a dark charcoal ground. Building an ink-dominant page makes those photos look intentional; a light page would make them look like mistakes. |
| **Colour-run stacks stay in frame** | They communicate available colourways — real B2B information, free, already shot. |
| **No stock imagery anywhere, at all** | Substituting stock factory photos would recreate the exact credibility problem being fixed. Sections without photography are built typographically instead, as a confident choice rather than an apology. |
| **Manufacturing section is diagrammatic, not photographic** | No factory photos exist and none should be faked. Large numerals and a technical spec-sheet flow carry it. |
| **MSP Sports block designed to work with no product photos** | None exist. A typographic panel plus a marked image slot for when the client supplies shots. |
| WhatsApp wired to **+91 98760 45457** via `wa.me/919876045457`, all three numbers as `tel:` links | Client instruction to link the numbers directly. |
| **320 GSM promoted to a headline selling point** | It appears across their real product range and is genuinely heavier than most competitors work. With no factory photography, this number does real trust work. |

### Open questions

1. **Real email address** — still outstanding, and now confirmed as genuinely absent from the source rather than merely overlooked.
2. **MSP Sports product photos** — the largest content gap; half the range is invisible.
3. **Factory photos** — even phone photos of the knitting machines, stitching line and packing area would be the single highest-value asset the client could supply.
4. MOQ, lead time, monthly capacity — still `{{...}}` placeholders.
5. Full factory address for the map.
6. Any certifications.

---

## Entry 04 — Design Prompt 02: motion, texture and brand character

| | |
|---|---|
| **Date / time** | 1 September 2026, ~22:55 IST |
| **Phase** | 1 — Design refinement |
| **Duration** | ~6 min *(estimate)* |
| **Tokens** | ~22,000 *(estimate)* |
| **Produces** | **Claude Design Prompt 02** |

### Prompt

> Can you modernize it a bit and basically add some sort of a slower animation somewhere, maybe in the steps of production which we have shown, or maybe something more better — because this is looking very... like, it is good, but it is quite simpler. And WhatsApp icon can be there, call icon can be there, and there must be a popping one basically. And I believe the steps can have some animation and something more animated maybe can be there. A bit more animation, more vibe and more classier, but looking like a real brand of Ludhiana or something like this. So can you just do it? First of all, can you create a prompt number two and put it into that documentation also — and the outputs of one were decent, but we wanted to increase more. So now I need prompt number two.

### Purpose

Design Prompt 01 produced the right **structure** but not the right **feel**. The verdict — *"it is good, but it is quite simpler"* — is a critique of character, not of layout: the sections, information and palette are correct, but the result reads as a competent arrangement rather than as a brand.

Four specific asks sit inside it:

1. **Motion, and specifically slow motion** — the word "slower" was used deliberately.
2. **The production steps as the place to put it** — correctly identified as the section with the most latent potential.
3. **WhatsApp and call icons that "pop"** — the instant-conversion path needs to be impossible to miss.
4. **"A real brand of Ludhiana"** — the hardest and most valuable of the four. It asks for regional authenticity without kitsch.

### Actions

Wrote a **refinement prompt rather than a replacement**, explicitly instructing Claude Design to edit the existing canvas and to leave the palette, structure, section order, copy and photography untouched. Only motion, texture and brand devices are added.

The vague asks were translated into specific, buildable decisions:

- *"slower animation"* → an actual timing and easing table with numbers
- *"more animated"* → a scroll-driven signature sequence, not scattered effects
- *"popping"* → a defined pulse ring with a duration and an entrance rule
- *"real brand of Ludhiana"* → six concrete devices (see below)

Also flagged that this changes a stack decision, and updated `CLAUDE.md` accordingly.

### The design thinking

**On motion — the anchor idea.** The company's signature product is a **320 GSM hoodie**, a genuinely heavy garment. So the motion language is *heavy, deliberate, settling* — 800–1200ms reveals on a long decelerating curve, nothing bouncy or elastic. This gives every animation on the page one consistent rationale instead of a bag of unrelated effects, and it ties the motion directly to what the company actually manufactures.

**On the production steps — a thread that stitches itself.** A stitch-line draws forward through the nine steps as the visitor scrolls, lighting each one in turn, with the section pinned so the visitor scrolls *through* the production line rather than past it. This is the one place the knitwear metaphor should be literal, and it is worth doing properly: it is on-brand for a knitting factory, it is genuinely memorable, and — importantly — **it fills the gap left by having no factory photography.** The section that most needed photos becomes the section that least needs them.

**On "popping" without repeating the old site's worst mistake.** The floating buttons carry a slow 3s pulse ring, but they **appear only after roughly one viewport of scrolling** — never on load. The old site's auto-opening modal is the single worst thing about it, and a popup arriving on load in a new visual costume would be the same failure. Buttons that arrive once the visitor is engaged are a genuinely different thing from a modal that interrupts them.

**On "a real brand of Ludhiana" — six concrete devices:**

1. A **knit-stitch motif** used consistently as texture, dividers, and the production thread — one motif, used everywhere, is what turns a layout into an identity.
2. A **slow fabric marquee** — the eight fabric names drifting past over 40–60s. Modern, adds movement to a still page, and does real work by showing the range.
3. **Oversized section numerals** `01`–`09` — editorial, technical, gives the long scroll a spine.
4. A **vertical running label** down the page edge: `PANWAR KNITWEAR · LUDHIANA · EST. 2016`.
5. **Count-up statistics** on the proof strip.
6. **ਲੁਧਿਆਣਾ** set in Gurmukhi beside the English "Ludhiana" — **once, in exactly one place.** This is the actual authenticity move. The prompt explicitly forbids anything further — no motifs, no mandalas, no ornamental Punjabi clip-art — because restraint is the difference between classy and kitsch.

### Deliverables

| File | What it is |
|---|---|
| `design/CLAUDE-DESIGN-PROMPT-02.md` | **Claude Design Prompt 02** — the refinement pass, plus four new artboards and an implementation notes section |
| `CLAUDE.md` §4 | Animation stack upgraded from "CSS only" to Framer Motion |
| `CLAUDE.md` §6.1 | New motion specification section |

Four new artboards requested: the production line as an annotated storyboard, the floating buttons in all states, a full motion specification sheet, and a texture/brand device sheet.

### Decisions

| Decision | Reasoning |
|---|---|
| **A refinement prompt, not a replacement** | Prompt 01's structure was correct and the critique was about character. Regenerating from scratch would risk losing what already works. |
| **Motion timing derived from 320 GSM** | Gives every animation one coherent rationale, tied to the actual product. |
| **The production section becomes the signature moment** | It is the section with no photography available, so it is exactly where a strong design idea earns the most. |
| **Framer Motion added to the stack** | A scroll-pinned, scroll-progress-driven sequence is not reasonably achievable in plain CSS. `CLAUDE.md` §4 already permitted this "if genuinely needed" — this qualifies, and the change is recorded rather than made silently. |
| **Floating buttons appear after ~1 viewport of scroll, never on load** | Preserves the no-auto-popup rule in spirit, not just in letter. |
| **Exactly one Gurmukhi detail, and no other ornament** | Regional authenticity without kitsch. The restraint is the design decision. |
| **`prefers-reduced-motion` mandated on every animation** | With this much motion it stops being a nicety and becomes an accessibility requirement. The pinned section must fully release its pin. |

### Open questions

Unchanged from Entry 03 — real email, MSP Sports photos, factory photos, MOQ, lead time, capacity, address, certifications.

New, for after the canvas is reviewed:

1. Does the pinned production section feel good on a mid-range Android phone, or does pinning need to be dropped on mobile in favour of a simple vertical progression?
2. Is the fabric marquee an asset or a distraction next to the product grid? Worth judging on the canvas before committing.

---

## Entry 05 — Vercel deployment returns 404, not a blank page

**Date:** 2 September 2026, ~09:35–09:55 IST
**Prompt:** "https://panwarknitwear-sigma.vercel.app/ see i deployed this , nothing is visible on page why? improve this properly please and help me"

### Purpose

Diagnose why the deployed site shows nothing.

### What was done

1. Loaded the deployed URL in a browser and read its console and page text. It is **not** a blank React app — the page is Vercel's own error page: `404: NOT_FOUND`, code `NOT_FOUND`. No application JavaScript or CSS is served at all.
2. Checked the repository layout. The git root is `D:/AI Bootcamp` (the whole bootcamp repo). The Vite app lives four levels down, at `Panwar Knitwear Website Redesign/panwarknitwear/panwar-knitwear/`. All 85 app files, including all 29 product images in `public/img/`, are committed.
3. Ran `npm run build` locally — succeeds in 5.1s, 66 modules, `dist/index.html` + 54 kB CSS + 226 kB JS.
4. Served the production build with `vite preview` and screenshotted it. The home page renders correctly: header, anchor nav, phone number, "Get a quote" CTA, and the full hero.

**Conclusion: the code and the build are fine. The deployment is misconfigured.** Vercel is building from the repository root, where there is no `package.json`, so it publishes nothing and every path 404s.

### Deliverables

| File | What it is |
|---|---|
| `panwarknitwear/panwar-knitwear/vercel.json` | Framework, build command, output directory, and an SPA rewrite so `/catalogue` survives a refresh or a direct link |

### Decisions

| Decision | Reasoning |
|---|---|
| **Fix via Vercel's Root Directory setting, not a repo-root `vercel.json`** | Root Directory is the supported way to deploy a subfolder of a monorepo. A root-level config that `cd`s into a path containing spaces is fragile. |
| **Add the SPA rewrite now** | Even once the root directory is corrected, `/catalogue` would 404 on refresh without it, because React Router handles that path client-side only. This is a second, independent bug that would have surfaced immediately after the first fix. |
| **No code changes to the site itself** | The build is verified working. Changing anything else would have obscured the actual cause. |

### Open questions

Unchanged from Entry 03 — real email, MSP Sports photos, factory photos, MOQ, lead time, capacity, address, certifications.

### Estimates

Duration ≈ 20 minutes. Tokens ≈ 35k. **Both estimated, not measured.**

---

## Entry 06 — Independent audit of the deployed redesign, and seven fixes

**Date:** 10 September 2026
**Prompt:** A full product/UX/conversion/technical audit of the deployed redesign against the original site, acting as senior product designer, UX auditor, frontend engineer and conversion consultant — then, after approval, implementation. Explicit standing constraint restated: **do not touch GitHub.**

### Purpose

Stop treating the redesign as finished. Audit it as a real business website, find what it got wrong and what it *lost* relative to the site it replaces, and fix the highest-value items.

### What was done

Audited both sites live (browser automation: DOM, accessibility tree, computed styles, network, console, mobile emulation) and read the whole source tree. Then implemented items 1–7 of the approved plan.

**Five defects found that made the site undeliverable:**

1. **The enquiry form claimed success and sent nothing.** `submitEnquiry.js` resolved `{delivered:false}` when no endpoint was configured; `EnquiryForm.jsx` set state `"sent"` regardless and showed *"Enquiry received."*, then cleared the form. The warning was `DEV`-gated. Verified against the deployed bundle: no endpoint was configured, so **every live enquiry was silently discarded.**
2. **`/catalogue` returned a hard Vercel 404 on direct load** — verified live. `vercel.json` was still untracked, so Entry 05's fix had never deployed.
3. **Nine placeholder tokens rendered to real buyers**: `{{email}}`, `{{street address}}`, `{{MOQ}}`, `{{lead time}}`, `{{monthly capacity}}`, `{{GSM}}` (22 of 29 products), `{{GSM range}}`, `{{fit}}`, `{{size range}}`.
4. **The redesign had discarded real per-product specs the original publishes.** Harvested all 29 original product pages: 28 publish a size range, 14 a GSM, 25 an article number, and all a material description.
5. **The touch CTA was invisible but tappable.** `.pk-card__overlay` was `opacity:0` with `pointer-events:auto`, hover-revealed, with no `@media (hover: hover)` guard anywhere in 3,600 lines of CSS. On the home showcase this meant tapping a card silently added a style to the enquiry and jerked the page down to the form.

Also: no favicon, `robots.txt`, `sitemap.xml` or JSON-LD (the last an explicit §5.2 requirement); a relative `og:image` breaking every link unfurl; five trust badges rendered as unclickable plain text while the original site carries real verifying URLs.

### Deliverables

| File | Change |
|---|---|
| `src/lib/submitEnquiry.js` | **Deleted.** No endpoint existed or was planned; the dead POST path was the bug. |
| `src/sections/EnquiryForm.jsx` | Submit is now an anchor-based WhatsApp handoff (`window.open` after `await` is popup-blocked in Safari/Firefox; native anchor navigation is not). States reduced to `idle` / `handoff`; **"Enquiry received" removed entirely**; draft and picked styles survive the handoff; `onSubmit` keeps the Enter key working; email placeholder block removed; factory block now shows Sunder Nagar, Ludhiana plus a real Google Maps link. |
| `src/data/products.js` | Rewritten to object literals with `articleNo`, `sizes`, `material`, real `gsm`, `alias` (the client's original title) and a `haystack` search field. Confirmed GSM went from 7 to 14 of 29. |
| `src/data/company.js` | `PLACEHOLDERS` cut from 9 entries to 5; new `LOCATION` (city + verified Maps URL); `LISTINGS` now `{name, url}`; new `SOCIAL`. |
| `src/components/QuickView.jsx` | Spec table 8 rows / 3 placeholders to 10 rows / 2. Per-product `sourceNote` surfaced. |
| `src/pages/Catalogue.jsx` | Search reads `haystack`; `300 GSM` filter added; MOQ placeholder replaced with an honest CTA; `BreadcrumbList` JSON-LD. |
| `src/components/ProductCard.jsx` | One affordance, one hit area: the whole photo is a `button` opening quick view in both variants; overlay is `aria-hidden` and non-interactive. |
| `src/sections/Showcase.jsx` | Renders its own `QuickView`; the silent add-and-scroll is gone. |
| `src/styles/components.css` | Overlay `pointer-events:none` always; hover reveal scoped to `@media (hover: hover) and (pointer: fine)`; `:focus-within` kept outside so keyboard works on any device; always-on overlay under `(hover: none), (pointer: coarse)`; swatch note wraps to its own line. |
| `src/sections/Manufacturing.jsx` | Three bracketed stat cards became three honest conditions plus a converting CTA. |
| `src/components/Footer.jsx`, `src/sections/About.jsx` | Listings and social are real outbound links from one source of truth; address and email placeholders gone. |
| `src/sections/WhyUs.jsx` | Added the missing `id="why-us"`. |
| `src/lib/meta.js` *(new)* | Per-route title / description / canonical / OG. Canonical is always the bare path, so catalogue filters cannot generate duplicate indexable URLs. |
| `src/components/JsonLd.jsx`, `src/components/NotFound.jsx` *(new)* | Route-scoped schema; a real 404 page instead of rendering Home at HTTP 200. |
| `index.html` | `lang="en-IN"`, absolute `og:image` and `og:url`, Twitter card, favicon links, static `Organization` / `LocalBusiness` / `WebSite` JSON-LD. |
| `public/favicon.svg`, `public/robots.txt`, `public/sitemap.xml` *(new)* | All three were entirely absent. |
| `vercel.json` | Added long-lived `Cache-Control` for hashed assets (was `max-age=0, must-revalidate`) plus two security headers. |
| `.env.example` | **Deleted** along with the endpoint it documented. |

### Decisions

| Decision | Reasoning |
|---|---|
| **WhatsApp handoff, not a form backend** | User's call. No email address exists, so `mailto:`, Formspree, Web3Forms and a serverless function all lack a destination. WhatsApp is the only path that can deliver today and is where this trade replies. Accepted trade-off: **no enquiry is recorded anywhere.** Revisit when an email address arrives. |
| **Anchor, not a submitting button** | `window.open()` after an `await` is popup-blocked in Safari and Firefox. Native anchor navigation never is. |
| **Ship all 29 product rows exactly as the client publishes them** | User's call, made after the inconsistencies below were flagged. This is fidelity to the client's own published data, not invention. The five affected rows carry a `sourceNote` shown in the quick view. |
| **Canonical points at the Vercel domain, not panwarknitwear.com** | The **old site is still live** on that domain. Canonicalising to it would tell Google this build is a duplicate of the site it replaces. One constant (`SITE_URL`) to flip at cutover. |
| **Dropped TradeIndia and the LinkedIn company page from the listings row** | No verified URL for either. An unclickable badge sitting beside four working links reads as a dead link and weakens the section. |
| **Removed the email block rather than showing `{{email}}`** | A labelled empty slot is worse than an honest omission when three phone numbers and WhatsApp are live. |
| **Both card variants open quick view** | The same visual pill previously meant two different things, and the home-page meaning (silent add plus scroll) was the worst interaction on the site. A buyer should read the spec sheet before enquiring. |
| **No TypeScript / Tailwind / Supabase / Framer Motion migration** | See the stack divergence below. Rewriting ~7,000 working lines to match a document is not an improvement. |
| **Deferred: image pipeline, FAQ section, mobile type floor** | User scoped this pass to items 1–7. |

### ⚠️ Stack divergence from CLAUDE.md §4

Section 4 specifies React 19, TypeScript, Tailwind v4, React Router v7, Supabase, zod, react-hook-form, shadcn/ui, Lucide and Framer Motion. **The build uses none of them** — React 18.3.1, plain JSX, hand-written CSS, Router 6, three runtime dependencies, hand-rolled validation, IntersectionObserver plus WAAPI. The result is good and lean, but **§4 and the code need reconciling**; §4 should be amended to describe what was actually built.

### Open questions — needs verification from the business owner

Unchanged: real **email address**, **street address**, **MOQ**, **lead time**, **monthly capacity**, **certifications**, **MSP Sports photography**, **factory photography**, per-fabric GSM ranges.

**New — source data inconsistencies on the client's own product pages, now published as-is:**

1. Article number **`23092` is reused across four different styles** (two-thread filice hoodie, two-thread logo filice hood, two-thread hood logo sweatshirt, digital print T-shirt).
2. **Two-thread round-neck hoodie, chest print** lists sizes **`24, 26, 28, 30, 32, 34, 36`** — waist sizes belonging to a lower, not a hoodie — and gives its material as dry-fit matty for what the catalogue calls a fleece hoodie. Both look like data-entry errors.
3. **Two styles share the article name** "Two Thread Round Neck Hood Chest Print".
4. **Shape swead 320 GSM round-neck hoodie** carries an article name belonging to a different style.
5. **Feather bonding sweatshirt** is the only style with no published size range.

### Estimates

Duration ≈ 55 minutes. Tokens ≈ 300,000. **Both estimated, not measured.**

### GitHub

**No GitHub repository changes, commits, pushes, or pull requests were made.** All work is local.

---

## Next up

Two actions only the user can take, both required for `/catalogue` to resolve in production:

1. Vercel → Project → Settings → Build & Deployment → **Root Directory** = `Panwar Knitwear Website Redesign/panwarknitwear/panwar-knitwear`; Framework Preset **Vite**; then redeploy with the build cache **unchecked**.
2. Commit `vercel.json` (still untracked). Either step alone leaves the 404 in place.

Then, deferred from Entry 06 and worth doing next:

- **Image pipeline** — 6.7 MB of unoptimized 982×1147 JPEGs served at ~300–470 px. A `sharp` devDependency plus one build script emitting WebP at 400 / 640 / 982, and a `picture` component. The largest remaining performance win.
- **FAQ section** — the buyer-qualifying questions, every answer either verified or an honest "ask and we confirm", plus `FAQPage` schema.
- **Mobile type floor** — rendered text measured at 8 px, 10 px and 11 px at 375 px. The causes are hardcoded px values in component rules, not the `--t-*` clamp tokens.
- Amend `CLAUDE.md` §4 to match the stack actually built.
