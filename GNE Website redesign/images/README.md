# Images

## In use

All four campus photographs supplied for the project are used exactly once, at
a size where the source resolution still holds up. Derivatives were generated
with Pillow (JPEG q78-80, progressive, `optimize=True`).

| File | Used by | Source |
|---|---|---|
| `campus-fountain-{800,1280,1920}.jpg` | hero slide 1 | `originals/gne_ludhiana_cover.jpe` (5184x3456) |
| `campus-entrance-{800,1280}.jpg` | hero slide 2 | `originals/gne_front.jpg` (1440x960) |
| `campus-block-{800,915}.jpg` | Academics band, `index.html` | `originals/gndec-ludhiana-campus-admission.webp` (919x515) |
| `campus-courtyard-{480,697}.jpg` | About section figure, `index.html` | `originals/1519122882phpRESgjV.png` (815x523) |
| `crest-gndec.png` | header, footer, side panel, favicon | `originals/logo.png` (296x300) |

Each `<img>` carries a `srcset` plus a `sizes` hint, so the browser downloads
the smallest file that suits the viewport and pixel density. Below-the-fold
images are `loading="lazy" decoding="async"`.

## Why only two hero slides

The hero is full-bleed, so it needs roughly 1920px of source. Only the
fountain and entrance photos have it. The academic block (915px) and courtyard
(697px) would visibly soften when upscaled across a wide screen, so they are
placed in content sections instead, where they render at ~520px and ~420px and
still have headroom on a 2x display.

To add a third hero slide you need a landscape photo of at least 1600px:
generate `campus-<name>-{800,1280,1920}.jpg`, add a `#hero-3` radio, an
`.s-3` figure and a `.d-3` dot in every page, then retime the keyframes in
`style.css` section 07 from halves to thirds - the comments there spell out
which numbers to change.

## The crest

`originals/logo.png` is red-and-blue line art on transparency, drawn for light
backgrounds. `crest-gndec.png` is that file trimmed to its bounding box,
resized to 288px and palette-quantised to 64 colours (156 KB -> 18 KB).
Wherever it sits on navy - the footer and the side panel header - CSS puts it
on a white disc rather than dropping it straight onto the dark background.

## originals/

Untouched source files, kept for future re-crops. Nothing references them, so
they are never downloaded by a visitor. Safe to archive elsewhere.
