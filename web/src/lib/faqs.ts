// All marketing FAQ content. Per-page FAQs give each page its own contextual
// Q&A (and FAQPage JSON-LD); FAQ_HUB powers the comprehensive /faq page.
// Compliance: only approved framing — "documented", "inspection", "held by our
// payment processor", "confirm". Avoid the restricted terms enforced by
// scripts/check-copy.mjs (see docs/COMPLIANCE-NOTES.md).

export interface QA {
  q: string;
  a: string;
}

export const HOME_FAQS: QA[] = [
  {
    q: "How is my money held?",
    a: "The buyer pays through PayPal checkout and the funds are held securely by our payment processor — never by FlipLocker. They're released to the seller only after the card passes hub inspection and is delivered with a confirmed signature, plus a 48-hour buyer review window. FlipLocker's account receives only its service fee.",
  },
  {
    q: "What does documentation cover — and what does it not?",
    a: "The hub confirms a physical card matching the seller's listing, in a slab whose certificate number is valid and active in the grading company's registry, and documents it on a 15-second video and two photos with a logged tamper seal. This is an administrative data-match and documentation service, not a forensic examination. FlipLocker does not grade cards and does not guarantee a slab is genuine. Cards are documented — not graded or guaranteed genuine.",
  },
  {
    q: "What are the fees?",
    a: "FlipLocker charges a service fee based solely on the card's sale price — the card's market value is never used. Three packages (Single, Plus, Pro) layer volume and features on top, and who pays the per-deal fee (buyer, seller, or split) is configurable. Every line item is shown transparently at checkout before anyone pays.",
  },
  {
    q: "How does shipping work?",
    a: "Two insured USPS legs: the seller ships to the FlipLocker hub, and after documentation the hub ships to the buyer with Signature Confirmation, which is never waived. Both legs are tracked end-to-end on the deal timeline.",
  },
  {
    q: "Is FlipLocker a marketplace?",
    a: "No. FlipLocker is invitation-only and has no listings to browse or buy. Buyers and sellers agree on a card and price off-platform — on social media, at a show, in a group chat — and bring the deal to FlipLocker to close it safely.",
  },
  {
    q: "What happens if the card fails inspection?",
    a: "If the card doesn't match the listing, the deal is flagged, the buyer is automatically refunded, the documentation is shared with both parties, and a return label is issued to the seller. The buyer is never left holding a mismatch.",
  },
];

export const HOW_IT_WORKS_FAQS: QA[] = [
  {
    q: "Do both people need a FlipLocker account?",
    a: "The seller creates the deal and the buyer receives a private, one-time invitation link. The buyer claims the invite to review the itemized checkout and accept or decline — so both parties end up with an account, but only the seller starts the deal.",
  },
  {
    q: "How long does a full deal take?",
    a: "It depends on shipping, but the windows are fixed: a 72-hour window for the seller to ship after payment, hub inspection on arrival, signature delivery to the buyer, then a 48-hour buyer review window before the seller's payout is released. Every step is timestamped on the transparency timeline.",
  },
  {
    q: "Can I use FlipLocker for a raw (ungraded) card?",
    a: "FlipLocker is built around graded, slabbed cards whose certificate number can be matched to the grading company's registry as part of documentation. Documentation confirms the card and slab against that record; it does not grade the card.",
  },
  {
    q: "What if the buyer never claims the invite?",
    a: "Nothing moves and no money changes hands until the buyer claims the invitation and pays. If they never do, the deal simply doesn't proceed and you can create a new one at any time.",
  },
];

