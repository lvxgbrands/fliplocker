// Pricing content model. Three FlipLocker packages presented as a marketing
// layer on top of the per-deal service fee (which is a function of SALE PRICE
// ONLY — see src/lib/fees.ts — and is never affected by a card's market value).
//
// Subscriptions are billed monthly or annually; annual billing saves 17%
// (industry-average). All numbers live here, not in the page.

export const ANNUAL_SAVINGS = 0.17; // 17% off when billed annually

export type Billing = "monthly" | "annual";

export interface Package {
  id: "single" | "plus" | "pro";
  name: string;
  tagline: string;
  /** List price per month when billed monthly (USD). 0 = no subscription. */
  priceMonthly: number;
  popular?: boolean;
  ctaLabel: string;
  ctaHref: string;
  who: string; // who it's for
  why: string; // the core benefit
  perDeal: string; // per-deal service-fee summary line
  features: string[];
}

export const PACKAGES: Package[] = [
  {
    id: "single",
    name: "Single",
    tagline: "Pay per deal. No subscription.",
    priceMonthly: 0,
    ctaLabel: "Start a single deal",
    ctaHref: "/register",
    who: "For the occasional seller closing a one-off deal from a social-media DM.",
    why: "Everything you need to close one deal safely, with no monthly commitment — you only pay the per-deal service fee when a deal actually happens.",
    perDeal: "Standard per-deal service fee, based on the sale price",
    features: [
      "One documented deal at a time",
      "Hub inspection, 15-second video + 2 photos",
      "Tamper-seal logging bound to the deal",
      "Insured two-leg shipping, signature delivery",
      "Payment held by our payment processor",
      "Live transparency timeline",
      "Email support",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "For sellers who deal every week.",
    priceMonthly: 12,
    popular: true,
    ctaLabel: "Choose Plus",
    ctaHref: "/register?plan=plus",
    who: "For active social sellers and mid-volume collectors moving several cards a month.",
    why: "Everything in Single, plus higher throughput, saved buyers and shipping presets, and priority documentation so your deals move faster.",
    perDeal: "Standard per-deal service fee, based on the sale price",
    features: [
      "Unlimited concurrent deals",
      "Priority hub documentation queue",
      "Saved buyers & reusable deal templates",
      "Configurable who-pays-fees (buyer / seller / split)",
      "Bulk deal creation",
      "Deal analytics & exportable records",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For high-volume & high-value dealers.",
    priceMonthly: 29,
    ctaLabel: "Choose Pro",
    ctaHref: "/register?plan=pro",
    who: "For breakers, shops, and high-value dealers who need the lowest per-deal fee and white-glove handling.",
    why: "Everything in Plus, on the Pro per-deal fee schedule, with white-glove documentation, extended coverage options, and a dedicated contact.",
    perDeal: "Lowest per-deal service fee (Pro fee schedule), based on the sale price",
    features: [
      "Everything in Plus",
      "Pro per-deal service-fee schedule",
      "White-glove documentation for high-value slabs",
      "Extended declared-value coverage options",
      "Group-buy & breaker settlement tools",
      "Team seats & role permissions",
      "Dedicated account contact & priority hub handling",
    ],
  },
];

export interface CompareRow {
  label: string;
  single: string | boolean;
  plus: string | boolean;
  pro: string | boolean;
}
export interface CompareSection {
  heading: string;
  rows: CompareRow[];
}

export const COMPARISON: CompareSection[] = [
  {
    heading: "Deals & documentation",
    rows: [
      { label: "Concurrent deals", single: "1 at a time", plus: "Unlimited", pro: "Unlimited" },
      { label: "Hub inspection video + 2 photos", single: true, plus: true, pro: true },
      { label: "Tamper-seal logging", single: true, plus: true, pro: true },
      { label: "Priority documentation queue", single: false, plus: true, pro: true },
      { label: "White-glove high-value handling", single: false, plus: false, pro: true },
    ],
  },
  {
    heading: "Payments & fees",
    rows: [
      { label: "Payment held by our payment processor", single: true, plus: true, pro: true },
      { label: "Per-deal fee based on sale price only", single: true, plus: true, pro: true },
      { label: "Configurable who-pays-fees", single: false, plus: true, pro: true },
      { label: "Per-deal service-fee schedule", single: "Standard", plus: "Standard", pro: "Pro (lowest)" },
      { label: "Extended declared-value coverage", single: false, plus: false, pro: true },
    ],
  },
  {
    heading: "Shipping & delivery",
    rows: [
      { label: "Insured two-leg shipping", single: true, plus: true, pro: true },
      { label: "Signature delivery (never waived)", single: true, plus: true, pro: true },
      { label: "Saved shipping presets", single: false, plus: true, pro: true },
    ],
  },
  {
    heading: "Tools & support",
    rows: [
      { label: "Live transparency timeline", single: true, plus: true, pro: true },
      { label: "Saved buyers & deal templates", single: false, plus: true, pro: true },
      { label: "Deal analytics & record export", single: false, plus: true, pro: true },
      { label: "Group-buy & breaker settlement", single: false, plus: false, pro: true },
      { label: "Team seats & role permissions", single: false, plus: false, pro: true },
      { label: "Support", single: "Email", plus: "Priority email", pro: "Dedicated contact" },
    ],
  },
];

// ---- Price math -----------------------------------------------------------

/** Effective per-month price for a billing cadence (annual applies the 17% discount). */
export function effectiveMonthly(pkg: Package, billing: Billing): number {
  if (pkg.priceMonthly === 0) return 0;
  return billing === "annual"
    ? Math.round(pkg.priceMonthly * (1 - ANNUAL_SAVINGS) * 100) / 100
    : pkg.priceMonthly;
}

/** Total charged per year for a billing cadence. */
export function annualTotal(pkg: Package): number {
  if (pkg.priceMonthly === 0) return 0;
  return Math.round(pkg.priceMonthly * 12 * (1 - ANNUAL_SAVINGS));
}

export function formatUsd(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** For Product/Offer JSON-LD — annual effective price per tier. */
export function offerData() {
  return PACKAGES.map((p) => ({
    name: `FlipLocker ${p.name}`,
    price: p.priceMonthly === 0 ? "0" : annualTotal(p).toFixed(2),
    description: p.tagline,
  }));
}
