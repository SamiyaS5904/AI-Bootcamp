import colourways from "./colourways.json";

/**
 * The 29 real styles currently in production.
 *
 * Nothing here is invented: names, categories and fabrics come from the client.
 * `gsm` is only a real figure on the 320 GSM line — every other weight is still
 * awaiting confirmation from the mill and stays visibly bracketed.
 */
const RAW = [
  [1, "320 GSM round-neck hoodie, embroidered logo", "Hoodies", "Spun Fleece", "320"],
  [2, "320 GSM round-neck hoodie, print", "Hoodies", "Spun Fleece", "320"],
  [3, "320 GSM heavy round-neck hoodie, chest print", "Hoodies", "Spun Fleece", "320"],
  [4, "320 GSM round-neck hoodie, chest and sleeve print", "Hoodies", "Spun Fleece", "320"],
  [5, "320 GSM heavy zip hoodie", "Hoodies", "Spun Fleece", "320"],
  [6, "320 GSM heavy round-neck filice hood", "Hoodies", "Russian Fleece", "320"],
  [7, "Shape swead 320 GSM round-neck hoodie", "Hoodies", "NS Bonded", "320"],
  [8, "Two-thread filice round-neck hoodie", "Hoodies", "Spun Fleece", "tbc"],
  [9, "Two-thread filice round-neck hoodie II", "Hoodies", "Spun Fleece", "tbc"],
  [10, "Two-thread round-neck hoodie, chest print", "Hoodies", "Spun Fleece", "tbc"],
  [11, "Two-thread round-neck hoodie, chest print II", "Hoodies", "Spun Fleece", "tbc"],
  [12, "Two-thread logo filice hood", "Hoodies", "Spun Fleece", "tbc"],
  [13, "Two-thread hood logo sweatshirt", "Sweatshirts", "Spun Fleece", "tbc"],
  [14, "Round-neck hood-cut sweatshirt", "Sweatshirts", "Spun Fleece", "tbc"],
  [15, "Round-neck filice sweatshirt", "Sweatshirts", "Russian Fleece", "tbc"],
  [16, "Feather bonding sweatshirt", "Sweatshirts", "NS Bonded", "tbc"],
  [17, "Shape bonding Ben-collar jacket", "Jackets", "NS Bonded", "tbc"],
  [18, "Dry-fit Ben-collar half-sleeve T-shirt", "T-shirts", "Dry Fit", "tbc"],
  [19, "Full-sleeve Ben-collar button T-shirt", "T-shirts", "Dry Fit", "tbc"],
  [20, "Dry-fit matty round-neck T-shirt", "T-shirts", "Dry Fit", "tbc"],
  [21, "Dry-fit matty lining double-gulla T-shirt", "T-shirts", "Dry Fit", "tbc"],
  [22, "Dry-fit matty collar half-sleeve cut-gulla T-shirt", "T-shirts", "Dry Fit", "tbc"],
  [23, "Dry-fit matty collar half-sleeve D-gulla T-shirt", "T-shirts", "Dry Fit", "tbc"],
  [24, "Round-neck half-sleeve T-shirt, chest print", "T-shirts", "100% Cotton", "tbc"],
  [25, "Digital print T-shirt", "T-shirts", "100% Cotton", "tbc"],
  [26, "Bird-eye cotton half-sleeve 2-piece collar T-shirt", "T-shirts", "100% Cotton", "tbc"],
  [27, "Bird-eye cotton half-sleeve T-shirt", "T-shirts", "100% Cotton", "tbc"],
  [28, "PC cotton half-sleeve T-shirt", "T-shirts", "PC Cotton", "tbc"],
  [29, "PC colour dora pocket half-sleeve T-shirt", "T-shirts", "PC Cotton", "tbc"],
];

export const PRODUCTS = RAW.map(([id, name, cat, fabric, weight]) => {
  const slug = `p${String(id).padStart(2, "0")}`;
  return {
    id,
    slug,
    name,
    cat,
    fabric,
    weight,
    gsm: weight === "320" ? "320 GSM" : "{{GSM}}",
    gsmConfirmed: weight === "320",
    img: `/img/${slug}.jpg`,
    // Dominant tones read out of the photograph itself (scripts/sample_colours.py).
    // These are an at-a-glance hint of the run in the shot — NOT an orderable
    // colour card: shades are made to the buyer's card, and the sampler cannot
    // fully separate the run from the hero garment and the charcoal floor.
    colours: colourways[slug] ?? [],
    alt: `${name} laid flat on charcoal, shown with its colour run`,
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

export const GSM_FILTERS = ["All", "320 GSM", "Weight to confirm"];

export function countBy(list, key) {
  return list.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}