export const PRICING_FAQS: QA[] = [
  {
    q: "How is the per-deal service fee calculated?",
    a: "The service fee is a function of the sale price only. Below a crossover price it's a flat floor; at or above it, a percentage of the sale price. A card's comp or market value is never collected, stored, or used. The exact fee is shown at checkout before anyone pays.",
  },
  {
    q: "What's the difference between the subscription and the per-deal fee?",
    a: "The subscription package (Single, Plus, or Pro) covers volume, tools, and support. The per-deal service fee is charged when a deal actually happens and is based on the sale price. Single has no subscription — you pay only the per-deal fee.",
  },
  {
    q: "How much does annual billing save?",
    a: "Annual billing saves 17% versus paying monthly on the Plus and Pro packages. The discounted effective monthly price and the annual total are both shown when you switch the billing toggle to Annual.",
  },
  {
    q: "Who pays the fee — the buyer or the seller?",
    a: "That's configurable per deal: buyer, seller, or split 50/50. Whatever is chosen is itemized on the checkout both parties see before payment.",
  },
  {
    q: "Can I change or cancel my plan?",
    a: "Yes. You can move between Single, Plus, and Pro, and switch between monthly and annual billing. Changes apply to future deals; anything already in flight keeps the terms it was created under.",
  },
];

export const SECURITY_FAQS: QA[] = [
  {
    q: "Does FlipLocker grade cards or confirm they're genuine?",
    a: "No. FlipLocker documents cards — it films, photographs, and tamper-seals them and confirms the certificate number is active in the grading company's registry. It does not grade cards, does not judge whether a card is genuine, and does not perform forensic examination. The grade on the slab is the grading company's opinion, not FlipLocker's.",
  },
  {
    q: "Can documentation be fooled?",
    a: "Documentation is an administrative data-match, not a guarantee of genuineness. A genuine certificate number reprinted onto a counterfeit slab can pass a registry lookup, and a slab that was opened and resealed may not be detectable by inspection alone. We state these limits plainly rather than overclaiming.",
  },
  {
    q: "What happens to the inspection video and photos?",
    a: "They're attached to the deal for both parties, and by default the inspection video and photos are automatically purged 30 days after confirmed delivery. The deal's record itself is retained.",
  },
  {
    q: "Is my payment ever held by FlipLocker?",
    a: "No. Buyer payments are held by our payment processor until delivery is signed for. FlipLocker never takes possession or control of the purchase funds and is not a money transmitter — its account receives only its service fee.",
  },
];

export const PLATFORM_FAQS: QA[] = [
  {
    q: "What does the FlipLocker platform actually do?",
    a: "It handles the three risky parts of a private card deal: it holds the buyer's payment with our payment processor, documents the card at a neutral hub (video, photos, tamper seal, registry match), and delivers it with insured, signature-required shipping — all on a shared, timestamped timeline.",
  },
  {
    q: "Does the platform decide whether a card is genuine?",
    a: "No. FlipLocker documents cards; it does not grade them or judge whether they're genuine. Documentation is a neutral record of a card's identity, condition, and chain of custody — not a guarantee of genuineness.",
  },
  {
    q: "Is any of this a marketplace feature?",
    a: "No. FlipLocker is invitation-only with nothing to browse or buy. The platform only exists to safely close deals two people have already agreed to elsewhere.",
  },
  {
    q: "Where does my payment sit during all of this?",
    a: "With our payment processor. FlipLocker never takes possession or control of the purchase funds; they're released to the seller only after documented, signature-confirmed delivery and a 48-hour review window.",
  },
];

export const SOLUTIONS_FAQS: QA[] = [
  {
    q: "How do I know which package or path is right for me?",
    a: "It depends on volume and stakes: social sellers and first-timers usually start with Single, active sellers and mid-volume collectors fit Plus, and breakers and high-value dealers fit Pro. Every path uses the same core protection — held payment, hub documentation, signature delivery.",
  },
  {
    q: "Do buyers and sellers use FlipLocker differently?",
    a: "The seller creates the deal and ships to the hub; the buyer reviews the checkout, pays, and receives the documented card with a signature. Both watch the same transparency timeline, and both are protected by the held payment.",
  },
  {
    q: "Can FlipLocker handle a very expensive card?",
    a: "Yes. High-value deals get insured legs, a logged tamper seal, and — on Pro — white-glove documentation and extended coverage options. The per-deal fee is still based on the sale price only.",
  },
  {
    q: "What if it's my first time dealing with a stranger?",
    a: "The process has guardrails built in: nothing releases to the seller until documented, signed-for delivery, and a mismatch at the hub triggers an automatic buyer refund. See the first-time deals guide.",
  },
];

