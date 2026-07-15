// Static content for the logged-out marketing site. Card art is served from
// /public/cards; prices & stats mirror the demo roster (real T206 cards).

export interface ShowcaseCard {
  slug: string;
  player: string;
  meta: string;
  grade: string;
  price: string;
  stat: string;
}

export const SHOWCASE: ShowcaseCard[] = [
  {
    slug: "johnson",
    player: "Walter Johnson",
    meta: "1909 T206 · Washington",
    grade: "PSA 1",
    price: "$2,450",
    stat: "417 W · 2.17 ERA · 3,509 K · HOF 1936",
  },
  {
    slug: "baker",
    player: "Frank “Home Run” Baker",
    meta: "1909 T206 · Phila. Athletics",
    grade: "PSA 3",
    price: "$385",
    stat: "4× AL HR leader · .307 career · HOF 1955",
  },
  {
    slug: "seymour",
    player: "Cy Seymour",
    meta: "1909 T206 · Cincinnati",
    grade: "PSA 3",
    price: "$165",
    stat: "1905 NL batting champion at .377",
  },
];

export const TICKER = [
  "Hub-verified on video",
  "Funds held by our payment processor",
  "Signature delivery — never waived",
  "Tamper-sealed & insured in transit",
  "Private & invitation-only",
  "Card verified & documented",
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How is my money held?",
    a: "The buyer pays through PayPal checkout and the funds are held securely by our payment processor — never by FlipLocker. They're released to the seller only after the card passes hub inspection and is delivered with a confirmed signature, plus a 48-hour buyer review window. FlipLocker's account receives only its service fee.",
  },
  {
    q: "What does verification cover — and what does it not?",
    a: "The hub confirms a physical card matching the seller's listing, in a slab whose certificate number is valid and active in the grading company's registry, and documents it on a 15-second video and two photos with a logged tamper seal. This is an administrative data-match and documentation service. It is not a forensic examination: FlipLocker does not chemically or microscopically examine a card and cannot, for example, detect a genuine certificate number reprinted onto a counterfeit slab, or a slab that was opened and resealed. Cards are verified and documented — not graded or guaranteed genuine.",
  },
  {
    q: "What are the fees?",
    a: "FlipLocker charges a service fee based solely on the card's sale price — the card's market value is never used. There are Free and Pro tiers, and who pays (buyer, seller, or split) is configurable. Every line item is shown transparently at checkout before anyone pays.",
  },
  {
    q: "How does shipping work?",
    a: "Two insured USPS legs: the seller ships to the FlipLocker hub, and after verification the hub ships to the buyer with Signature Confirmation, which is never waived. Both legs are tracked end-to-end on the deal timeline.",
  },
  {
    q: "What are the timelines?",
    a: "A 72-hour window for the seller to ship after payment, hub inspection on arrival, signature delivery to the buyer, then a 48-hour buyer review window before the seller's payout is released. Every step is timestamped on the transparency timeline.",
  },
  {
    q: "What happens if the card fails inspection?",
    a: "If the card doesn't match the listing, the deal is flagged, the buyer is automatically refunded, the documentation is shared with both parties, and a return label is issued to the seller. The buyer is never left holding a mismatch.",
  },
];
