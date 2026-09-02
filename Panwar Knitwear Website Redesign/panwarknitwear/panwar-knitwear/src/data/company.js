/**
 * Real company facts. Anything the client has not supplied yet stays in
 * `PLACEHOLDERS` and renders visibly bracketed, so it can never pass as real.
 */

export const PHONES = [
  { display: "+91 98760 45457", tel: "+919876045457", whatsapp: true },
  { display: "+91 98157 03769", tel: "+919815703769" },
  { display: "+91 99999 82998", tel: "+919999982998" },
];

export const WHATSAPP_NUMBER = "919876045457";

export const PLACEHOLDERS = {
  moq: "{{MOQ}}",
  lead: "{{lead time}}",
  capacity: "{{monthly capacity}}",
  email: "{{email}}",
  gsm: "{{GSM}}",
  gsmRange: "{{GSM range}}",
  address: "{{street address}}",
  fit: "{{fit}}",
  sizes: "{{size range}}",
};

export const FABRIC_LIBRARY = [
  {
    name: "Spun Fleece",
    gsm: "320",
    note: "Brushed inner face. Our signature heavy winter hoodies and sweatshirts.",
  },
  { name: "Dry Fit", gsm: null, note: "Moisture-wicking polyester knit. Sports tees, team kit and matty collars." },
  { name: "Honeycomb Lycra", gsm: null, note: "Textured knit with stretch. Collared tees that hold their shape." },
  { name: "100% Cotton", gsm: null, note: "Breathable single jersey and bird eye. Everyday round-neck tees." },
  { name: "Cotton Lycra", gsm: null, note: "Cotton with elastane for recovery. Fitted tees, lowers and capri." },
  { name: "NS Bonded", gsm: null, note: "Two layers bonded together. Ben-collar jackets and structured sweatshirts." },
  { name: "Russian Fleece", gsm: null, note: "Dense winter fleece with a fuller pile. Hoodies and fleece sweatshirts." },
  { name: "Sherpa", gsm: null, note: "High-pile lining fabric. Winter jacket bodies and hood linings." },
];

export const PROCESS = [
  ["Fabric sourcing", "Yarn and knitted fabric sourced to your spec."],
  ["Knitting", "Fleece, jersey and bonded fabric knitted to weight."],
  ["Dyeing", "Shade matched to your card and checked for fastness."],
  ["Cutting", "Layers cut to the approved pattern and size set."],
  ["Stitching", "Assembled on our own line, seam by seam."],
  ["Printing & embroidery", "Chest, sleeve and hood branding applied in-house."],
  ["Quality check", "Finish, measurement and shade checked piece by piece."],
  ["Packing", "Folded, tagged and sealed in branded poly bags."],
  ["Dispatch", "Loaded and dispatched to your city on the agreed date."],
];

export const CATEGORY_CARDS = [
  {
    name: "Hoodies",
    img: "/img/p05.jpg",
    gsm: "320 GSM",
    confirmed: true,
    note: "Round-neck and zip, two-thread and heavy fleece, with embroidery or print.",
    alt: "320 GSM heavy zip hoodie shown with its colour run",
  },
  {
    name: "Sweatshirts",
    img: "/img/p13.jpg",
    gsm: "320 GSM",
    confirmed: true,
    note: "Round-neck, hood-cut and bonded, in spun and Russian fleece.",
    alt: "Two-thread hooded sweatshirt shown with its colour run",
  },
  {
    name: "T-shirts",
    img: "/img/p20.jpg",
    gsm: PLACEHOLDERS.gsmRange,
    confirmed: false,
    note: "Round-neck, collar, Ben-collar and dora pocket, in cotton, PC and dry fit.",
    alt: "Dry-fit matty round-neck T-shirts shown with their colour run",
  },
  {
    name: "Jackets",
    img: "/img/p17.jpg",
    gsm: PLACEHOLDERS.gsmRange,
    confirmed: false,
    note: "Bonded shells with Ben collar, Sherpa-lined options on request.",
    alt: "Shape-bonded Ben-collar jacket shown with its colour run",
  },
  {
    name: "Track pants & lowers",
    slot: "MSP Sports track pant flat lay + colour run — needed from client",
    gsm: PLACEHOLDERS.gsmRange,
    confirmed: false,
    note: "Men's and boys' lowers, track pants and capri under MSP Sports.",
  },
  {
    name: "Shorts",
    slot: "MSP Sports shorts / nikkar + colour run — needed from client",
    gsm: PLACEHOLDERS.gsmRange,
    confirmed: false,
    note: "Men's shorts and nikkar in cotton and cotton lycra.",
  },
];

export const SERVICES = [
  ["Your brand, your labels", "Woven labels, neck prints, size and care labels, hang tags."],
  ["Printing", "Screen, digital and DTF, on chest, back and sleeve."],
  ["Embroidery", "Logos on chest, sleeve and hood, in-house."],
  ["Custom GSM and fabric", "Set the weight and hand feel you sell at."],
  ["Sampling before bulk", "Approve a physical sample, then we run the order."],
  ["Branded poly-bag packing", "Printed bags with wash-care symbols, ready for retail."],
];

export const REASONS = [
  ["Transparent dealings", "Specs, fabric and rates confirmed in writing before we start.", "square"],
  ["Customised options", "Fabric, GSM, fit, colourways and branding set by your order.", "ring"],
  ["Prompt delivery", "Dispatch dates agreed up front and tracked to the day.", "diamond"],
  ["In-house quality checks", "Smooth texture, skin-friendly finish, colourfast and long-lasting.", "ring-circle"],
  ["Well-equipped warehouse", "Stock held and packed in-house, ready for bulk dispatch.", "circle"],
  ["Wide distribution network", "Supplying wholesalers and retailers across India since 2016.", "ring-diamond"],
];

export const LEADERSHIP = [
  ["Mohar Singh Panwar", "Founder"],
  ["Prabhu Panwar", "Co-founder & CEO"],
  ["Bhala Ram Panwar", "Co-founder & CEO"],
];

export const TIMELINE = [
  ["2016", "Founded in Ludhiana", true],
  ["2017", "GST registered", false],
  ["ZONIXA", "Top-wear brand launched", false],
  ["MSP", "MSP Sports added for bottom wear", false],
  ["Today", "29 styles, 8 fabrics, 26–50 people", true],
];

export const LISTINGS = ["JustDial", "IndiaMART", "TradeIndia", "Google Business", "LinkedIn"];

export const NAV = [
  ["Products", "products"],
  ["Fabrics", "fabrics"],
  ["Manufacturing", "manufacturing"],
  ["Private label", "private-label"],
  ["About", "about"],
  ["Contact", "enquiry"],
];