export const ABOUT_FAQS: QA[] = [
  {
    q: "Why was FlipLocker built?",
    a: "Because most graded-card deals now start on social media and finish in a risky DM payment. FlipLocker exists to give those private, already-agreed deals a safe way to close: a held payment, neutral documentation at a hub, and insured signature delivery.",
  },
  {
    q: "What sports and cards does FlipLocker support?",
    a: "Baseball only, for now, focused on graded slabbed cards. The model is designed to expand, but we'd rather do one category exceptionally well first.",
  },
  {
    q: "Is FlipLocker a marketplace or an auction house?",
    a: "Neither. There's nothing to browse, bid on, or buy here. FlipLocker is a documentation and logistics service for deals two people have already agreed to elsewhere.",
  },
];

export const CONTACT_FAQS: QA[] = [
  {
    q: "How do I get support on an active deal?",
    a: "Every deal has a transparency timeline with its current status. For anything the timeline doesn't answer, email support@fliplocker.app with your deal's short code and we'll help.",
  },
  {
    q: "How fast do you respond?",
    a: "We aim to respond to support messages within one business day. Pro accounts have a dedicated contact for faster handling.",
  },
  {
    q: "I was invited to a deal — where do I start?",
    a: "Open the invitation link in your email and claim it. You'll see the card, the itemized checkout, and the option to accept or decline before any payment is made.",
  },
];

// ---------------------------------------------------------------------------
// Comprehensive FAQ hub — grouped by category (also emits FAQPage JSON-LD).
// ---------------------------------------------------------------------------

export interface FaqCategory {
  id: string;
  heading: string;
  items: QA[];
}

