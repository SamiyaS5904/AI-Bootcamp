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

The tagline under the college name is *Vidya Vichari Ta Parupkari*, the
Gurbani line inscribed over the college entrance (visible on the plaque in
`images/originals/gne_front.jpg`). The English gloss after the em dash is
hidden below 900px via `.brand__gloss` so the header stays two lines tall.

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
| Notice board tabs | radio group; `#tab-x:checked ~ .tabs__panels .panel--x { display: block }` | style.css §10 |
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

## Content status

All content categories, department names, statistics, notice titles, alumni
entries and helpline numbers were taken from the live gndec.ac.in site.
Search for `TODO` to find the items that still need confirming:

- postal address and main switchboard number (footer and side panel, all three pages)
- `https://tnpgndec.com` — confirm the scheme on the live host
- spot counselling venue and dates (`admissions.html#spot`)
- waiting list and fee-structure tables are placeholder rows
- the enquiry/registration button needs the live module URL
