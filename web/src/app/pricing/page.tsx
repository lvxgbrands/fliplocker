import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { getFeeConfig, getCheckoutConfig } from "@/lib/config";
import { computeQuote, formatCents } from "@/lib/fees";
import { buttonClass } from "@/components/ui";
import { CostBreakdown } from "@/components/deal-ui";
import { MarketingNav, MarketingFooter, SectionKicker } from "@/components/marketing";

export const metadata = { title: "Pricing — FlipLocker" };

// Reads live fee/checkout config from the DB — render per request, not at build.
export const dynamic = "force-dynamic";

const pct = (bps: number) => `${(bps / 100).toFixed(bps % 100 ? 2 : 0)}%`;

export default async function Pricing() {
  const [free, pro, checkout] = await Promise.all([
    getFeeConfig("FREE"),
    getFeeConfig("PRO"),
    getCheckoutConfig(),
  ]);

  // Worked example — roster card #4 (Frank Baker, $385) on the Free plan.
  const examplePriceCents = 38500;
  const quote = computeQuote({ salePriceCents: examplePriceCents, feeConfig: free, checkout, taxRateBps: 0 });

  const plans = [
    { name: "Free", cfg: free, tone: "light" as const, blurb: "Everything you need to close a deal safely." },
    { name: "Pro", cfg: pro, tone: "dark" as const, blurb: "Lower fees for high-volume sellers." },
  ];

  const commonFeatures = [
    "Hub verification & documentation",
    "15-second inspection video + 2 photos",
    "Tamper-seal logging",
    "Insured two-leg shipping, signature delivery",
    "Funds held by our payment processor",
    "Live transparency timeline",
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <section className="border-b border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <SectionKicker>Pricing</SectionKicker>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            A fee based only on the sale price
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
            The card&apos;s market value is never used. Below the crossover price the fee is a flat
            floor; at or above it, a percentage. Minimum deal price {formatCents(checkout.minSalePriceCents)}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((p) => {
            const dark = p.tone === "dark";
            return (
              <div
                key={p.name}
                className={`relative overflow-hidden rounded-3xl border p-8 shadow-soft ${
                  dark ? "hero-dark border-navy-800 text-white" : "border-ink-200/70 bg-white"
                }`}
              >
                {dark ? <div className="dotgrid-blue absolute inset-0" aria-hidden /> : null}
                <div className="relative">
                  <p className={`kicker text-[12px] ${dark ? "text-brand-300" : "text-brand-600"}`}>{p.name} plan</p>
                  <p className={`mt-3 text-3xl font-extrabold tracking-tight ${dark ? "text-white" : "text-ink-950"}`} style={{ fontFamily: "var(--font-display)" }}>
                    {formatCents(p.cfg.floorCents)}
                    <span className={`text-base font-semibold ${dark ? "text-brand-100/70" : "text-ink-400"}`}> flat</span>
                  </p>
                  <p className={`mt-1 text-sm ${dark ? "text-brand-100/70" : "text-ink-500"}`}>
                    under {formatCents(p.cfg.crossoverPriceCents)}, then <strong className={dark ? "text-white" : "text-ink-800"}>{pct(p.cfg.percentBps)}</strong> of the sale price
                  </p>
                  <p className={`mt-1 text-xs ${dark ? "text-brand-100/60" : "text-ink-400"}`}>
                    Fee paid: {p.cfg.whoPays.toLowerCase() === "split" ? "split 50/50 between buyer & seller" : p.cfg.whoPays.toLowerCase()}
                  </p>
                  <p className={`mt-4 text-sm ${dark ? "text-brand-100/80" : "text-ink-600"}`}>{p.blurb}</p>
                  <ul className="mt-6 space-y-2.5">
                    {commonFeatures.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${dark ? "text-brand-100/85" : "text-ink-600"}`}>
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-brand-300" : "text-brand-600"}`} strokeWidth={2.6} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={buttonClass(dark ? "primary" : "secondary", "md", "mt-8 w-full")}>
                    Get started
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          Fee tiers, who-pays, insurance, and tax lines are fully configurable — final numbers are set
          by FlipLocker and shown at checkout before anyone pays.
        </p>
      </section>

      {/* Worked example */}
      <section className="border-t border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="mb-8 text-center">
            <SectionKicker>Worked example</SectionKicker>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A {formatCents(examplePriceCents)} deal on the Free plan
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-ink-500">
              1909 T206 Frank Baker (PSA 3). Exactly what the buyer sees at checkout — every line
              itemized, the card amount kept separate from FlipLocker&apos;s service fee.
            </p>
          </div>
          <div className="mx-auto max-w-md">
            <CostBreakdown
              totalLabel="Buyer pays"
              totalCents={quote.buyerTotalCents}
              lines={[
                { label: "Card (peer-to-peer amount)", cents: quote.salePriceCents, hint: "Paid to the seller, held until delivery", emphasize: true },
                ...(quote.feeBuyerCents > 0 ? [{ label: "FlipLocker service fee", cents: quote.feeBuyerCents, hint: "Verification, documentation & logistics" }] : []),
                { label: "Outbound shipping & signature", cents: quote.shippingCents },
                ...(quote.insuranceCents > 0 ? [{ label: "Declared-value coverage", cents: quote.insuranceCents }] : []),
              ]}
            />
            <p className="mt-3 text-center text-xs text-ink-400">
              Seller receives {formatCents(quote.sellerPayoutCents)} on completion · FlipLocker fee {formatCents(quote.feeTotalCents)}
            </p>
          </div>
        </div>
      </section>

      <section className="hero-dark relative overflow-hidden">
        <div className="dotgrid-blue absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">No surprises at checkout</h2>
          <Link href="/register" className={buttonClass("primary", "lg", "mt-6")}>
            Create a deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