export const FAQ_HUB: FaqCategory[] = [
  {
    id: "getting-started",
    heading: "Getting started",
    items: [
      {
        q: "What is FlipLocker?",
        a: "FlipLocker is an invitation-only documentation and logistics platform for peer-to-peer graded trading-card deals. Two people agree on a card and price off-platform, then use FlipLocker to close it safely: the payment is held by our payment processor, the card is documented at our hub, and it's delivered with an insured signature.",
      },
      {
        q: "Is FlipLocker a marketplace?",
        a: "No. There are no listings to browse or buy. FlipLocker only handles deals that two people have already agreed to elsewhere — on Instagram, X, Discord, at a show, or in person.",
      },
      {
        q: "How do I start a deal?",
        a: "The seller creates the deal — entering the card, photos, grade, certificate number, and agreed price — and invites the buyer by email. The buyer claims the private invitation, reviews the itemized checkout, and accepts or declines.",
      },
      {
        q: "What cards can I use FlipLocker for?",
        a: "Graded, slabbed baseball cards, for now. Documentation matches the slab's certificate number against the grading company's registry, so the model is built around graded cards.",
      },
    ],
  },
  {
    id: "payments-fees",
    heading: "Payments & fees",
    items: [
      {
        q: "Where does my payment sit before the seller is paid?",
        a: "With our payment processor. The buyer pays through PayPal checkout and the funds are held there — never by FlipLocker — until the card is documented and delivered with a confirmed signature, followed by a 48-hour review window.",
      },
      {
        q: "How is the service fee calculated?",
        a: "It's a function of the sale price only. Below a crossover price the fee is a flat floor; at or above it, a percentage of the sale price. A card's market value is never used. Every line is shown at checkout.",
      },
      {
        q: "What do the Single, Plus, and Pro packages change?",
        a: "They cover volume, tools, and support. Single is pay-per-deal with no subscription; Plus adds unlimited concurrent deals and workflow tools; Pro adds the lowest per-deal fee schedule, white-glove handling, and team features. See the Pricing page for the full comparison.",
      },
      {
        q: "Who pays the fee?",
        a: "Configurable per deal: buyer, seller, or split 50/50. It's itemized on the checkout both parties see before payment.",
      },
      {
        q: "Does FlipLocker hold my money itself?",
        a: "No. The buyer's payment is held by our payment processor, never by FlipLocker. FlipLocker never takes possession or control of the purchase funds and is not a money transmitter; its account receives only its service fee.",
      },
    ],
  },
  {
    id: "shipping-hub",
    heading: "Shipping & the hub",
    items: [
      {
        q: "How does shipping work?",
        a: "Two insured USPS legs. Leg 1: the seller ships to the FlipLocker hub on a prepaid label after a Terms acknowledgment. Leg 2: after documentation, the hub ships to the buyer with Signature Confirmation. Both legs are tracked end-to-end on the timeline.",
      },
      {
        q: "Is the signature ever waived?",
        a: "No. The buyer-leg signature is never waived. A required signature turns 'I never received it' into a carrier-confirmed fact.",
      },
      {
        q: "How long do I have to ship as a seller?",
        a: "A 72-hour ship window opens once your prepaid Leg 1 label is issued. The window keeps the deal moving; the timeline shows the deadline.",
      },
      {
        q: "Where is the hub?",
        a: "The hub's ship-to address is provided to the seller when the Leg 1 label is generated. Cards are checked in, documented, and repacked there before heading to the buyer.",
      },
    ],
  },
  {
    id: "documentation",
    heading: "Documentation & the card",
    items: [
      {
        q: "What exactly does the hub document?",
        a: "It confirms a physical card matching the seller's listing, in a slab whose certificate number is active in the grading company's registry, and captures a 15-second video and two photos with a numbered, logged tamper seal bound to the deal.",
      },
      {
        q: "Does FlipLocker guarantee the card is genuine?",
        a: "No. Documentation is an administrative data-match, not a guarantee of genuineness. A genuine certificate number can be reprinted onto a counterfeit slab, and a resealed slab may not be detectable by inspection alone. Cards are described as documented — never as graded or guaranteed genuine.",
      },
      {
        q: "What's the difference between documentation and grading?",
        a: "Grading is the grading company's opinion of a card's condition, printed on the slab. Documentation is FlipLocker's neutral record of the card's identity, condition, and chain of custody in transit. FlipLocker does not grade cards.",
      },
      {
        q: "How long are the video and photos kept?",
        a: "By default the inspection video and photos are automatically purged 30 days after confirmed delivery. The deal's transaction record is retained.",
      },
    ],
  },
  {
    id: "safety-disputes",
    heading: "Safety & disputes",
    items: [
      {
        q: "What if the card fails inspection at the hub?",
        a: "The deal is flagged, the buyer is automatically refunded, the documentation is shared with both parties, and a return label is issued to the seller. The buyer is never left holding a mismatch.",
      },
      {
        q: "What if the buyer claims the card is wrong after delivery?",
        a: "A 48-hour buyer review window opens on delivery. Because the card's condition and identity were documented at the hub and the tamper seal is logged, disputes are resolved against a neutral, timestamped record rather than a stalemate.",
      },
      {
        q: "How does FlipLocker prevent common scams?",
        a: "By removing the two levers most scams rely on: an irreversible payment (funds are held, not handed over) and an undocumented card (a neutral hub films and seals it). See our guide on spotting scams in peer-to-peer card deals.",
      },
    ],
  },
  {
    id: "account",
    heading: "Account",
    items: [
      {
        q: "How do I confirm my email?",
        a: "After you register, we email you a confirmation link. Click it to activate your account. You can request a new link if it expires.",
      },
      {
        q: "I forgot my password — what now?",
        a: "Use the 'forgot password' link on the sign-in page. We'll email you a secure link to choose a new password; it expires after two hours.",
      },
      {
        q: "How do I change my package?",
        a: "You can move between Single, Plus, and Pro and switch billing cadence at any time. Changes apply to future deals; deals already in flight keep their original terms.",
      },
      {
        q: "How do I contact support?",
        a: "Email support@fliplocker.app — include your deal's short code if your question is about a specific deal. See the Contact page for details.",
      },
    ],
  },
];

/** Flatten the hub into a single list for FAQPage JSON-LD. */
export function faqHubFlat(): QA[] {
  return FAQ_HUB.flatMap((c) => c.items);
}
