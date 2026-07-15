import type { Metadata } from "next";
import Link from "next/link";
import { getFeeConfig, getCheckoutConfig } from "@/lib/config";
import { computeQuote, formatCents } from "@/lib/fees";
import { buttonClass } from "@/components/ui";
import { CostBreakdown } from "@/components/deal-ui";
import { MarketingShell, PageHero, AnswerBlock, CtaBand } from "@/components/marketing-ui";
import { SectionKicker } from "@/components/marketing";
import { PricingCards } from "@/components/pricing-cards";
import { PricingCompare } from "@/components/pricing-compare";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, productLd } from "@/lib/seo";
import { offerData } from "@/lib/pricing";
import { PRICING_FAQS } from "@/lib/faqs";

// Reads live fee/checkout config from the DB — render per request, not at build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — Single, Plus & Pro packages",
  description:
    "Three FlipLocker packages — Single, Plus, and Pro — with monthly or annual billing (save 17% annually). The per-deal service fee is based on the sale price only, never a card's market value.",
  path: "/pricing",
  keywords: ["FlipLocker pricing", "card deal fees", "trading card escrow alternative", "service fee"],
});

const pct = (bps: number) => `${(bps / 100).toFixed(bps % 100 ? 2 : 0)}%`;

export default async function Pricing() {
  const [free, pro, checkout] = await Promise.all([
    getFeeConfig("FREE"),
    getFeeConfig("PRO"),
    getCheckoutConfig(),
  ]);

  // Worked example — Ken Griffey Jr. ($425) on the standard (Single) fee schedule.
  const examplePriceCents = 42500;
  const quote = computeQuote({ salePriceCents: examplePriceCents, feeConfig: free, checkout, taxRateBps: 0 });

  return (
    <MarketingShell>
      <JsonLd data={productLd(offerData())} />

      <PageHero
        kicker="Pricing"
        title="Simple packages. One honest fee."
        lede="Pick a package for the volume and tools you need, then pay a per-deal service fee based only on the sale price. No surprises, ever — every line is shown at checkout before anyone pays."
      />

      {/* Packages + billing toggle */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <PricingCards />
        <p className="mt-8 text-center text-xs text-ink-400">
          Package prices are the subscription. The per-deal service fee is separate, based on the sale
          price only, and shown at checkout. Fee tiers, who-pays, insurance, and tax lines are configurable.
        </p>
      </section>

      {/* Per-deal fee explainer + worked example */}
      <section className="border-t border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <SectionKicker>The per-deal service fee</SectionKicker>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Based on the sale price. Never the card&apos;s value.</h2>
              <div className="mt-5">
                <AnswerBlock label="How the fee works">
                  FlipLocker&apos;s service fee is a function of the sale price only. Below a crossover price
                  it&apos;s a flat floor; at or above it, a percentage of the sale price. A card&apos;s comp or
                  market value is never collected, stored, or used. Minimum deal price {formatCents(checkout.minSalePriceCents)}.
                </AnswerBlock>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink-200/70 bg-white p-5">
                  <dt className="kicker text-[11px] text-brand-600">Standard schedule</dt>
                  <dd className="mt-1.5 text-sm text-ink-600">
                    {formatCents(free.floorCents)} flat under {formatCents(free.crossoverPriceCents)}, then{" "}
                    <strong className="text-ink-900">{pct(free.percentBps)}</strong> of the sale price.
                  </dd>
                </div>
                <div className="rounded-2xl border border-ink-200/70 bg-white p-5">
                  <dt className="kicker text-[11px] text-brand-600">Pro schedule</dt>
                  <dd className="mt-1.5 text-sm text-ink-600">
                    {formatCents(pro.floorCents)} flat under {formatCents(pro.crossoverPriceCents)}, then{" "}
                    <strong className="text-ink-900">{pct(pro.percentBps)}</strong> of the sale price.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mx-auto w-full max-w-md">
              <p className="mb-3 text-center text-sm font-semibold text-ink-500">
                A {formatCents(examplePriceCents)} deal, itemized
              </p>
              <CostBreakdown
                totalLabel="Buyer pays"
                totalCents={quote.buyerTotalCents}
                lines={[
                  { label: "Card (peer-to-peer amount)", cents: quote.salePriceCents, hint: "Paid to the seller, held until delivery", emphasize: true },
                  ...(quote.feeBuyerCents > 0 ? [{ label: "FlipLocker service fee", cents: quote.feeBuyerCents, hint: "Documentation & logistics" }] : []),
                  { label: "Outbound shipping & signature", cents: quote.shippingCents },
                  ...(quote.insuranceCents > 0 ? [{ label: "Declared-value coverage", cents: quote.insuranceCents }] : []),
                ]}
              />
              <p className="mt-3 text-center text-xs text-ink-400">
                Seller receives {formatCents(quote.sellerPayoutCents)} on completion · FlipLocker fee {formatCents(quote.feeTotalCents)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-8 text-center">
          <SectionKicker>Full comparison</SectionKicker>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything in every package</h2>
        </div>
        <div className="rounded-3xl border border-ink-200/70 bg-white p-2 shadow-soft sm:p-4">
          <PricingCompare />
        </div>
        <div className="mt-8 text-center">
          <Link href="/register" className={buttonClass("primary", "lg")}>
            Get started
          </Link>
        </div>
      </section>

      {/* Pricing FAQ */}
      <FaqSection items={PRICING_FAQS} kicker="Pricing questions" title="Pricing, answered" />

      <CtaBand
        title="No surprises at checkout"
        body="Every line — card amount, service fee, shipping, coverage — is shown before anyone pays."
        primary={{ href: "/register", label: "Create a deal" }}
        secondary={{ href: "/how-it-works", label: "See how it works" }}
      />
    </MarketingShell>
  );
}
