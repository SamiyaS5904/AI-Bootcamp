import colourways from "./colourways.json";

/**
 * The 29 real styles currently in production.
 *
 * Nothing here is invented. Names, categories and fabrics come from the client.
 * `articleNo`, `sizes`, `material` and the confirmed `gsm` figures are lifted
 * from the client's own live product pages on panwarknitwear.com, which publish
 * a spec block per style — data the first cut of this rebuild dropped.
 *
 * `alias` carries the client's exact original product title so catalogue search
 * still matches the trade vocabulary buyers actually type: filice, ben collar,
 * dora pocket, bird eye, gulla, half baju, and the ZONIXA prefix.
 *
 * Five rows carry known inconsistencies in the source data and are marked
 * `sourceNote`. They are published exactly as the client publishes them — see
 * DOCUMENTATION.md for the list the owner needs to confirm.
 */
const RAW = [
  {
    id: 1, name: "320 GSM round-neck hoodie, embroidered logo",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "320",
    articleNo: "Round Neck Hood Logo", sizes: "L, XL, XXL",
    material: "320 GSM superior quality fabric",
    alias: "Zonixa Heavy 320 Gsm Round Neck Hoodies With Logo",
  },
  {
    id: 2, name: "320 GSM round-neck hoodie, print",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "320",
    articleNo: "RN Hood", sizes: "M, L, XL, XXL",
    material: "320 GSM superior quality fabric",
    alias: "Zonixa Heavy 320 GSM Round Neck Hoodies with Print",
  },
  {
    id: 3, name: "320 GSM heavy round-neck hoodie, chest print",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "320",
    articleNo: "Round Neck Hood Filice", sizes: "L, XL, XXL",
    material: "320 GSM superior quality fabric",
    alias: "Zonixa 320 GSM Heavy Round Neck Hoodies with Chest Print",
  },
  {
    id: 4, name: "320 GSM round-neck hoodie, chest and sleeve print",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "320",
    articleNo: "Shape Sweat R/N Hood", sizes: "L, XL, XXL",
    material: "320 GSM superior quality fabric",
    alias: "Zonixa 320 GSM Round Neck Hoodies with Chest and Sleeve Print",
  },
  {
    id: 5, name: "320 GSM heavy zip hoodie",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "320",
    articleNo: "Zip Hood Heavy", sizes: "L, XL, XXL",
    material: "320 GSM superior quality fabric",
    alias: "Zonixa 320 GSM Heavy Zip Hoodies",
  },
  {
    id: 6, name: "320 GSM heavy round-neck filice hood",
    cat: "Hoodies", fabric: "Russian Fleece", gsm: "320",
    articleNo: "Round Neck Hood Filice", sizes: "L, XL, XXL",
    material: "320 GSM superior quality fabric",
    alias: "Zonixa 320 GSM Heavy Round Neck Hood Filice",
  },
  {
    id: 7, name: "Shape swead 320 GSM round-neck hoodie",
    cat: "Hoodies", fabric: "NS Bonded", gsm: "320",
    articleNo: "Two Thread Round Neck Hood Chest Print", sizes: "L, XL, XXL",
    material: "Two-thread superior quality fabric",
    alias: "Zonixa Shape Swead 320 GSM Round Neck Hoodies",
    sourceNote: "Article name on the source page belongs to a different style.",
  },
  {
    id: 8, name: "Two-thread filice round-neck hoodie",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "300",
    articleNo: "23092", sizes: "M, L, XL",
    material: "Two-thread superior quality fabric",
    alias: "Zonixa Two Thread Filice Round Neck Hoodies",
    sourceNote: "Article number 23092 is repeated across four styles on the source site.",
  },
  {
    id: 9, name: "Two-thread filice round-neck hoodie II",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: null,
    articleNo: "Two Thread Filice Round Neck Hood", sizes: "L, XL, XXL",
    material: "Two-thread superior quality fabric",
    alias: "Zonixa Two Thread Filice Round Neck Hoodies",
  },
  {
    id: 10, name: "Two-thread round-neck hoodie, chest print",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: null,
    articleNo: "Two Thread Round Neck Hood Hoodie", sizes: "24, 26, 28, 30, 32, 34, 36",
    material: "Dry-fit matty fabric",
    alias: "Zonixa Two Thread Round Neck Hoodies with Chest Print",
    sourceNote:
      "Source page lists waist sizes and a dry-fit fabric for a fleece hoodie — both look like data entry errors.",
  },
  {
    id: 11, name: "Two-thread round-neck hoodie, chest print II",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: null,
    articleNo: "Two Thread Round Neck Hood Chest Print", sizes: "M, L, XL, XXL",
    material: "Two-thread superior quality fabric",
    alias: "Zonixa Two Thread Round Neck Hoodies with Chest Print",
  },
  {
    id: 12, name: "Two-thread logo filice hood",
    cat: "Hoodies", fabric: "Spun Fleece", gsm: "300",
    articleNo: "23092", sizes: "L, XL, XXL",
    material: "Two-thread superior quality fabric",
    alias: "Zonixa Two Thread Logo Filice Hood",
    sourceNote: "Article number 23092 is repeated across four styles on the source site.",
  },
  {
    id: 13, name: "Two-thread hood logo sweatshirt",
    cat: "Sweatshirts", fabric: "Spun Fleece", gsm: "300",
    articleNo: "23092", sizes: "L, XL, XXL",
    material: "Two-thread superior quality fabric",
    alias: "Zonixa Two Thread Hood Logo Sweatshirts",
    sourceNote: "Article number 23092 is repeated across four styles on the source site.",
  },
  {
    id: 14, name: "Round-neck hood-cut sweatshirt",
    cat: "Sweatshirts", fabric: "Spun Fleece", gsm: "300",
    articleNo: "ZN-RNH320", sizes: "M, L, XL, XXL",
    material: "Superior quality fabric",
    alias: "Zonixa Round Neck Hood Cut Sweatshirts",
  },
  {
    id: 15, name: "Round-neck filice sweatshirt",
    cat: "Sweatshirts", fabric: "Russian Fleece", gsm: "280",
    articleNo: null, sizes: "M, L, XL, XXL",
    material: null,
    alias: "Zonixas Round Neck Filice Sweatshirts",
  },
  {
    id: 16, name: "Feather bonding sweatshirt",
    cat: "Sweatshirts", fabric: "NS Bonded", gsm: null,
    articleNo: null, sizes: null,
    material: null,
    alias: "Zonixas Feather Bonding Sweatshirts",
  },
  {
    id: 17, name: "Shape bonding Ben-collar jacket",
    cat: "Jackets", fabric: "NS Bonded", gsm: "300",
    articleNo: "Shape Bonding Ben Collar", sizes: "M, L, XL, XXL",
    material: "Superior quality fabric",
    alias: "Zonixa Shape Bonding Ben Collar Jackets",
  },
  {
    id: 18, name: "Dry-fit Ben-collar half-sleeve T-shirt",
    cat: "T-shirts", fabric: "Dry Fit", gsm: null,
    articleNo: "981", sizes: "M, L, XL, XXL",
    material: "Dry-fit fabric",
    alias: "Zonixa Dry Fit Ben Collar Half Sleeve T Shirts",
  },
  {
    id: 19, name: "Full-sleeve Ben-collar button T-shirt",
    cat: "T-shirts", fabric: "Dry Fit", gsm: null,
    articleNo: "395", sizes: "M, L, XL, XXL",
    material: "Dry-fit fabric",
    alias: "Zonixa Full Sleeve Ben Collar Button T Shirts",
  },
  {
    id: 20, name: "Dry-fit matty round-neck T-shirt",
    cat: "T-shirts", fabric: "Dry Fit", gsm: null,
    articleNo: "RN282", sizes: "M, L, XL, XXL",
    material: "Dry-fit matty fabric",
    alias: "Zonixa Dry Fit Matty Round Neck T Shirts",
  },
  {
    id: 21, name: "Dry-fit matty lining double-gulla T-shirt",
    cat: "T-shirts", fabric: "Dry Fit", gsm: null,
    articleNo: "RN-525", sizes: "M, L, XL, XXL",
    material: "Dry-fit matty fabric",
    alias: "Zonixa Dry Fit Matty Lining Double Gulla T Shirt",
  },
  {
    id: 22, name: "Dry-fit matty collar half-sleeve cut-gulla T-shirt",
    cat: "T-shirts", fabric: "Dry Fit", gsm: null,
    articleNo: "DFC370", sizes: "M, L, XL, XXL",
    material: "Dry-fit matty fabric",
    alias: "Zonixa Dry Fit Matty Collar Half Sleeve Cut Gulla T Shirts",
  },
  {
    id: 23, name: "Dry-fit matty collar half-sleeve D-gulla T-shirt",
    cat: "T-shirts", fabric: "Dry Fit", gsm: null,
    articleNo: "DFC371", sizes: "M, L, XL, XXL",
    material: "Dry-fit matty fabric",
    alias: "Zonixa Dry Fit Matty Collar Half Sleeve D Gulla T Shirts",
  },
  {
    id: 24, name: "Round-neck half-sleeve T-shirt, chest print",
    cat: "T-shirts", fabric: "100% Cotton", gsm: null,
    articleNo: "RN271", sizes: "M, L, XL, XXL",
    material: "Superior quality fabric",
    alias: "Zonixa Round Neck Half Sleeve Chest Print T Shirts",
  },
  {
    id: 25, name: "Digital print T-shirt",
    cat: "T-shirts", fabric: "100% Cotton", gsm: "300",
    articleNo: "23092", sizes: "M, L, XL, XXL",
    material: "Superior quality fabric",
    alias: "Zonixa Digital Print T Shirts",
    sourceNote: "Article number 23092 is repeated across four styles on the source site.",
  },
  {
    id: 26, name: "Bird-eye cotton half-sleeve 2-piece collar T-shirt",
    cat: "T-shirts", fabric: "100% Cotton", gsm: null,
    articleNo: "11000", sizes: "M, L, XL, XXL",
    material: "Cotton bird-eye fabric",
    alias: "Zonixa Cotton Bird Eye Half Sleeve 2 Piece Collar T Shirts",
  },
  {
    id: 27, name: "Bird-eye cotton half-sleeve T-shirt",
    cat: "T-shirts", fabric: "100% Cotton", gsm: null,
    articleNo: null, sizes: "M, L, XL, XXL",
    material: null,
    alias: "Bird Eye Cotton Half Baju T Shirt",
  },
  {
    id: 28, name: "PC cotton half-sleeve T-shirt",
    cat: "T-shirts", fabric: "PC Cotton", gsm: null,
    articleNo: "454", sizes: "M, L, XL, XXL",
    material: "PC cotton fabric",
    alias: "Zonixa PC Cotton Half Sleeve T Shirts",
  },
  {
    id: 29, name: "PC colour dora pocket half-sleeve T-shirt",
    cat: "T-shirts", fabric: "PC Cotton", gsm: null,
    articleNo: "465", sizes: "M, L, XL, XXL",
    material: "PC fabric",
    alias: "Zonixa PC Colour Dora Pocket Half Sleeve T Shirts",
  },
];

