# GNDEC Ludhiana — website UI redesign

A static front-end redesign of the Guru Nanak Dev Engineering College homepage
and two key interior pages. Plain HTML5 + CSS only: **no JavaScript, no
frameworks, no build step, no npm.** Open `index.html` in a browser and it works.

## Files

```
index.html        Homepage
admissions.html   Admissions 2026-27 (spot counselling, waiting list, fees, notices)
departments.html  All ten departments
style.css         The only stylesheet, organised in numbered sections
images/           Optimised campus photos + crest; see images/README.md
images/originals/ Untouched source files, referenced by nothing
```

There is no templating layer, so the header, app bar, **side navigation panel**
and footer are duplicated across the three HTML files. **If you change any of
them, change all three.** The side panel block is currently byte-identical in
all three; keep it that way — its links are deliberately page-qualified
(`index.html#about`, not `#about`) so the block can be copied verbatim.

## Previewing

Double-clicking `index.html` works. If you prefer a local server (needed only
if you later add anything that dislikes `file://`):

```bash
python -m http.server 8765
```

## Theming

Everything visual is a CSS custom property in the `:root` block at the top of
`style.css` — palette, spacing scale, type scale, radii, shadows, and the
slideshow cycle length. Change a token there and it propagates site-wide;
no hex values are hard-coded below that block.

Current palette: deep navy `#0E2A47` primary, maroon `#8C1D2F` secondary,
saffron `#E4A32B` accent, on white and `#F7F9FC`.

**Accent policy:** saffron is reserved for the admissions / apply action.
`.btn--apply` is the only warm-gradient button on the site and it is the only
thing allowed to use that treatment — every other call to action is
`--primary`, `--ghost` or `--outline`. If you give something else a saffron
background, the Apply button stops reading as the primary step.

Typography is Plus Jakarta Sans (headings) + Inter (body), loaded from Google
Fonts via a plain `<link>`. Delete those two `<link>` tags in each HTML file to
fall back to the system font stack, which is already declared as the fallback.

## CSS-only interactions (what replaces the JavaScript)

| Feature | Technique | Where |
|---|---|---|
| Hero slideshow autoplay | `@keyframes heroFade` + `infinite` + negative `animation-delay` staggered by halves | style.css §07 |
| Hero manual slide control | radios placed before the slides; `#hero-N:checked ~ .s-N` wins on specificity and cancels the animation | style.css §07 |
| Slide indicator dots | `@keyframes dotPulse` on the same 18s clock, so it tracks autoplay with no script | style.css §07 |
| Nav dropdowns | `li:hover > ul` **and** `li:focus-within > ul` (the second is what makes it keyboard-accessible) | style.css §06 |
| Mobile menu | hidden checkbox + `<label>` hamburger; `#nav-toggle:checked ~ .nav__menu` | style.css §06, §13 |
| Notice board scroll | `max-height` + `overflow-y: auto` + `overscroll-behavior: contain` | style.css §10 |
| Featured-events rotator | `@keyframes eventFade` on a 30s cycle, slides stacked in one CSS-grid cell | style.css §10 |
| Event manual control | radio dots; `#ev-N:checked ~ .showcase__stage .e-N` pins a slide and cancels the rotation | style.css §10 |
| Smooth anchor scrolling | `scroll-behavior: smooth` + `scroll-padding-top` for the sticky bar | style.css §02 |
| Hamburger icon → X | one element, two `::before`/`::after` bars, rotated on `:checked` | style.css §13 |
| Side panel open/close | one checkbox that CSS **repositions** on `:checked` — over the edge tab when closed, over the X when open | style.css §12b |
| Click-outside-to-close | a second `<label>` for the same checkbox, covering the backdrop | style.css §12b |
| Staggered panel reveal | inherited `--g` (group index) and `--i` (item index) feeding one `calc()` transition-delay | style.css §12b |
| Page scroll lock | `body:has(.sidenav__switch:checked) { overflow: hidden }` | style.css §12b |

Two cascade details are load-bearing and easy to break — both are commented in
place:

1. In `.hero__slide` / `.hero__dots label`, the `animation` **shorthand** resets
   `animation-delay` to `0s`. The per-slide delay rules must therefore win on
   specificity, which is why the dot delays are written `.hero__dots .d-2`
   rather than `.d-2`.
