/**
 * Editorial imagery — CLAUDE.md §3 Imagery.
 *
 * The brand's own lifestyle photography, downloaded from saintscrew.co.in, so
 * these are real Saints Crew shots rather than stock.
 *
 * The hero is art-directed per breakpoint rather than resized: the source is a
 * 2.2:1 banner, and letting `object-cover` crop that into a tall phone viewport
 * loses the subject entirely. `hero-portrait` is a dedicated 4:5 cut framed on
 * the model; `hero-landscape` is the wide frame for desktop.
 */

export type EditorialImage = {
  url: string
  alt: string
}

export const hero = {
  landscape: '/images/editorial/hero-landscape.jpg',
  portrait: '/images/editorial/hero-portrait.jpg',
  alt: 'A Saints Crew shirt worn open, photographed against a painted brick wall',
}

/** Full-bleed image for the mid-page editorial break. */
export const editorialBreak: EditorialImage = {
  url: '/images/editorial/look-04.jpg',
  alt: 'Saints Crew pieces styled together in natural light',
}

/** Portrait shot beside the brand philosophy copy. */
export const philosophyImage: EditorialImage = {
  url: '/images/editorial/look-02.jpg',
  alt: 'A Saints Crew shirt worn open over a tee',
}

export const aboutImage: EditorialImage = {
  url: '/images/editorial/look-01.jpg',
  alt: 'Saints Crew knitwear worn layered',
}

/**
 * Category covers — a real product photograph per category, so the block shows
 * the garment rather than a mood.
 */
export const categoryCovers: Record<string, EditorialImage> = {
  knitwear: {
    url: '/images/products/striped-sweater.jpg',
    alt: 'Saints Crew striped knitted sweater',
  },
  shirts: {
    url: '/images/products/olive-green-striped-shirt.jpeg',
    alt: "Saints Crew men's olive green striped shirt",
  },
  trousers: {
    url: '/images/products/khaki-cargo-trouser.jpg',
    alt: 'Saints Crew khaki cargo trouser',
  },
}
