import type { Block, ArticleSection } from "@/lib/insights";
import type { QA } from "@/lib/faqs";

// Content for the /platform overview + /platform/[slug] pillar pages. Icons and
// nav labels come from PLATFORM_LINKS in nav.ts (keyed by the same slug).

export interface Pillar {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Quotable AEO answer shown up top. */
  answer: string;
  intro: string;
  sections: ArticleSection[];
  faqs: QA[];
  related: string[]; // other pillar slugs
  cta: { title: string; body: string };
}

const p = (...b: Block[]) => b;

export const PILLARS: Pillar[] = [
  {
    slug: "payments-held-by-processor",
    eyebrow: "Payments",
    title: "Payments held by our payment processor",
    description:
      "How FlipLocker keeps a buyer's money safe: funds are held by our payment processor, never by FlipLocker, and released to the seller only after documented, signature-confirmed delivery.",
    answer:
      "On FlipLocker, the buyer pays through PayPal checkout and the funds are held by our payment processor — not by FlipLocker and not by the seller — until the card is documented at the hub and delivered with a confirmed signature. FlipLocker never takes possession or control of the purchase funds and is not a money transmitter; its account receives only its service fee.",
    intro:
      "The single most dangerous moment in a peer-to-peer card deal is the payment. Send money directly to a stranger and you're relying on goodwill. FlipLocker removes that risk by changing where the money sits and when it moves.",
    sections: [
      {
        id: "how-it-works",
        heading: "Where the money actually sits",
        body: p(
          "When a buyer accepts a deal, they pay through PayPal checkout. Instead of that payment landing with the seller, it is **held by our payment processor**. FlipLocker does not receive, hold, or control the purchase funds at any point — its own account only ever receives its service fee.",
          "The held payment is released to the seller after three things have happened: the card passed inspection and was documented at the hub, it was delivered to the buyer with a confirmed signature, and the 48-hour buyer review window closed. Until then, the money stays put.",
          { note: "Because the funds are held by the processor rather than by FlipLocker, FlipLocker is not a money transmitter and does not act as a custodian of the purchase funds. This is a deliberate, compliance-driven design." }
        ),
      },
      {
        id: "what-this-prevents",
        heading: "What a held payment prevents",
        body: p(
          "Holding the payment defeats the most common ways money goes wrong in a private deal:",
          {
            list: [
              "The seller can't disappear with your money — nothing is released until you've received the card.",
              "There's no irreversible transfer to claw back, so reversal and overpayment scams don't work.",
              "The seller ships knowing the payment is real and waiting, so 'phantom buyer' risk is gone too.",
            ],
          },
          "It protects both sides at once, which is what makes a deal between strangers workable."
        ),
      },
      {
        id: "refunds",
        heading: "If something goes wrong",
        body: p(
          "If the card fails inspection at the hub — it doesn't match the seller's listing — the deal is flagged and the buyer is **automatically refunded** from the held funds. The documentation is shared with both parties and a return label is issued to the seller. The buyer is never left chasing a refund.",
          "Every movement of money is itemized and timestamped on the [transparency timeline](/platform/transparency-timeline), so both parties can see exactly what happened and when."
        ),
      },
    ],
    faqs: [
      {
        q: "Does FlipLocker ever hold my money?",
        a: "No. The buyer's payment is held by our payment processor, not by FlipLocker. FlipLocker's account only receives its service fee, which is based on the sale price.",
      },
      {
        q: "When is the seller paid?",
        a: "After the card is documented at the hub, delivered with a confirmed signature, and the 48-hour buyer review window closes. Only then are the held funds released.",
      },
      {
        q: "Does FlipLocker hold the funds itself?",
        a: "No. Because FlipLocker never takes possession or control of the purchase funds, it is not a money transmitter and does not act as their custodian. The funds are held by the payment processor.",
      },
    ],
    related: ["hub-documentation", "signature-delivery", "transparency-timeline"],
    cta: {
      title: "A payment that's held, not handed over",
      body: "Close your next social-media deal knowing the money is safe until the card is in the buyer's hands.",
    },
  },

  {
    slug: "hub-documentation",
    eyebrow: "Documentation",
    title: "Hub documentation",
    description:
      "Every card is filmed, photographed, and tamper-sealed at the FlipLocker documentation hub, and matched against the grading company's registry — a neutral, timestamped record of exactly what moved.",
    answer:
      "At the FlipLocker hub, documenting a card means confirming a physical card that matches the seller's listing, in a slab whose certificate number is active in the grading company's registry, then capturing it on a 15-second video and two photos with a numbered tamper seal logged to the deal. It is documentation, not grading and not a guarantee of genuineness: FlipLocker does not judge whether a card is genuine and does not guarantee it.",
    intro:
      "The second dangerous moment in a private deal is the handoff — the card leaves the seller's hands with no neutral record of what it was or what condition it was in. FlipLocker's hub creates that record before the card ever reaches the buyer.",
    sections: [
      {
        id: "what-we-capture",
        heading: "What the hub captures",
        body: p(
          "When a card arrives at the hub, it's checked in and documented in a fixed way so every deal has the same record:",
          {
            list: [
              "A registry match: the certificate number on the slab is confirmed active in the grading company's public registry.",
              "A physical-to-listing comparison against the seller's stated player, year, set, and grade.",
              "A 15-second inspection video, capturing the card and slab in motion.",
              "Two high-resolution reference photos, front and back.",
              "A numbered tamper seal, applied and logged, bound to the deal record.",
            ],
          }
        ),
      },
      {
        id: "documentation-not-a-guarantee",
        heading: "Documentation, not a genuineness guarantee",
        body: p(
          "This is the distinction we never blur. Documentation is a neutral record of a card's identity, condition, and chain of custody. It is **not** grading and **not** a guarantee that the card is genuine.",
          "FlipLocker does not perform forensic (chemical, paper, ink, or microscopic) examination, does not judge whether a card is genuine, and does not assign or re-judge a grade. A genuine certificate number reprinted onto a counterfeit slab can pass a registry lookup, and a resealed slab may not be detectable by inspection alone. That's why we always describe a card as documented — never as graded or guaranteed genuine.",
          "Read the full, honest version on [Security & limits](/security), or the plain-English explainer [What card documentation actually means](/insights/what-card-documentation-actually-means)."
        ),
      },
      {
        id: "why-it-matters",
        heading: "Why a neutral record changes the deal",
        body: p(
          "With documentation in hand, a later disagreement isn't your word against theirs. The card's condition on arrival is on video; the tamper seal is logged; the chain of custody to the buyer ends in a signature. Condition disputes and bait-and-switch claims run into a timestamped record instead of a stalemate.",
          "The record is attached to the deal for both parties, and the inspection media is [automatically purged](/platform/media-auto-purge) 30 days after delivery by default."
        ),
      },
    ],
    faqs: [
      {
        q: "Does the hub grade my card or confirm it's genuine?",
        a: "No. The hub documents the card — films, photographs, tamper-seals it, and confirms the certificate number is active in the registry. It does not grade cards, does not judge whether a card is genuine, and does not guarantee a slab is genuine.",
      },
      {
        q: "What is captured in the documentation?",
        a: "A registry match, a physical-to-listing comparison, a 15-second video, two reference photos, and a numbered, logged tamper seal — all bound to the deal record.",
      },
      {
        q: "Can documentation be fooled?",
        a: "It's an administrative data-match, not a guarantee of genuineness. A genuine certificate number on a counterfeit slab can pass a registry lookup, and a resealed slab may not be caught by inspection alone. We state these limits openly.",
      },
    ],
    related: ["tamper-seal", "payments-held-by-processor", "media-auto-purge"],
    cta: {
      title: "A neutral record of exactly what moved",
      body: "Every card documented on video and photo, matched to the registry, sealed and logged — before it reaches the buyer.",
    },
  },

  {
    slug: "signature-delivery",
    eyebrow: "Delivery",
    title: "Insured signature delivery",
    description:
      "Two insured USPS legs and a delivery signature that is never waived — so a card's journey from seller to buyer is tracked, covered, and confirmed at every step.",
    answer:
      "FlipLocker ships every deal in two insured USPS legs: the seller ships to the hub, and after documentation the hub ships to the buyer with Signature Confirmation that is never waived. Both legs are tracked end-to-end, and the buyer's payment stays held by the processor until that final delivery signature lands.",
    intro:
      "A valuable card shipped without tracking, insurance, or a signature is an invitation to trouble. FlipLocker makes all three standard and non-negotiable.",
    sections: [
      {
        id: "two-legs",
        heading: "Two accountable legs",
        body: p(
          "Instead of one blind shipment from seller to buyer, a FlipLocker deal has two documented legs:",
          {
            list: [
              "**Leg 1 — seller to hub.** A prepaid, insured label is issued after a Terms acknowledgment, with a 72-hour ship window.",
              "**Leg 2 — hub to buyer.** After documentation, the card is repacked and shipped with insured, signature-required delivery.",
            ],
          },
          "Both legs are tracked end-to-end and shown on the [transparency timeline](/platform/transparency-timeline)."
        ),
      },
      {
        id: "signature",
        heading: "A signature that's never waived",
        body: p(
          "The buyer-leg signature is required and **never waived**. That single detail converts the most common delivery dispute — 'I never received it' — into a carrier-confirmed fact.",
          { note: "Convenience is never worth waiving the signature on a valuable card. On FlipLocker, it isn't an option to skip." }
        ),
      },
      {
        id: "insurance",
        heading: "Coverage matched to the deal",
        body: p(
          "Both legs are insured, and declared-value coverage is a transparent, itemized line at checkout — a pass-through of the carrier's coverage, sized to the sale price. Because the hub documents the card's condition on arrival, there's a neutral before-and-after record that makes any coverage claim straightforward rather than a fight.",
          "Learn how to pack a slab for these legs in our guide, [How to ship a graded card safely](/insights/how-to-ship-a-graded-card-safely)."
        ),
      },
    ],
    faqs: [
      {
        q: "Is the delivery signature ever optional?",
        a: "No. The buyer-leg signature is never waived. A required signature turns 'I never received it' into a carrier-confirmed fact.",
      },
      {
        q: "Are both shipping legs insured?",
        a: "Yes. Leg 1 (seller to hub) and Leg 2 (hub to buyer) are both insured and tracked end-to-end, with declared-value coverage itemized at checkout.",
      },
      {
        q: "Who pays for shipping?",
        a: "Outbound shipping, signature, and declared-value coverage are itemized at checkout before anyone pays. Leg 1 to the hub is issued as a prepaid label.",
      },
    ],
    related: ["hub-documentation", "transparency-timeline", "payments-held-by-processor"],
    cta: {
      title: "Tracked, insured, signed for",
      body: "Two documented legs and a signature that's never waived — from the seller's hands to the buyer's.",
    },
  },

  {
    slug: "transparency-timeline",
    eyebrow: "Transparency",
    title: "The transparency timeline",
    description:
      "A timestamped, append-only record of every step in a deal — created, paid, shipped, documented, delivered, released — that both the buyer and seller watch in real time.",
    answer:
      "Every FlipLocker deal has a transparency timeline: an append-only, timestamped log of each event from creation to payout. Both parties see the same live record — payment held, label issued, card received, documented, delivered with signature, review window, funds released — so no one has to take anyone's word for what happened.",
    intro:
      "Trust between strangers doesn't come from promises; it comes from a shared, tamper-evident record. The timeline is that record.",
    sections: [
      {
        id: "append-only",
        heading: "Append-only by design",
        body: p(
          "The timeline is **append-only**: events are added as they happen and never quietly edited or removed. Each entry is timestamped and attributed to an actor — system, seller, buyer, hub, or admin — so the history of a deal is a fact, not a story either side can rewrite.",
          "Both parties see the same timeline. There is no separate 'seller version' and 'buyer version.'"
        ),
      },
      {
        id: "what-you-see",
        heading: "What both parties see",
        body: p(
          "A typical deal timeline moves through steps like these, each with a timestamp:",
          {
            steps: [
              "Deal created and buyer invited.",
              "Invite claimed; itemized checkout reviewed.",
              "Payment captured and held by the payment processor.",
              "Leg 1 label issued; seller ships within the 72-hour window.",
              "Card received and documented at the hub (video, photos, tamper seal).",
              "Leg 2 shipped and delivered with a confirmed signature.",
              "48-hour review window; funds released and deal complete.",
            ],
          }
        ),
      },
      {
        id: "why-it-matters",
        heading: "Why it matters",
        body: p(
          "When money and a valuable object are moving between people who've never met, a shared source of truth is everything. The timeline means disputes are resolved by looking at what actually happened — backed by the [hub documentation](/platform/hub-documentation) and delivery signature — rather than by argument.",
          "It's also your receipt: a complete, exportable record of the transaction for your files."
        ),
      },
    ],
    faqs: [
      {
        q: "Can the timeline be edited after the fact?",
        a: "No. The timeline is append-only — events are added as they occur and are timestamped and attributed. History isn't quietly rewritten.",
      },
      {
        q: "Do the buyer and seller see the same thing?",
        a: "Yes. Both parties watch the same live timeline, so there's a single shared source of truth for the deal.",
      },
      {
        q: "Can I keep a copy of the record?",
        a: "Yes. The deal's record is retained and can serve as your receipt for the transaction, even after the inspection media is purged.",
      },
    ],
    related: ["hub-documentation", "signature-delivery", "payments-held-by-processor"],
    cta: {
      title: "One shared source of truth",
      body: "A live, timestamped record both parties watch from 'created' to 'complete.'",
    },
  },

  {
    slug: "tamper-seal",
    eyebrow: "Chain of custody",
    title: "The tamper-seal chain",
    description:
      "A numbered tamper seal is applied and logged at the hub and bound to the deal before the card ships to the buyer — a physical link in the chain of custody.",
    answer:
      "Before a documented card leaves the FlipLocker hub, a numbered tamper seal is applied to its packaging and logged to the deal. The buyer can match the seal against the record on delivery, giving a physical, tamper-evident link between the card the hub documented and the package that arrives.",
    intro:
      "Documentation proves what the card was at the hub. The tamper seal helps prove that nothing changed between the hub and the buyer's hands.",
    sections: [
      {
        id: "how-it-works",
        heading: "How the seal works",
        body: p(
          "After a card passes inspection and is documented, it's repacked and secured with a **numbered tamper seal**. That serial number is logged and bound to the deal record before Leg 2 ships.",
          "On delivery, the buyer can match the seal's number against the record on the [transparency timeline](/platform/transparency-timeline). A seal that doesn't match, or shows tampering, is an immediate, visible signal to raise within the review window."
        ),
      },
      {
        id: "what-it-adds",
        heading: "What the seal adds",
        body: p(
          "The tamper seal closes the last gap in the chain of custody:",
          {
            list: [
              "It ties the specific documented card to the specific package that arrives.",
              "It makes interference between the hub and the buyer visible rather than silent.",
              "It gives the buyer a concrete thing to check on delivery, not just a tracking number.",
            ],
          }
        ),
      },
      {
        id: "limits",
        heading: "Honest limits",
        body: p(
          "A tamper seal is a strong deterrent and a clear signal, not a magic guarantee. Like the rest of FlipLocker's process, it's **documentation** — a neutral, logged record — not a judgment that the card itself is genuine. Read the full limits on [Security & limits](/security)."
        ),
      },
    ],
    faqs: [
      {
        q: "What is the tamper seal for?",
        a: "It's a numbered, logged seal applied at the hub and bound to the deal, so the buyer can confirm on delivery that the documented card is the one that arrived and that the package wasn't interfered with in transit.",
      },
      {
        q: "What should I do if the seal looks tampered with?",
        a: "Raise it immediately within your 48-hour review window. Because the seal number and the card's condition were logged at the hub, there's a neutral record to compare against.",
      },
      {
        q: "Does the seal guarantee the card is genuine?",
        a: "No. The seal is part of documentation and chain of custody — it does not judge whether a card or slab is genuine and does not guarantee it.",
      },
    ],
    related: ["hub-documentation", "signature-delivery", "transparency-timeline"],
    cta: {
      title: "A tamper-evident final link",
      body: "A numbered seal, logged to your deal, so the buyer knows nothing changed on the way.",
    },
  },

  {
    slug: "media-auto-purge",
    eyebrow: "Privacy",
    title: "Media auto-purge",
    description:
      "Inspection video and photos are automatically deleted 30 days after confirmed delivery by default — the transaction record is kept, the sensitive media isn't kept forever.",
    answer:
      "By default, the inspection video and photos captured at the hub are automatically purged 30 days after a deal's confirmed delivery. The deal's transaction record is retained as your receipt, but the sensitive media isn't stored indefinitely — a privacy-by-default choice.",
    intro:
      "Documentation should protect a deal, not become a permanent archive of your business. FlipLocker keeps the record and lets the media expire.",
    sections: [
      {
        id: "what-happens",
        heading: "What gets purged, and when",
        body: p(
          "The hub captures a 15-second inspection video and two reference photos for each deal. By default, that media is **automatically purged 30 days after confirmed delivery**. The purge window is a platform setting, and each media item carries its own scheduled purge time once delivery is confirmed.",
          {
            list: [
              "Kept: the deal's timestamped transaction record and timeline — your receipt.",
              "Purged by default: the inspection video and reference photos, 30 days after delivery.",
            ],
          }
        ),
      },
      {
        id: "why",
        heading: "Why privacy-by-default",
        body: p(
          "Holding sensitive media forever creates risk for everyone and value for no one once a deal is safely closed. Purging by default means the documentation does its job during the window when disputes can happen, then gets out of the way.",
          "It also keeps FlipLocker's footprint minimal: we retain what's needed for the transaction record and let the rest expire."
        ),
      },
      {
        id: "how-it-fits",
        heading: "How it fits the rest of the process",
        body: p(
          "Auto-purge is the privacy bookend to [hub documentation](/platform/hub-documentation). The two together mean you get a strong, neutral record exactly when it matters — through delivery and the review window — without that media living on indefinitely.",
          "Details on data handling are in the [Privacy](/privacy) policy."
        ),
      },
    ],
    faqs: [
      {
        q: "How long is the inspection media kept?",
        a: "By default, the inspection video and photos are automatically purged 30 days after confirmed delivery. The deal's transaction record is retained.",
      },
      {
        q: "Is the whole deal deleted after 30 days?",
        a: "No. Only the sensitive inspection media is purged by default. The timestamped transaction record and timeline are kept as your receipt.",
      },
      {
        q: "Can the purge window change?",
        a: "The purge window is a platform setting. The default is 30 days after confirmed delivery.",
      },
    ],
    related: ["hub-documentation", "transparency-timeline", "payments-held-by-processor"],
    cta: {
      title: "Documentation that doesn't overstay",
      body: "The record you need, kept — the sensitive media, purged by default.",
    },
  },
];

export function getPillar(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