2. The staggering direction is counter-intuitive: a negative `animation-delay`
   puts a slide that far *ahead* on its timeline, so a slide delayed by one
   third of the cycle appears **last**, not second. With the current two
   slides the offset is a clean half, but this bites the moment you add a
   third — see the comment above `.s-1` in section 07.

## Accessibility

- Skip link, semantic landmarks, one visible `:focus-visible` style throughout.
- Dropdowns open on `:focus-within`, so the nav is fully keyboard-operable.
- Hero dots are real radios in a group, so arrow keys move between slides.
- `prefers-reduced-motion: reduce` stops the carousel on slide 1 and disables
  all transitions; the dots remain the way to change slides.
- Notice panels all render in document order if CSS fails to load.
- The side panel's toggle is a real checkbox, so it is reachable with Tab and
  operated with Space. While the panel is closed it is `visibility: hidden`,
  which keeps its 24 links out of the tab order and the accessibility tree.

**Known limitation:** closing on <kbd>Esc</kbd> needs a key listener, which
means JavaScript. Without it the panel closes three other ways — the X, the
backdrop, or Space on the focused toggle — and the in-panel hint says so. If
you ever relax the no-JS rule, an Esc handler and a focus trap are the two
things worth adding first.

## Side navigation panel

The homepage no longer carries a ten-card Departments grid in the main scroll.
Departments live in the slide-out panel (and on `departments.html`); what
remains on the homepage is a short Academics band. The panel groups links as
Departments / Quick Links / Contact and is opened from the vertical tab on the
right edge, or from the "Browse in the side panel" button in that band — both
are labels for the same checkbox.

Panel widths: `min(94vw, 780px)` from 900px up, where the groups sit in two
columns with Departments spanning both rows; `min(92vw, 420px)` below 620px,
single column, with the edge tab shrinking to a 44x44 touch target.

Adding a link is just another `<li>` in the right `<ul>` — the stagger picks it
up automatically as long as no list grows past ten items (that is the range the
`--i` rules cover; extend them if a list gets longer).

## Campus activity hub (`#notices`)

The homepage section titled *What's happening on campus* is a 33 / 67 split:

- **Left — notice board.** All twenty notices from the site's three original
  streams (Campus News, Public Corner, Student Corner) merged into one list,
  ordered actionable-first, with the old stream names kept as category tags.
  It scrolls **inside itself** (`.board__scroll`, `max-height: 33rem` on
  desktop / `22rem` on mobile), so adding notices never lengthens the page.
  `overscroll-behavior: contain` stops the page scrolling when the list ends,
  and `tabindex="0"` makes the region keyboard-scrollable.
- **Right — featured events.** One large event at a time: image, badge, title
  and description. Three events rotate on a deliberately slow 30s cycle
  (~8.8s per event, ~1.2s cross-fade), with dots to pin one.

Two implementation notes worth keeping:

1. The slides are stacked by putting all three in **one CSS-grid cell**
   (`grid-area: 1 / 1`) rather than absolutely positioning them. The stage
   therefore auto-sizes to the tallest slide and needs no fixed height — so
   editing an event description cannot clip it.
2. Nothing inside a slide is focusable. That is deliberate: two of the three
   slides are always at `opacity: 0`, and links inside them would be
   tab-reachable but invisible. Each event's link lives in the notice board
   on the left instead.

To add an event: add a fourth radio, a `.e-4` article and a `.ed-4` dot, then
change the delays from thirds to quarters and the keyframe percentages from
`29.3 / 33.3` to `22 / 25`. The comments in section 10 spell this out, including
the counter-intuitive delay direction.

**Notice dates.** Only periods the source site actually states are shown
(`2024`, `2025`, `Jul-Dec 2026`). The rest carry a category tag and no date
rather than an invented one — wire real publication dates in from the CMS.

## Accreditation band (`#quality`)

The twelve-item pill list that used to sit in the About sidebar is now a
full-width band split into two tiers: five headline credentials as trust marks
(NAAC 'A', NBA 3x, UGC autonomy, ISO 9001:2015, NIRF) and nine compliance
documents as a quiet link row. All twelve original entries are still present.

## Content status

All content categories, department names, statistics, notice titles, alumni
entries and helpline numbers were taken from the live gndec.ac.in site.
Search for `TODO` to find the items that still need confirming:

- postal address and main switchboard number (footer and side panel, all three pages)
- `https://tnpgndec.com` — confirm the scheme on the live host
- spot counselling venue and dates (`admissions.html#spot`)
- waiting list and fee-structure tables are placeholder rows
- the enquiry/registration button needs the live module URL
