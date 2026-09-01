/**
 * Editorial imagery — CLAUDE.md §3 Imagery.
 *
 * Downloaded from the brand's own site, so these are Saints Crew's real
 * lifestyle photography rather than stock. Used for the homepage hero, the
 * category covers and the About page, where §3 asks for moody editorial shots
 * instead of white-background product cut-outs.
 */

export type EditorialImage = {
  url: string
  alt: string
}

/**
 * The hero slideshow, in order. Landscape crops only — anything portrait
 * letterboxes badly behind the headline.
 *
 * The first frame is what most visitors will actually see, so it loads eagerly
 * and the rest are fetched after mount (see HeroSlideshow).
 */
export const heroSlides: EditorialImage[] = [
  {
    url: '/images/editorial/banner-wide.jpeg',
    alt: 'A Saints Crew shirt worn open against a painted brick wall',
  },
  {
    url: '/images/editorial/look-01.jpg',
    alt: 'Saints Crew knitwear worn layered',
  },
  {
    url: '/images/editorial/look-03.jpg',
    alt: 'Saints Crew trousers photographed full length',
  },
  {
    url: '/images/editorial/look-04.jpg',
    alt: 'Saints Crew pieces styled together',
  },
]

/**
 * Category covers — a real product photograph per category, so the block shows
 * what you would actually be buying rather than a mood shot.
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

export const aboutImage: EditorialImage = {
  url: '/images/editorial/look-02.jpg',
  alt: 'A Saints Crew shirt worn open over a tee',
}
