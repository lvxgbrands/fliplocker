import type { Block, ArticleSection } from "@/lib/insights";
import type { QA } from "@/lib/faqs";

// Content for /solutions overview + /solutions/[slug] audience pages. Icons and
// nav labels come from SOLUTIONS_LINKS in nav.ts (keyed by the same slug).

export interface Solution {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  answer: string;
  intro: string;
  /** Short "who this is for" line for the hub cards. */
  audience: string;
  sections: ArticleSection[];
  faqs: QA[];
  related: string[]; // other solution slugs
  cta: { title: string; body: string };
}

const p = (...b: Block[]) => b;

export const SOLUTIONS: Solution[] = [
  {
    slug: "social-sellers",
    eyebrow: "For sellers",
    title: "FlipLocker for social sellers",
    description:
      "Close the graded-card deal you negotiated on Instagram, X, or Discord without the DM-payment gamble — held payment, hub documentation, and signature delivery.",
    audience: "Instagram / X / Discord sellers",
    answer:
      "FlipLocker lets social sellers close the deal they negotiated in DMs safely: agree the price on social, then move the money and the card through FlipLocker. The buyer's payment is held by our payment processor, the card is documented at our hub, and it's delivered with a signature — so you get paid without shipping into the unknown or accepting a risky Friends & Family payment.",
    intro:
      "You found the buyer on social. That's what social is great at. It's a terrible place to settle a four-figure payment or ship a slab on a promise. FlipLocker is where the deal you made in the DMs gets closed safely.",
    sections: [
      {
        id: "the-problem",
        heading: "The DM-payment gamble",
        body: p(
          "Every social seller knows the moment: you've agreed a price, and now someone you've never met wants to send money and receive a card. Do you ship first? Do you trust a Friends & Family payment? Do you take a check?",
          "Each of those puts all the risk on one person. FlipLocker splits the deal into safe, accountable steps instead."
        ),
      },
      {
        id: "how-it-helps",
        heading: "How FlipLocker closes the deal",
        body: p(
          {
            steps: [
              "Agree the card and price in your DMs, wherever you met.",
              "Create the deal on FlipLocker and invite the buyer by email.",
              "The buyer pays through checkout; the funds are held by our payment processor.",
              "You ship to the hub on a prepaid, insured label within 72 hours.",
              "The hub documents the card; it's delivered to the buyer with a signature.",
              "After a 48-hour review window, your payout is released.",
            ],
          },
          "You never ship into the unknown, and the buyer never pays into it either."
        ),
      },
      {
        id: "why-sellers-like-it",
        heading: "Why it works for sellers",
        body: p(
          {
            list: [
              "**You get paid.** The payment is real and held before you ship — no phantom buyers.",
              "**No Friends & Family risk.** You never have to ask a buyer to waive their protection, which builds trust and closes more deals.",
              "**A record that backs you up.** Hub documentation and a logged tamper seal protect you against 'that's not what you sent' claims.",
              "**Fees you control.** Who pays the per-deal fee — buyer, seller, or split — is configurable, and it's based on the sale price only.",
            ],
          },
          "New to this? Read [How to sell graded cards safely on Instagram](/insights/how-to-sell-graded-cards-safely-on-instagram)."
        ),
      },
    ],
    faqs: [
      {
        q: "Do I need the buyer to have an account?",
        a: "You create the deal and invite the buyer by email. They claim the private invitation to review the checkout and pay — so they'll create an account as part of accepting, but you start the deal.",
      },
      {
        q: "Can I set the buyer to pay the fee?",
        a: "Yes. Who pays the per-deal service fee — buyer, seller, or split 50/50 — is configurable, and it's shown on the checkout before anyone pays.",
      },
      {
        q: "What if the buyer backs out?",
        a: "Nothing moves until the buyer accepts and pays. If they don't, the deal simply doesn't proceed and you can start a new one.",
      },
    ],
    related: ["first-time-deals", "high-value-cards", "breakers"],
    cta: {
      title: "Close the deal you made on social",
      body: "Bring the buyer you already found — FlipLocker handles the payment, documentation, and delivery.",
    },
  },

  {
    slug: "collectors",
    eyebrow: "For buyers",
    title: "FlipLocker for serious collectors & buyers",
    description:
      "Buy the graded card you negotiated with a documented, signature-delivered handoff and a payment that's held until the card is in your hands.",
    audience: "Collectors buying from private sellers",
    answer:
      "For collectors buying from a private seller, FlipLocker holds your payment with our payment processor until the card is documented at the hub and delivered to you with a signature. If it fails inspection, you're refunded automatically — so you can buy the card you negotiated without wiring money to a stranger and hoping.",
    intro:
      "When you're the buyer, the fear is simple: you send the money and the card is wrong, damaged, or never comes. FlipLocker is built to make that fear irrelevant.",
    sections: [
      {
        id: "your-protection",
        heading: "What protects you as a buyer",
        body: p(
          {
            list: [
              "**Your money is held, not handed over.** The payment sits with our payment processor until you've received the card.",
              "**The card is documented before it reaches you.** A neutral hub films, photographs, and tamper-seals it and matches the certificate number to the registry.",
              "**Signature delivery, never waived.** You confirm receipt on the record.",
              "**A review window.** A 48-hour window opens on delivery before the seller is paid.",
              "**Automatic refund on a mismatch.** If the card fails inspection, you're refunded from the held funds.",
            ],
          }
        ),
      },
      {
        id: "what-documentation-means",
        heading: "Know what documentation does — and doesn't",
        body: p(
          "FlipLocker documents cards; it does not grade them or judge whether they're genuine. That means you get a neutral record of the card's identity, condition, and chain of custody — not a guarantee that a slab is genuine. It's an honest, useful protection, and knowing its edges makes you a smarter buyer.",
          "Read [What card documentation actually means](/insights/what-card-documentation-actually-means) and the full [Security & limits](/security)."
        ),
      },
      {
        id: "buying-checklist",
        heading: "A smarter way to buy from strangers",
        body: p(
          "Pair FlipLocker's structure with your own due diligence: match the certificate number to the registry, get clear photos, and use your review window deliberately on delivery. For higher-value purchases, follow our [four-figure buying checklist](/insights/buying-a-four-figure-card-from-a-stranger).",
          "The result is a purchase you can make with confidence instead of hope."
        ),
      },
    ],
    faqs: [
      {
        q: "When does the seller actually get my money?",
        a: "Only after the card is documented at the hub, delivered to you with a signature, and the 48-hour review window closes. Until then, the funds are held by our payment processor.",
      },
      {
        q: "What if the card isn't as described?",
        a: "If it fails inspection at the hub, the deal is flagged and you're automatically refunded, with the documentation shared. If an issue appears on delivery, raise it within your review window against the hub's record.",
      },
      {
        q: "Does FlipLocker guarantee the card is authentic?",
        a: "No. FlipLocker documents cards but does not grade them or judge whether they're genuine, and does not guarantee a slab is genuine. Documentation is a neutral record, not a guarantee of genuineness.",
      },
    ],
    related: ["high-value-cards", "first-time-deals", "social-sellers"],
    cta: {
      title: "Buy the card, not the risk",
      body: "Your payment is held until the card is documented and in your hands.",
    },
  },

  {
    slug: "high-value-cards",
    eyebrow: "By stakes",
    title: "FlipLocker for high-value cards",
    description:
      "Four- and five-figure deals with a held payment, insured legs, white-glove documentation, and a logged tamper seal — structure that scales with the stakes.",
    audience: "Four- and five-figure deals",
    answer:
      "For high-value cards, FlipLocker replaces trust with structure at every step: the buyer's payment is held by our payment processor, the card gets white-glove documentation at the hub, both shipping legs are insured with a signature that's never waived, and a numbered tamper seal is logged to the deal. The higher the value, the more that structure matters.",
    intro:
      "At four and five figures, 'I trust them' is not a plan. High-value deals need the money held, the card documented, and every leg insured — no exceptions.",
    sections: [
      {
        id: "structure-over-trust",
        heading: "Structure over trust",
        body: p(
          "The core idea of FlipLocker matters most at the top of the market. When a card is worth as much as a car, you don't want to rely on goodwill — you want a process that would protect you even if the other person had bad intentions.",
          {
            list: [
              "The payment is held by the processor until documented, signed-for delivery.",
              "Both legs are insured; declared-value coverage is itemized and sized to the sale price.",
              "The buyer-leg signature is never waived.",
              "A numbered tamper seal is logged, tying the documented card to the delivered package.",
            ],
          }
        ),
      },
      {
        id: "white-glove",
        heading: "White-glove handling on Pro",
        body: p(
          "The [Pro package](/pricing) adds white-glove documentation for high-value slabs, extended declared-value coverage options, and priority hub handling with a dedicated contact — for dealers and collectors who move serious cards regularly.",
          "The per-deal service fee is still a function of the sale price only, never the card's comp or market value."
        ),
      },
      {
        id: "the-record",
        heading: "A record that holds up",
        body: p(
          "On a high-value card, the documentation is as valuable as the shipping. Video, photos, a logged tamper seal, and a signature create a neutral, timestamped record on the [transparency timeline](/platform/transparency-timeline) that makes disputes and coverage claims straightforward.",
          "Just remember the honest boundary: this is documentation, not a guarantee of genuineness — see [Security & limits](/security)."
        ),
      },
    ],
    faqs: [
      {
        q: "Does a more expensive card cost more in fees?",
        a: "The per-deal service fee is based on the sale price only — never the card's comp or market value. Pro accounts use the lowest fee schedule. Exact figures are shown at checkout.",
      },
      {
        q: "How is a high-value card insured in transit?",
        a: "Both legs are insured, with declared-value coverage itemized at checkout and sized to the sale price. The hub also documents the card's condition on arrival, creating a before-and-after record for any claim.",
      },
      {
        q: "What is white-glove documentation?",
        a: "On the Pro package, high-value slabs get priority hub handling, extended coverage options, and a dedicated contact, on top of the standard video, photos, and tamper seal.",
      },
    ],
    related: ["collectors", "social-sellers", "breakers"],
    cta: {
      title: "Big cards deserve real structure",
      body: "Held payment, insured legs, white-glove documentation, and a logged tamper seal.",
    },
  },

  {
    slug: "first-time-deals",
    eyebrow: "For sellers",
    title: "FlipLocker for first-time deals",
    description:
      "Never dealt with a stranger before? Here's the safe, guided way to do your first peer-to-peer graded-card deal without getting burned.",
    audience: "First-time private dealers",
    answer:
      "If it's your first time dealing with a stranger, FlipLocker gives you guardrails: agree the price wherever you met, then let FlipLocker hold the payment, document the card at a neutral hub, and deliver it with a signature. You don't have to know how to structure a safe deal — the process does it for you.",
    intro:
      "Everyone's first deal with a stranger is nerve-wracking. It should be. FlipLocker turns that anxiety into a checklist you can follow step by step.",
    sections: [
      {
        id: "start-here",
        heading: "Start here",
        body: p(
          "You don't need to be an expert to do a safe deal. You need a process that removes the two ways first-timers get burned: an unprotected payment and an undocumented card.",
          {
            steps: [
              "Agree the card and price on social, at a show, or in a group chat.",
              "The seller creates the deal on FlipLocker and invites the buyer.",
              "The buyer reviews an itemized checkout and pays; the money is held.",
              "The card ships to the hub, gets documented, and is delivered with a signature.",
              "After the review window, the seller is paid.",
            ],
          }
        ),
      },
      {
        id: "rules-of-thumb",
        heading: "Rules of thumb for your first deal",
        body: p(
          {
            list: [
              "**Never pay or accept Friends & Family** for a purchase — it waives protection. See [Goods & Services vs Friends & Family](/insights/paypal-goods-and-services-vs-friends-and-family).",
              "**Don't ship first** to a stranger. Let a neutral hub sit in the middle.",
              "**Slow down on urgency.** 'Pay in the next ten minutes' is a pressure tactic.",
              "**Match the certificate number** to the grading registry before you commit.",
            ],
          },
          "If you only learn one lesson: let value move in both directions accountably, not on trust."
        ),
      },
      {
        id: "confidence",
        heading: "Confidence, built in",
        body: p(
          "Because the payment is held and the card is documented, your first deal has the same protections as a seasoned dealer's hundredth. You can learn the ropes without paying tuition to a scammer.",
          "When you're ready for bigger cards, the same process scales — see [high-value cards](/solutions/high-value-cards)."
        ),
      },
    ],
    faqs: [
      {
        q: "I've never done this — is it complicated?",
        a: "No. You agree the price, create the deal (or claim an invite), and follow the steps. FlipLocker handles the payment holding, documentation, and shipping legs for you.",
      },
      {
        q: "What's the single most important safety rule?",
        a: "Never let value move in only one direction on trust. Don't ship first and don't accept a no-recourse payment. FlipLocker enforces this by holding the payment and documenting the card.",
      },
      {
        q: "What if I make a mistake?",
        a: "The process has guardrails: nothing releases to the seller until documented, signed-for delivery, and a mismatch at the hub triggers an automatic buyer refund.",
      },
    ],
    related: ["social-sellers", "collectors", "high-value-cards"],
    cta: {
      title: "Do your first deal the safe way",
      body: "Guardrails built in — hold the payment, document the card, deliver with a signature.",
    },
  },

  {
    slug: "breakers",
    eyebrow: "By use case",
    title: "FlipLocker for breakers & group buys",
    description:
      "Settle post-break hits and group-buy payouts with a clean, documented paper trail — held payments, hub documentation, and signature delivery for every hand-off.",
    audience: "Breakers & group-buy organizers",
    answer:
      "Breakers and group-buy organizers use FlipLocker to settle individual hits cleanly: each buyer's payment is held by our payment processor, the specific card is documented at the hub, and it's delivered with a signature. Instead of a tangle of DMs and payment apps, every hand-off has its own held payment and neutral record.",
    intro:
      "Breaks and group buys generate a flurry of individual settlements — this hit to that buyer, that slab to this member. FlipLocker gives each one a clean, documented close.",
    sections: [
      {
        id: "the-mess",
        heading: "The settlement mess",
        body: p(
          "After a break, you're suddenly running a dozen micro-deals: collecting payments, shipping specific cards to specific people, and fielding 'did mine ship yet?' messages. It's exactly the situation where cards get mixed up and payments get disputed.",
          "FlipLocker turns each settlement into a structured deal with its own record."
        ),
      },
      {
        id: "how-it-helps",
        heading: "A clean close for every hit",
        body: p(
          {
            list: [
              "**Held payments per buyer.** Each member's payment is held until their card is documented and delivered.",
              "**The right card to the right person.** Hub documentation and a logged tamper seal tie a specific slab to a specific deal.",
              "**Signature delivery.** Every hand-off is confirmed, so 'I never got mine' is a solved problem.",
              "**A paper trail.** Each deal has its own transparency timeline — your records, not a screenshot pile.",
            ],
          },
          "The [Pro package](/pricing) adds group-buy and breaker settlement tools plus team seats for organizers running volume."
        ),
      },
      {
        id: "trust",
        heading: "Trust that scales your audience",
        body: p(
          "For breakers, reputation is the whole business. Offering documented, held-payment settlement signals to your community that their hits and their money are handled properly — which is exactly what keeps people coming back to your breaks.",
          "It's the same protection a one-off collector gets, applied at the pace a breaker needs."
        ),
      },
    ],
    faqs: [
      {
        q: "Can I run many settlements at once?",
        a: "Yes. The Plus and Pro packages support unlimited concurrent deals, and Pro adds group-buy and breaker settlement tools plus team seats for organizers.",
      },
      {
        q: "How does a member know their specific card shipped?",
        a: "Each settlement is its own deal with its own transparency timeline, hub documentation, tamper seal, and signature delivery — so every member can watch their own card's journey.",
      },
      {
        q: "Does each buyer pay their own fee?",
        a: "Who pays the per-deal fee is configurable per deal, and it's based on the sale price only. Every line is itemized on each buyer's checkout.",
      },
    ],
    related: ["high-value-cards", "social-sellers", "collectors"],
    cta: {
      title: "Settle every hit cleanly",
      body: "Held payments, documented cards, and signature delivery for each hand-off.",
    },
  },
];

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
