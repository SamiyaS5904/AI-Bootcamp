# Panwar Knitwear

A two-page site for Panwar Knitwear, a knitwear manufacturer in Ludhiana, Punjab:
a long single scrolling page plus a product catalogue.

Built from the Claude Design handoff in `project/` (see `chats/chat1.md` for the
brief and the decisions behind it). The design files are kept in the repo as the
reference they are — they are not part of the build.

**This is a B2B manufacturing site, not a shop.** No prices, no cart, no
checkout. Its one job is to turn an anonymous buyer into a qualified bulk
enquiry.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## How it is put together

```
index.html            document shell, fonts, meta
public/img/           the 29 product photographs (982 x 1147)
src/
  data/               products, company facts, sampled colourways
  hooks/              reveal, count-up, scroll progress, scroll spy, focus trap
  lib/                enquiry list + WhatsApp composition, form submission
  components/         header, footer, cards, quick view, floating actions
  sections/           the twelve sections of the home page
  pages/              Home, Catalogue
  styles/             tokens -> base -> components -> sections -> catalogue -> responsive
scripts/
  sample_colours.py   regenerates src/data/colourways.json from the photographs
```

Styles are plain CSS with a `pk-` prefix, loaded once in `src/main.jsx` in
cascade order. Everything is driven by the tokens in `styles/tokens.css` —
change the palette or the type scale there and it propagates.

## Things you will want to change

### Placeholders

Every figure the client has not supplied yet renders visibly bracketed, in
monospace and dimmed, so it can never be mistaken for real content:

`{{MOQ}}` `{{lead time}}` `{{monthly capacity}}` `{{email}}` `{{GSM}}`
`{{GSM range}}` `{{street address}}` `{{fit}}` `{{size range}}`

They all live in `PLACEHOLDERS` in `src/data/company.js`. Replace a value there
and it updates everywhere. Per-product GSM is only a real figure on the 320 GSM
line; every other weight is `{{GSM}}` until the mill confirms it.

### The enquiry form

The form hands the enquiry to WhatsApp. It validates, then opens a `wa.me`
link carrying every field and every picked style as a prefilled message, and it
says plainly that nothing was sent from the page — the buyer still has to press
send in WhatsApp.

This replaced an earlier version that POSTed to a `VITE_ENQUIRY_ENDPOINT`. With
no endpoint configured that code resolved as if it had succeeded, so the form
told buyers "Enquiry received" and threw their enquiry away. If you add a real
backend later, keep the rule that broke: **only a confirmed delivery may show a
success state.**

The primary control is an `<a>`, not a submitting `<button>`, because
`window.open()` after an `await` is popup-blocked in Safari and Firefox while
native anchor navigation is not. Pressing Enter in a field triggers the same
anchor.

Trade-off to be aware of: **no enquiry is recorded anywhere.** Once the client
supplies an email address, a free form service (Web3Forms, Formspree) or a
serverless function would give you a durable log.

### Missing photography

Two things genuinely do not exist yet and are marked as image slots in the UI
rather than filled with stock:

- **MSP Sports** — no photographs of lowers, track pants, shorts, nikkar or
  capri. Slots in the category rail and the brand panel.
- **The factory floor** — no knitting, stitching, dyeing, QC or packing shots.
  The manufacturing section is deliberately typographic and diagrammatic
  instead, and should stay that way until real photographs arrive.

Drop real images into `public/img/` and replace the slot markup in
`src/data/company.js` (`CATEGORY_CARDS`) and `src/sections/Brands.jsx`.

### Colour dots

`scripts/sample_colours.py` reads the dominant tones out of each photograph into
`src/data/colourways.json`, and cards show them where at least three read
clearly. **They are a hint of the run in that shot, not an orderable colour
card** — shades are dyed to the buyer's card, and the sampler cannot fully
separate the run from the hero garment and the charcoal floor. The label says
"sampled from this photo" for that reason. If you would rather not show them at
all, delete the `Swatches` block in `src/components/ProductCard.jsx`.

Regenerate with `pip install Pillow && python3 scripts/sample_colours.py`.

## What the site does beyond a static layout

- **Enquiry list.** A buyer can add several styles and send one quote request
  for all of them. It survives a reload. It is not a cart: no prices, no
  checkout.
- **Shareable filtered views.** Catalogue filters, search and sort live in the
  URL, so `?cat=Hoodies&gsm=320+GSM` can be sent to a colleague.
- **Quick view.** Full specifications without leaving the catalogue — focus
  trapped, Escape to close, arrow keys to page between styles.
- **Draft safety.** A half-typed enquiry is kept in local storage.
- **Nothing opens by itself.** The floating contact cluster appears only after
  about a viewport of scroll, and the mobile action bar slides away while the
  enquiry form is on screen. The old site's auto-opening modal is not repeated
  in a new costume.

## Motion

One vocabulary, applied everywhere. Reveals fade up 20px over 900ms on
`cubic-bezier(.16, 1, .3, 1)`, 90–120ms apart in groups, once only — they never
re-animate on scroll back. Hovers are 250–350ms. Counters run 1800ms.

The production line is the signature moment: a running-stitch thread draws
itself through the nine steps while the section is pinned, lighting each step as
it arrives. It runs horizontally on desktop and rotates to a vertical spine on
mobile.

`prefers-reduced-motion` is honoured throughout: the manufacturing section
un-pins and renders its finished state with all nine steps lit, and everything
else is simply present. A reveal can never trap content invisible — there is a
6s failsafe.

## Accessibility notes

Skip link, visible focus rings everywhere, real `alt` text on every photograph,
`aria-pressed` on filter chips, live regions on result counts, 44px minimum tap
targets, and a focus-trapped quick-view dialog. Secondary text was lifted off
the design's `#8A8378` to `#A8A29A` where it is set small, to hold contrast on
ink.

## Known gaps

- **Fonts load from Google Fonts.** Self-hosting them would be faster and more
  private; the fallback stacks are already defined in `tokens.css`.
- **`img/logo.png` in the handoff is the old purple-gradient lockup**, so the
  wordmark is set typographically instead. A flat mark is worth commissioning.
- **No analytics** is wired up.
- **No form backend.** Enquiries go out over WhatsApp only, so nothing is
  logged server-side. Needs a client email address to change.
- **Images are unoptimized** — 6.7 MB of 982x1147 JPEGs, no WebP and no
  `srcset`, served at ~300-470 px on cards. The largest remaining perf win.

---

The original Claude Design handoff instructions are preserved at
`project/HANDOFF.md`; the design files and chat transcript they refer to are in
`project/` and `chats/`.
