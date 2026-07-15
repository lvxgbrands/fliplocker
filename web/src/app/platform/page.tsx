import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { MarketingShell, PageHero, AnswerBlock, RelatedGrid, CtaBand } from "@/components/marketing-ui";
import { SectionKicker } from "@/components/marketing";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, serviceLd } from "@/lib/seo";
import { PLATFORM_LINKS } from "@/lib/nav";
import { PLATFORM_FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "The Platform — how FlipLocker protects a card deal",
  description:
    "The FlipLocker platform holds the buyer's payment with our payment processor, documents every card at a neutral hub, and delivers it with insured signature shipping — on a shared, timestamped timeline.",
  path: "/platform",
  keywords: ["card deal protection", "hub documentation", "held payment", "signature delivery"],
});

const FLOW = [
  { n: "01", t: "Agree off-platform", b: "Buyer and seller settle the card and price wherever they met." },
  { n: "02", t: "Pay & hold", b: "The buyer pays; funds are held by our payment processor." },
  { n: "03", t: "Document at the hub", b: "The card is filmed, photographed, tamper-sealed, and logged." },
  { n: "04", t: "Deliver & release", b: "Insured signature delivery, then payout after the review window." },
];

export default function PlatformPage() {
  return (
    <MarketingShell dark>
      <JsonLd
        data={serviceLd(
          "FlipLocker card-deal documentation and logistics",
          "Held payment, neutral hub documentation, and insured signature delivery for peer-to-peer graded card deals.",
          "/platform"
        )}
      />

      <PageHero
        dark
        kicker="The Platform"
        title={
          <>
            Everything that makes a stranger&apos;s deal{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">safe</span>
          </>
        }
        lede="FlipLocker turns a risky social-media handshake into a documented, protected transaction — the payment held, the card documented, the delivery signed for, every step on a shared timeline."
        actions={
          <>
            <Link href="/register" className={buttonClass("primary", "lg")}>
              Create a deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center rounded-2xl border border-white/20 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              See the full flow
            </Link>
          </>
        }
      />

      {/* Answer block */}
      <section className="mx-auto max-w-3xl px-4 pt-16">
        <AnswerBlock label="What the platform does">
          The FlipLocker platform handles the three parts of a private card deal where things go wrong:
          it <strong>holds the buyer&apos;s payment</strong> with our payment processor, <strong>documents the card</strong>{" "}
          at a neutral hub, and <strong>delivers it with an insured signature</strong> — all recorded on a
          shared, timestamped timeline. It documents cards; it does not grade them or guarantee they&apos;re genuine.
        </AnswerBlock>
      </section>

      {/* Flow strip */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((f) => (
            <div key={f.n} className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
              <span className="text-3xl font-extrabold text-ink-100" style={{ fontFamily: "var(--font-display)" }}>
                {f.n}
              </span>
              <h3 className="mt-2 font-bold text-ink-900">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{f.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <SectionKicker>The pillars</SectionKicker>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Six systems, one protected deal</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-500">
              Each pillar closes a specific gap in a peer-to-peer deal. Explore how they work.
            </p>
          </div>
          <RelatedGrid
            bare
            items={PLATFORM_LINKS.map((l) => ({
              href: l.href,
              title: l.label,
              desc: l.desc,
              icon: l.icon,
            }))}
          />
        </div>
      </section>

      <FaqSection items={PLATFORM_FAQS} kicker="Platform questions" title="Platform, answered" />

      <CtaBand
        title="See it work end to end"
        body="Every pillar comes together the moment you create a deal and invite your buyer."
        primary={{ href: "/register", label: "Create a deal" }}
        secondary={{ href: "/security", label: "Read the honest limits" }}
      />
    </MarketingShell>
  );
}