export const PRODUCTS = RAW.map((row) => {
  const slug = `p${String(row.id).padStart(2, "0")}`;
  return {
    ...row,
    slug,
    weight: row.gsm ?? "tbc",
    gsm: row.gsm ? `${row.gsm} GSM` : "{{GSM}}",
    gsmConfirmed: Boolean(row.gsm),
    img: `/img/${slug}.jpg`,
    // Dominant tones read out of the photograph itself (scripts/sample_colours.py).
    // These are an at-a-glance hint of the run in the shot — NOT an orderable
    // colour card: shades are made to the buyer's card, and the sampler cannot
    // fully separate the run from the hero garment and the charcoal floor.
    colours: colourways[slug] ?? [],
    alt: `${row.name} laid flat on charcoal, shown with its colour run`,
    // What free-text search reads. The alias keeps the client's own trade terms
    // searchable even though the display names were rewritten in sentence case.
    haystack: [row.name, row.cat, row.fabric, row.alias, row.articleNo, row.material]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
});

export const CATEGORIES = ["All", "Hoodies", "Sweatshirts", "T-shirts", "Jackets"];

export const FABRICS = [
  "All",
  "Spun Fleece",
  "Russian Fleece",
  "NS Bonded",
  "Dry Fit",
  "100% Cotton",
  "PC Cotton",
];

export const GSM_FILTERS = ["All", "320 GSM", "300 GSM", "Weight to confirm"];
