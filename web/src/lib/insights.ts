// Insights content hub, original long-form articles. This is the SEO engine:
// each article leads with a concise, quotable answer (AEO), uses clear entity
// naming and internal links (GEO), and carries its own FAQ + Article JSON-LD.
//
// Body blocks: a plain string is a paragraph; { list } is a bullet list;
// { steps } is an ordered list; { note } is a callout. Paragraphs and list
// items support lightweight inline markup: **bold** and [label](/path) links.

export type Block =
  | string
  | { list: string[] }
  | { steps: string[] }
  | { note: string };

export interface ArticleSection {
  id: string;
  heading: string;
  body: Block[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO
  updated?: string; // ISO
  readMinutes: number;
  author: { name: string; role: string };
  tags: string[];
  /** One- or two-sentence quotable answer shown up top and extractable by answer engines. */
  answer: string;
  keyTakeaways: string[];
  sections: ArticleSection[];
  faqs: { q: string; a: string }[];
  related: string[]; // slugs
}

export const ARTICLES: Article[] = [
  {
    slug: "how-to-sell-graded-cards-safely-on-instagram",
    title: "How to Sell Graded Cards Safely on Instagram Without Getting Scammed",
    description:
      "A practical, step-by-step guide to closing a graded baseball-card sale you negotiated in Instagram DMs, without trusting a stranger with your card or your money.",
    category: "Selling",
    date: "2026-01-14",
    updated: "2026-06-02",
    readMinutes: 8,
    author: { name: "The FlipLocker Team", role: "Deal safety" },
    tags: ["instagram", "selling", "graded cards", "scam prevention"],
    answer:
      "To sell a graded card safely on Instagram, agree the price in DMs but never settle the payment there. Move the money and the card through a neutral process that holds the buyer's payment until the card is documented and delivered with a signature. That removes the two moments a social-media deal usually goes wrong: an unprotected payment, and a card that ships before anyone is accountable for it.",
    keyTakeaways: [
      "Instagram is great for finding a buyer and terrible for settling the payment.",
      "Friends & Family payments waive the protection you would otherwise have, never accept one for a sale.",
      "The safest structure holds the buyer's money until the card is documented and signed for on delivery.",
      "Screenshots of a chat are not a transaction record; a timestamped timeline is.",
    ],
    sections: [
      {
        id: "why-instagram-deals-go-wrong",
        heading: "Why Instagram card deals go wrong",
        body: [
          "Instagram is where a huge share of graded-card deals now start. You post a Bo Jackson rookie, someone slides into your DMs, and within a few messages you have a price. The problem is that the same DM thread is a terrible place to *finish* the deal.",
          "Two failure points cause almost every bad outcome. The first is the payment: a buyer sends money by a method with no recourse, or a seller ships first and the payment never arrives. The second is the handoff: the card leaves your hands before anyone independent has documented what it was and what condition it was in, so a later dispute becomes your word against theirs.",
          { note: "A social handshake is a starting point, not a contract. Treat the DM as the negotiation and move the settlement somewhere accountable." },
        ],
      },
      {
        id: "before-you-agree",
        heading: "Before you agree on a price",
        body: [
          "Do a little homework while you still have leverage. None of this requires special tools.",
          {
            list: [
              "Confirm the card details you will stand behind: player, year, set, grading company, grade, and the certificate number on the slab.",
              "Photograph the front and back in good light, including the grading label and the flip's certificate number.",
              "Look up that certificate number in the grading company's public registry so your listing matches the record.",
              "Decide your minimum acceptable price and who covers fees and shipping before you name a number.",
            ],
          },
          "Being able to state the card precisely, and show it matches the registry, is the single biggest trust signal you can send a serious buyer.",
        ],
      },
      {
        id: "the-safe-way-to-settle",
        heading: "The safe way to settle the money and the card",
        body: [
          "Once you have a price, stop negotiating and start structuring. A safe settlement has three properties: the buyer's payment is **held** rather than handed over, the card is **documented** by someone neutral before it reaches the buyer, and every step is **timestamped** so neither side can rewrite history.",
          "This is exactly the structure FlipLocker was built for. You create the deal, invite your buyer by email, and the buyer pays through PayPal checkout. The funds are held by our payment processor, not by FlipLocker and not by you, until the card has been documented at our hub and delivered to the buyer with a required signature.",
          { steps: [
            "Agree the card and price in DMs.",
            "Create the deal on FlipLocker and invite the buyer.",
            "The buyer reviews an itemized checkout and pays; the money is held by the processor.",
            "You ship to the FlipLocker hub with a prepaid, insured label.",
            "The hub films, photographs, and tamper-seals the card and logs it to the deal.",
            "The card ships to the buyer with signature-required delivery; after a 48-hour review window your payout is released.",
          ] },
          "See the full walkthrough on [How it works](/how-it-works), or the seller-specific version on [Solutions for social sellers](/solutions/social-sellers).",
        ],
      },
      {
        id: "red-flags",
        heading: "Buyer red flags to walk away from",
        body: [
          "Most scams announce themselves if you know the tells.",
          {
            list: [
              "**\"Just do Friends & Family and I'll add a bit extra.\"** F&F removes purchase protection. The bonus is bait.",
              "**Urgency.** \"I can only pay in the next ten minutes\" is pressure designed to skip your safety steps.",
              "**Off-platform pivots.** A buyer who insists on a payment app you've never used, or a gift-card top-up, is steering you toward an irreversible transfer.",
              "**Overpayment.** An \"accidental\" overpayment followed by a refund request is a classic reversal scam.",
            ],
          },
          "None of these are a problem when the payment is held by a processor and released only on documented delivery, there is nothing to reverse and nothing to chase.",
        ],
      },
      {
        id: "keep-the-record",
        heading: "Keep a record you could actually stand behind",
        body: [
          "If a card is ever questioned after delivery, screenshots of a friendly chat won't help you much. What helps is an independent, timestamped record: photos and video captured at a neutral hub, a logged tamper seal, and carrier tracking that ends in a signature.",
          "That record is generated automatically for every FlipLocker deal and shared with both parties. It is documentation, not a grade or a guarantee of genuineness, read exactly what it does and doesn't cover on [Security & limits](/security).",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I just use PayPal Goods & Services on my own?",
        a: "You can, and it is far better than Friends & Family, but on its own it still ships the card before anyone documents it. Pairing a held payment with neutral hub documentation and signature delivery closes the gap that a plain payment leaves open. See our comparison of PayPal Goods & Services vs Friends & Family for the details.",
      },
      {
        q: "Does FlipLocker confirm the card is genuine?",
        a: "No. FlipLocker documents the card, it films, photographs, and tamper-seals it and confirms the certificate number is active in the grading company's registry. It does not grade cards, does not judge whether a card is genuine, and does not guarantee a slab is genuine. The card is described as documented, not as guaranteed genuine.",
      },
      {
        q: "Who pays the fees when I sell?",
        a: "The FlipLocker service fee is based only on the sale price, never the card's market value, and who pays (buyer, seller, or split) is configurable. Every line item is shown at checkout before anyone pays. See Pricing for the three packages.",
      },
    ],
    related: [
      "spotting-scams-in-peer-to-peer-card-deals",
      "paypal-goods-and-services-vs-friends-and-family",
      "what-card-documentation-actually-means",
    ],
  },

  {
    slug: "spotting-scams-in-peer-to-peer-card-deals",
    title: "9 Red Flags of a Card-Deal Scam and How to Shut Them Down",
    description:
      "The nine most common scams in peer-to-peer trading-card deals, the psychology behind each one, and the single structural change that neutralizes almost all of them.",
    category: "Safety",
    date: "2026-02-03",
    readMinutes: 9,
    author: { name: "The FlipLocker Team", role: "Deal safety" },
    tags: ["scams", "safety", "buyer protection", "seller protection"],
    answer:
      "Most peer-to-peer card scams rely on one of two things: an irreversible payment, or a card that changes hands before anyone neutral has documented it. Remove those two levers, hold the payment and document the card at a neutral hub, and the common scams stop working, because there is nothing to reverse and nothing to dispute after the fact.",
    keyTakeaways: [
      "Almost every scam is an attempt to make you pay irreversibly or ship unprotected.",
      "Urgency and 'trust me' are tools, not courtesies.",
      "A held payment defeats reversal, overpayment, and chargeback-bait scams at once.",
      "Neutral documentation defeats bait-and-switch and 'the card arrived damaged' disputes.",
    ],
    sections: [
      {
        id: "the-two-levers",
        heading: "The two levers behind almost every scam",
        body: [
          "It is tempting to memorize a hundred individual scams. Don't. Nearly all of them pull one of two levers: they get you to **pay in a way that can't be undone**, or they get the **card to move before it's documented**. Every red flag below is a variation on one of those two moves.",
        ],
      },
      {
        id: "payment-scams",
        heading: "Red flags on the payment side",
        body: [
          {
            list: [
              "**Friends & Family requests.** The buyer offers extra to cover the F&F 'savings.' You lose recourse; they keep the option to walk.",
              "**Overpayment and refund.** They 'accidentally' send too much and ask you to refund the difference, then reverse the original.",
              "**Unfamiliar apps or gift cards.** Any push toward an irreversible or untraceable rail is a push away from your protection.",
              "**Chargeback bait.** A card payment made specifically to be disputed after the item ships.",
            ],
          },
          "The counter to all four is the same: don't hold the money yourself and don't let the payer hold the option to claw it back. When the buyer's payment is **held by a neutral processor** and released only on documented, signature-confirmed delivery, there is nothing to reverse.",
        ],
      },
      {
        id: "card-scams",
        heading: "Red flags on the card side",
        body: [
          {
            list: [
              "**Bait and switch.** Photos of a pristine slab; a different card in the box.",
              "**'It arrived damaged.'** A real or invented condition complaint after delivery, with no neutral record of the card's state beforehand.",
              "**The resealed slab.** A genuine certificate number on a slab that was opened and resealed.",
              "**The vanishing seller.** Payment sent, tracking never appears, account goes quiet.",
              "**The phantom buyer.** A seller ships on a promise; the payment never clears.",
            ],
          },
          "Neutral documentation is the counter here. When a hub films and photographs the exact card, logs a numbered tamper seal, and ships it with a required signature, a later 'that's not what I sent / not what I got' argument runs into a timestamped record instead of a stalemate.",
          { note: "Documentation is not a genuineness guarantee. It cannot prove a slab is genuine and does not detect every resealed slab, read the honest limits on [Security & limits](/security)." },
        ],
      },
      {
        id: "shut-them-down",
        heading: "How to shut them all down at once",
        body: [
          "You don't need nine different defenses. You need a deal structure where the money is held and the card is documented. That is the entire premise of FlipLocker: the buyer pays, the funds sit with the payment processor, the card is documented at the hub, and only after signature delivery and a 48-hour review window is the seller paid.",
          "If you only remember one rule from this article: **never let value move in one direction without the other side being accountable.** Structure beats vigilance.",
          "New to dealing with strangers? Start with [our first-time deal guide](/solutions/first-time-deals). Buying something expensive? Use the [high-value checklist](/insights/buying-a-four-figure-card-from-a-stranger).",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a signature really necessary on delivery?",
        a: "Yes. A required signature converts 'I never got it' into a carrier-confirmed fact. On FlipLocker the buyer-leg signature is never waived, and both shipping legs are insured.",
      },
      {
        q: "What if the card genuinely fails inspection at the hub?",
        a: "If a card doesn't match the seller's listing, the deal is flagged, the buyer is automatically refunded, the documentation is shared with both parties, and a return label is issued to the seller. The buyer is never left holding a mismatch.",
      },
      {
        q: "Does holding the payment make FlipLocker a financial custodian?",
        a: "No. FlipLocker never takes possession or control of the purchase funds, they are held by our payment processor. FlipLocker is not a money transmitter; its account receives only its service fee.",
      },
    ],
    related: [
      "how-to-sell-graded-cards-safely-on-instagram",
      "buying-a-four-figure-card-from-a-stranger",
      "paypal-goods-and-services-vs-friends-and-family",
    ],
  },

  {
    slug: "what-card-documentation-actually-means",
    title: "What 'Card Documentation' Actually Means, and What It Doesn't",
    description:
      "A precise, honest definition of card documentation: what a neutral hub can confirm about a graded card, what it deliberately does not claim, and why that distinction protects you.",
    category: "Explainers",
    date: "2026-02-20",
    readMinutes: 7,
    author: { name: "The FlipLocker Team", role: "Documentation hub" },
    tags: ["documentation", "definitions", "grading", "trust"],
    answer:
      "Card documentation is an administrative record that a specific physical card, in a slab whose certificate number is active in the grading company's registry, passed through a neutral hub and was filmed, photographed, and tamper-sealed. It is not grading and not a guarantee of genuineness: it does not chemically or microscopically examine the card and cannot guarantee a slab is genuine. Documentation proves what happened to a card in transit; it does not re-judge the card itself.",
    keyTakeaways: [
      "Documentation = a neutral, timestamped record of a card's identity and condition in transit.",
      "It confirms the certificate number is active in the grading registry, an administrative data match.",
      "It is explicitly not grading and not a guarantee of genuineness.",
      "The honesty of that boundary is what makes the record trustworthy.",
    ],
    sections: [
      {
        id: "definition",
        heading: "A precise definition",
        body: [
          "**Card documentation** is the creation of a neutral, timestamped record about a specific card as it moves between two people. At the FlipLocker hub, documenting a card means confirming a physical card matching the seller's listing, in a slab bearing a certificate number that is valid and active in the grading company's registry, and then capturing that card on a short video and two photographs with a logged, numbered tamper seal.",
          "That record answers a narrow but crucial set of questions: which card is this, what condition is it in right now, and can we prove it didn't change between the seller's hands and the buyer's?",
        ],
      },
      {
        id: "what-it-confirms",
        heading: "What documentation confirms",
        body: [
          {
            list: [
              "The certificate number on the slab is active in the grading company's public registry (an administrative data match).",
              "The physical card present matches the seller's stated player, year, set, and grade.",
              "The card's condition on arrival at the hub, captured on video and in photographs.",
              "A numbered tamper seal, logged and bound to the deal before the card ships onward.",
              "An unbroken, timestamped chain from hub to buyer, ending in a delivery signature.",
            ],
          },
        ],
      },
      {
        id: "what-it-does-not",
        heading: "What documentation does not claim",
        body: [
          "This is the part most services blur. FlipLocker states it plainly.",
          {
            list: [
              "It is **not a genuineness guarantee**. The hub does not perform a forensic (chemical, paper, ink, or microscopic) examination and does not judge whether the card itself is genuine.",
              "It is **not grading**. The grade printed on the slab is the grading company's opinion, not FlipLocker's.",
              "A genuine certificate number **reprinted onto a counterfeit slab** can pass a registry lookup, a data match is not a guarantee of genuineness.",
              "A slab that was **opened and resealed** may not be detectable by inspection alone.",
            ],
          },
          { note: "Because of these limits we always say a card is 'documented', never 'graded' or 'guaranteed genuine.'" },
        ],
      },
      {
        id: "why-the-boundary-helps",
        heading: "Why the boundary actually protects you",
        body: [
          "A service that overpromises and claims to guarantee a card is genuine gives you false confidence and a weaker claim when something goes wrong. A service that documents honestly gives you a precise, defensible record and an accurate understanding of what you're relying on.",
          "For most peer-to-peer deals, the real risks aren't exotic forgeries, they're bait-and-switch, condition disputes, and payments that vanish. Documentation plus a held payment addresses those directly. Learn how the record is built on [Hub documentation](/platform/hub-documentation) and where the money sits on [Payments held by the processor](/platform/payments-held-by-processor).",
        ],
      },
    ],
    faqs: [
      {
        q: "Is 'documented' just a softer word for 'guaranteed genuine'?",
        a: "No, the difference is real, not cosmetic. A genuineness guarantee is a forensic judgment that a card is real. Documentation is a neutral record of a card's identity, condition, and chain of custody in transit. FlipLocker does the second and deliberately does not claim the first.",
      },
      {
        q: "If the certificate number checks out, is the card definitely real?",
        a: "Not necessarily. A registry match confirms the number is active, but a genuine number can be reprinted onto a counterfeit slab. That is exactly why documentation is described as an administrative data match, not a guarantee of genuineness.",
      },
      {
        q: "How long is the documentation kept?",
        a: "The record of the deal is retained, while inspection video and photos are automatically purged 30 days after confirmed delivery by default. See Media auto-purge for details.",
      },
    ],
    related: [
      "how-to-sell-graded-cards-safely-on-instagram",
      "buying-a-four-figure-card-from-a-stranger",
      "how-to-ship-a-graded-card-safely",
    ],
  },

  {
    slug: "how-to-ship-a-graded-card-safely",
    title: "How to Ship a Graded Card So It Arrives Safe and Signed-For",
    description:
      "A field-tested packing and shipping method for slabbed cards, plus why a two-leg, insured, signature-required route beats shipping straight to a buyer.",
    category: "Logistics",
    date: "2026-03-11",
    readMinutes: 8,
    author: { name: "The FlipLocker Team", role: "Logistics" },
    tags: ["shipping", "packing", "insurance", "usps"],
    answer:
      "To ship a graded card safely, immobilize the slab between rigid layers, waterproof it, and use a tracked, insured service with a required signature. For a deal with a stranger, route the card through a neutral hub instead of shipping direct: the seller ships to the hub, the card is documented, and the hub ships to the buyer with an insured, signature-required label, two accountable legs instead of one blind one.",
    keyTakeaways: [
      "Immobilize, waterproof, and rigidly sandwich the slab, movement and moisture cause most damage.",
      "Always use tracking, insurance, and a required signature for anything of value.",
      "A two-leg route through a neutral hub adds documentation and removes 'ship first' risk.",
      "Never waive the signature on a valuable card.",
    ],
    sections: [
      {
        id: "materials",
        heading: "What you need",
        body: [
          "You don't need much, but skipping any of it is where cards get hurt.",
          {
            list: [
              "A team bag or sleeve for the slab, so tape never touches the case.",
              "Two rigid pieces of cardboard cut larger than the slab, or a slab-sized cardboard shipping brace.",
              "Painter's tape (low-tack) to secure the sandwich without gumming anything.",
              "A waterproof layer, a zip bag works, because mailers get wet.",
              "A bubble mailer or, for higher value, a small rigid box.",
            ],
          },
        ],
      },
      {
        id: "packing-steps",
        heading: "The packing method, step by step",
        body: [
          { steps: [
            "Sleeve or team-bag the slab so nothing adhesive contacts the case.",
            "Center it between two rigid boards larger than the slab on every side.",
            "Tape the sandwich so the slab cannot slide, but never tape directly to the slab.",
            "Seal the sandwich inside a waterproof bag.",
            "Pad it inside a bubble mailer or rigid box with a little give on all sides.",
            "Tape all seams; keep the address label flat and fully legible.",
          ] },
          { note: "The enemy is movement and moisture. If the card can shift or get damp, your packing isn't done." },
        ],
      },
      {
        id: "service-and-insurance",
        heading: "Choosing a service, insurance, and signature",
        body: [
          "For anything with real value, three settings are non-negotiable: **tracking**, **insurance** matched to the sale price, and a **required signature** on delivery. The signature is what turns 'I never received it' into a carrier-confirmed fact.",
          "Insurance should reflect what you'd actually need to make someone whole, and a signature should never be waived to save a trip to the counter. On a valuable card, convenience is not worth the exposure.",
        ],
      },
      {
        id: "two-leg",
        heading: "Why two legs beat one",
        body: [
          "Shipping straight to a stranger means the card is in the wind the moment it leaves your hands, with no neutral record of what you sent. A two-leg route fixes that.",
          "On FlipLocker, the seller ships **Leg 1** to the documentation hub on a prepaid, insured label. The hub films, photographs, and tamper-seals the card, then ships **Leg 2** to the buyer with insured, signature-required delivery. Both legs are tracked end to end on the deal timeline, and the buyer's payment stays held until that final signature lands.",
          "Read more on [Insured signature delivery](/platform/signature-delivery) and the full [transparency timeline](/platform/transparency-timeline).",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I write 'trading cards' on the package?",
        a: "Keep labels accurate for insurance and customs, but you don't need to advertise value on the outside of the box. Discreet, well-taped, and fully tracked is the goal.",
      },
      {
        q: "Who pays for shipping and insurance on FlipLocker?",
        a: "Outbound shipping, signature, and declared-value coverage are itemized at checkout, and Leg 1 to the hub is issued as a prepaid label. Exact figures are shown before anyone pays; the service fee itself is based only on the sale price.",
      },
      {
        q: "What happens if a card is damaged in transit?",
        a: "Both legs are insured, and the hub documents the card's condition on arrival, so there is a neutral before-and-after record. That record is what makes a coverage claim straightforward rather than a dispute.",
      },
    ],
    related: [
      "what-card-documentation-actually-means",
      "buying-a-four-figure-card-from-a-stranger",
      "how-to-sell-graded-cards-safely-on-instagram",
    ],
  },

  {
    slug: "paypal-goods-and-services-vs-friends-and-family",
    title: "PayPal Goods & Services vs Friends & Family for Card Deals",
    description:
      "Why 'Friends & Family' is the wrong choice for a card sale, what Goods & Services does and doesn't cover, and how a held payment closes the remaining gap.",
    category: "Payments",
    date: "2026-04-08",
    readMinutes: 6,
    author: { name: "The FlipLocker Team", role: "Payments" },
    tags: ["paypal", "payments", "buyer protection", "fees"],
    answer:
      "For any card sale, use PayPal Goods & Services, never Friends & Family. Friends & Family is designed for gifts and reimbursements and waives purchase protection, so a buyer who pays that way has no recourse and a seller who requests it is a red flag. Goods & Services keeps protection but still ships the card before it's documented, which is the gap a held-payment, hub-documented process is designed to close.",
    keyTakeaways: [
      "Friends & Family = no purchase protection. Never use it to buy or sell a card.",
      "A seller asking for F&F 'to save fees' is asking you to give up recourse.",
      "Goods & Services protects the payment but not the card's documentation.",
      "A held payment plus neutral documentation covers both the money and the card.",
    ],
    sections: [
      {
        id: "the-difference",
        heading: "The actual difference",
        body: [
          "**Friends & Family** is a way to move money between people who trust each other, splitting dinner, repaying a loan. It generally carries no purchase protection because it isn't meant for purchases. **Goods & Services** is the payment type for buying something; it carries a fee and, in exchange, the structured protection that comes with a commercial transaction.",
          "For a card deal, that difference is the whole ballgame. If you pay a stranger by Friends & Family and the card never arrives, or isn't what was pictured, you've given up the very mechanism that would have helped you.",
        ],
      },
      {
        id: "why-sellers-ask",
        heading: "Why some sellers push for Friends & Family",
        body: [
          "Usually the pitch is 'send F&F and we both save the fee.' Sometimes it's genuine fee-aversion. Often it's not: F&F conveniently strips the buyer's recourse and leaves the seller holding all the leverage.",
          { note: "A discount that only exists if you waive your protection isn't a discount. It's the price of the risk you're being asked to absorb." },
        ],
      },
      {
        id: "the-remaining-gap",
        heading: "The gap Goods & Services still leaves",
        body: [
          "Goods & Services is the right call, but be clear about what it does. It protects the **payment**. It does nothing to document the **card**: the seller still ships first, and there's no neutral record of what was in the box or what condition it was in.",
          "So condition disputes and bait-and-switch still come down to argument and screenshots. That's the gap.",
        ],
      },
      {
        id: "closing-the-gap",
        heading: "Closing the gap with a held payment",
        body: [
          "FlipLocker uses PayPal checkout, but changes the timing and adds the missing piece. The buyer pays, and the funds are **held by the payment processor** rather than delivered to the seller. The card ships to a **neutral hub**, is **documented** on video and photos with a logged tamper seal, and only then goes to the buyer with a signature. The seller is paid after delivery and a 48-hour review window.",
          "So you get the payment protection of a proper commercial transaction *and* a neutral record of the card, the two things a bare payment can't give you on its own. FlipLocker never takes possession or control of the purchase funds and is not a money transmitter; see [Payments held by the processor](/platform/payments-held-by-processor) and the [Disclaimer](/disclaimer).",
        ],
      },
    ],
    faqs: [
      {
        q: "Is it against the rules to ask for Friends & Family on a sale?",
        a: "It generally goes against the spirit of the payment type, which exists for personal transfers rather than purchases. More to the point, accepting F&F for a purchase means giving up purchase protection, a bad trade for a buyer regardless of the rules.",
      },
      {
        q: "Does FlipLocker charge PayPal's fee on top of its own?",
        a: "Payment-processing costs and the FlipLocker service fee are itemized transparently at checkout. The FlipLocker fee is based only on the sale price, and you see every line before you pay.",
      },
      {
        q: "Can the seller reach into my payment early?",
        a: "No. Funds are held by the payment processor and released to the seller only after documented, signature-confirmed delivery and the review window. FlipLocker's own account receives only its service fee.",
      },
    ],
    related: [
      "how-to-sell-graded-cards-safely-on-instagram",
      "spotting-scams-in-peer-to-peer-card-deals",
      "what-card-documentation-actually-means",
    ],
  },

  {
    slug: "buying-a-four-figure-card-from-a-stranger",
    title: "Buying a Four-Figure Card From a Stranger: A Safety Checklist",
    description:
      "A pre-flight checklist for high-value graded-card purchases from someone you don't know, from certificate checks to a held payment and signature delivery.",
    category: "Buying",
    date: "2026-05-19",
    readMinutes: 9,
    author: { name: "The FlipLocker Team", role: "Deal safety" },
    tags: ["buying", "high-value", "checklist", "graded cards"],
    answer:
      "Before buying a four-figure card from a stranger, confirm the listing against the grading registry, insist on a payment that is held rather than handed over, and require neutral documentation plus signature delivery. The higher the value, the less you should rely on trust and the more you should rely on structure: a held payment and a documented, insured, signed-for handoff.",
    keyTakeaways: [
      "At four figures, replace trust with structure at every step.",
      "Match the certificate number to the registry before you commit.",
      "Insist the payment is held until the card is documented and signed for.",
      "Insure to full value and never waive the delivery signature.",
    ],
    sections: [
      {
        id: "before-you-commit",
        heading: "Before you commit",
        body: [
          "The excitement of a grail is exactly when discipline matters most. Run this checklist before money moves.",
          {
            list: [
              "Get clear photos of the front, back, and the grading label with the certificate number legible.",
              "Look up the certificate number in the grading company's registry and confirm player, year, set, and grade match.",
              "Ask when and where the seller acquired it, and whether it has been out of the slab.",
              "Agree in writing on price, who pays fees and shipping, and the exact process before paying anything.",
            ],
          },
          { note: "A registry match is reassuring but not proof of genuineness, a real number can be printed on a counterfeit slab. Treat it as one signal, not the finish line. See [what documentation means](/insights/what-card-documentation-actually-means)." },
        ],
      },
      {
        id: "structure-the-payment",
        heading: "Structure the payment so it's held, not handed over",
        body: [
          "Never send a four-figure payment directly to a stranger, and never by a method with no recourse. The safest structure holds your money until the card is in your hands and documented.",
          "With FlipLocker, you pay through PayPal checkout and the funds are held by the payment processor, not by the seller and not by FlipLocker, until the card has been documented at the hub and delivered to you with a required signature. If the card fails inspection, you're refunded automatically.",
        ],
      },
      {
        id: "documentation-and-delivery",
        heading: "Require documentation and signature delivery",
        body: [
          "For a high-value card, insist that a neutral party documents it before it reaches you and that it ships insured with a signature.",
          {
            list: [
              "The card is filmed and photographed at a neutral hub, with a numbered tamper seal logged to the deal.",
              "Leg 2 to you is insured to value and requires your signature, never waived.",
              "Every step is timestamped on a shared timeline you can watch in real time.",
            ],
          },
          "This is the standard flow for high-value deals on FlipLocker, see [Solutions for high-value cards](/solutions/high-value-cards) and [Insured signature delivery](/platform/signature-delivery).",
        ],
      },
      {
        id: "after-delivery",
        heading: "After delivery",
        body: [
          "When the card arrives, inspect it against the documentation immediately and within your review window. Compare the tamper seal, the card, and its condition to the hub's record. If something is off, raise it before the window closes rather than after.",
          "On FlipLocker a 48-hour buyer review window opens on delivery; the seller is paid only after it passes. That window is your protection, use it deliberately.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does FlipLocker hold my funds itself?",
        a: "No. FlipLocker never takes possession or control of your purchase funds, they are held by our payment processor. FlipLocker is not a money transmitter, and its account receives only its service fee.",
      },
      {
        q: "What if the seller refuses a documented, held-payment process?",
        a: "On a four-figure card, a seller unwilling to let the payment be held and the card be documented is telling you something. A legitimate seller benefits from the same record you do.",
      },
      {
        q: "Does higher value cost more in fees?",
        a: "The FlipLocker service fee is a function of the sale price only, never the card's comp or market value, and it's shown at checkout before you pay. See Pricing for the packages.",
      },
    ],
    related: [
      "spotting-scams-in-peer-to-peer-card-deals",
      "how-to-ship-a-graded-card-safely",
      "paypal-goods-and-services-vs-friends-and-family",
    ],
  },
];

export const ARTICLE_CATEGORIES = Array.from(new Set(ARTICLES.map((a) => a.category)));

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string): Article[] {
  const a = getArticle(slug);
  if (!a) return [];
  return a.related.map((s) => getArticle(s)).filter((x): x is Article => Boolean(x));
}

/** Human date, e.g. "January 14, 2026". */
export function formatArticleDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
