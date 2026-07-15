// Central information architecture for the FlipLocker marketing site.
// Drives the mega-menu nav, the footer link grid, and the XML sitemap so the
// three never drift apart. Icons are lucide-react names resolved at render.

import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  ScanSearch,
  Truck,
  ListChecks,
  ShieldCheck,
  Trash2,
  Share2,
  Gem,
  BadgeDollarSign,
  Sparkles,
  Boxes,
  BookOpen,
  HelpCircle,
  Building2,
  Mail,
  Tag,
  Layers,
} from "lucide-react";

export interface NavLeaf {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

export interface MegaColumn {
  heading: string;
  links: NavLeaf[];
}

export interface MegaFeatured {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}

export interface TopNavItem {
  label: string;
  href: string;
  mega?: {
    columns: MegaColumn[];
    featured: MegaFeatured;
  };
}

// ---- Platform pillars (also the /platform/[slug] source of truth is platform.ts) ----
export const PLATFORM_LINKS: NavLeaf[] = [
  {
    href: "/platform/payments-held-by-processor",
    label: "Payments held by the processor",
    desc: "Buyer funds sit with PayPal, never FlipLocker, until delivery is signed for.",
    icon: Wallet,
  },
  {
    href: "/platform/hub-documentation",
    label: "Hub documentation",
    desc: "Every card is filmed, photographed, and logged at our documentation hub.",
    icon: ScanSearch,
  },
  {
    href: "/platform/signature-delivery",
    label: "Insured signature delivery",
    desc: "Two insured USPS legs with a signature that is never waived.",
    icon: Truck,
  },
  {
    href: "/platform/transparency-timeline",
    label: "Transparency timeline",
    desc: "A timestamped, append-only record both parties watch in real time.",
    icon: ListChecks,
  },
  {
    href: "/platform/tamper-seal",
    label: "Tamper-seal chain",
    desc: "A numbered seal is logged and bound to the deal before the card ships onward.",
    icon: ShieldCheck,
  },
  {
    href: "/platform/media-auto-purge",
    label: "Media auto-purge",
    desc: "Inspection video and photos are deleted 30 days after delivery, by default.",
    icon: Trash2,
  },
];

// ---- Solutions by audience (source of truth for content is solutions.ts) ----
export const SOLUTIONS_LINKS: NavLeaf[] = [
  {
    href: "/solutions/social-sellers",
    label: "Social sellers",
    desc: "Close the Instagram, X, or Discord deal without the DM-payment gamble.",
    icon: Share2,
  },
  {
    href: "/solutions/collectors",
    label: "Serious collectors & buyers",
    desc: "Buy the card you negotiated with a documented, signature-delivered handoff.",
    icon: Gem,
  },
  {
    href: "/solutions/high-value-cards",
    label: "High-value cards",
    desc: "Four- and five-figure deals with insured legs and a logged tamper seal.",
    icon: BadgeDollarSign,
  },
  {
    href: "/solutions/first-time-deals",
    label: "First-time deals",
    desc: "Never dealt with a stranger before? Here's the safe way to start.",
    icon: Sparkles,
  },
  {
    href: "/solutions/breakers",
    label: "Breakers & group buys",
    desc: "Settle post-break hits and group-buy payouts with a clean paper trail.",
    icon: Boxes,
  },
];

export const TOP_NAV: TopNavItem[] = [
  {
    label: "Platform",
    href: "/platform",
    mega: {
      columns: [
        { heading: "How FlipLocker protects a deal", links: PLATFORM_LINKS.slice(0, 3) },
        { heading: "The record we build", links: PLATFORM_LINKS.slice(3) },
      ],
      featured: {
        href: "/security",
        eyebrow: "Security & limits",
        title: "What documentation proves — and what it doesn't",
        body: "The honest version. Exactly what happens to a card at the hub, and the limits every buyer and seller should understand.",
      },
    },
  },
  {
    label: "Solutions",
    href: "/solutions",
    mega: {
      columns: [
        { heading: "For sellers", links: [SOLUTIONS_LINKS[0], SOLUTIONS_LINKS[4]] },
        { heading: "For buyers", links: [SOLUTIONS_LINKS[1], SOLUTIONS_LINKS[3]] },
        { heading: "By stakes", links: [SOLUTIONS_LINKS[2]] },
      ],
      featured: {
        href: "/how-it-works",
        eyebrow: "The flow",
        title: "From a social-media handshake to a signed delivery",
        body: "Eight steps, fully documented and timestamped on a timeline both parties can watch in real time.",
      },
    },
  },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Insights",
    href: "/insights",
    mega: {
      columns: [], // filled at render from the article index (see marketing nav)
      featured: {
        href: "/insights",
        eyebrow: "The FlipLocker blog",
        title: "Playbooks for safe peer-to-peer card deals",
        body: "Original, practical guides on selling on social, spotting scams, shipping slabs, and what card documentation really means.",
      },
    },
  },
  { label: "FAQ", href: "/faq" },
];

// ---- Footer grid ----
export interface FooterColumn {
  heading: string;
  links: { href: string; label: string }[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      { href: "/platform", label: "Overview" },
      { href: "/platform/payments-held-by-processor", label: "Payments" },
      { href: "/platform/hub-documentation", label: "Hub documentation" },
      { href: "/platform/signature-delivery", label: "Signature delivery" },
      { href: "/security", label: "Security & limits" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { href: "/solutions", label: "Overview" },
      { href: "/solutions/social-sellers", label: "Social sellers" },
      { href: "/solutions/collectors", label: "Collectors & buyers" },
      { href: "/solutions/high-value-cards", label: "High-value cards" },
      { href: "/solutions/breakers", label: "Breakers & group buys" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/insights", label: "Insights" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/insights", label: "Blog" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

// Icons re-exported so the mega-menu can map section headers to a glyph.
export const SECTION_ICONS = { Tag, Layers, BookOpen, HelpCircle, Building2, Mail } as const;

// Flat list of every indexable marketing route — used to build the sitemap.
export const STATIC_MARKETING_ROUTES: string[] = [
  "/",
  "/platform",
  "/solutions",
  "/how-it-works",
  "/pricing",
  "/insights",
  "/faq",
  "/about",
  "/contact",
  "/security",
  "/terms",
  "/privacy",
  "/disclaimer",
  ...PLATFORM_LINKS.map((l) => l.href),
  ...SOLUTIONS_LINKS.map((l) => l.href),
];
