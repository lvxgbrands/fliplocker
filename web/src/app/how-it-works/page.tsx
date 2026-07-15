import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquareText, FilePlus2, Mail, CreditCard, Tag, Building2,
  BadgeCheck, Truck, PenLine, PartyPopper,
} from "lucide-react";
import { buttonClass } from "@/components/ui";
import { MarketingShell, PageHero, AnswerBlock, CtaBand } from "@/components/marketing-ui";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { HOW_IT_WORKS_FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "How it works, from social handshake to signed delivery",
  description:
    "The eight steps of a FlipLocker deal: agree off-platform, invite the buyer, hold the payment, ship to the hub, document the card, deliver with a signature, and release the seller's payout after a review window.",
  path: "/how-it-works",
  keywords: ["how FlipLocker works", "card deal process", "held payment", "hub documentation"],
});

const STEPS = [
  { icon: MessageSquareText, t: "Agree the deal off-platform", b: "Buyer and seller settle on the card and price wherever they met, social media, a show, a group chat. FlipLocker never lists or brokers the sale." },
  { icon: FilePlus2, t: "Seller creates the deal", b: "Card details, front and rear photos, grade, certificate number, agreed price, and the buyer's email. A minimum sale price applies." },
  { icon: Mail, t: "Buyer is invited privately", b: "The buyer receives a one-time invitation link, claims it, and reviews the full itemized checkout before deciding." },
  { icon: CreditCard, t: "Buyer accepts & pays", b: "Payment runs through PayPal checkout. Funds are held securely by our payment processor, never by FlipLocker." },
  { icon: Tag, t: "Seller ships to the hub", b: "A prepaid, insured Leg 1 label is issued after a Terms acknowledgment. A 72-hour ship window keeps the deal moving." },
  { icon: Building2, t: "Hub inspects & documents", b: "The card is checked in, filmed for 15 seconds, photographed twice, and its tamper seal is logged and bound to the deal." },
  { icon: Truck, t: "Delivered with a signature", b: "After a passing inspection the card is repacked and shipped to the buyer with Signature Confirmation, never waived." },
  { icon: PartyPopper, t: "Payout released", b: "A 48-hour buyer review window opens on delivery. Approve it, or let it lapse, and the seller's payout plus FlipLocker's fee are released." },
];

export default function HowItWorks() {
  return (
    <MarketingShell>
      <PageHero
        kicker="How it works"
        title="From a social handshake to a signed delivery"
        lede="Eight steps, fully documented and timestamped on a transparency timeline both parties can watch in real time."
      />

      <section className="mx-auto max-w-3xl px-4 pt-14">
        <AnswerBlock label="The short version">
          A seller and buyer agree on a card off-platform. The seller creates the deal and invites the buyer,
          who pays, with funds held by our payment processor. The seller ships to the FlipLocker hub, the card
          is documented, and it&apos;s delivered to the buyer with a required signature. After a 48-hour review
          window, the seller is paid.
        </AnswerBlock>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <ol className="relative space-y-0">
          {STEPS.map((s, i) => (
            <li key={s.t} className="relative flex gap-5 pb-10 last:pb-0">
              {i < STEPS.length - 1 ? (
                <span className="absolute left-6 top-14 h-[calc(100%-32px)] w-px bg-gradient-to-b from-brand-200 to-brand-100" aria-hidden />
              ) : null}
              <span className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow">
                <s.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="pt-1.5">
                <span className="kicker text-[11px] text-brand-600">Step {i + 1}</span>
                <h3 className="mt-1 text-lg font-bold text-ink-900">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.b}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-ink-200/70 bg-ink-50 p-6">
          <BadgeCheck className="h-6 w-6 text-brand-600" strokeWidth={2} />
          <p className="flex-1 text-sm text-ink-600">
            If a card ever fails inspection, the deal is flagged, the buyer is automatically refunded, and the
            documentation is shared with both parties.
          </p>
          <Link href="/register" className={buttonClass("primary", "md")}>
            Create a deal <PenLine className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      </section>

      <FaqSection items={HOW_IT_WORKS_FAQS} kicker="How it works, FAQ" title="Common questions about the flow" />

      <CtaBand
        title="Ready when your buyer is"
        body="Create a deal, invite your buyer, and watch every step on a shared timeline."
        primary={{ href: "/register", label: "Get started" }}
        secondary={{ href: "/platform", label: "Explore the platform" }}
      />
    </MarketingShell>
  );
}
