import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MessageSquareText,
  FilePlus2,
  Lock,
  Video,
  ArrowRight,
  ShieldCheck,
  Camera,
  Stamp,
  PenLine,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getFeeConfig, getCheckoutConfig } from "@/lib/config";
import { formatCents } from "@/lib/fees";
import { buttonClass } from "@/components/ui";
import { MarketingNav, MarketingFooter, SectionKicker, ShowcaseSlab } from "@/components/marketing";
import { HeroShowcase } from "@/components/hero-showcase";
import { NewsTicker } from "@/components/news-ticker";
import { FaqSection } from "@/components/faq-section";
import { Reveal } from "@/components/reveal";
import { SHOWCASE } from "@/lib/marketing";
import { HOME_FAQS } from "@/lib/faqs";

const STEPS = [
  { icon: MessageSquareText, title: "Agree your deal anywhere", body: "You and your buyer settle on the card and price off-platform. FlipLocker is invitation-only — no listings, no browsing." },
  { icon: FilePlus2, title: "Create the deal, invite the buyer", body: "The seller enters the card, photos, and agreed price. The buyer gets a private email invitation to review and accept." },
  { icon: Lock, title: "Payment held by our processor", body: "The buyer pays through PayPal checkout. Funds are held securely by our payment processor — never by FlipLocker." },
  { icon: Video, title: "Documented, packed, delivered", body: "The card is inspected and documented on video at the hub, then delivered with signature confirmation before the seller is paid." },
];

const SECURITY = [
  { icon: Video, title: "15-second inspection video", body: "Every card is filmed at the hub and the clip is attached to the deal for both parties to watch." },
  { icon: Camera, title: "Two reference photos", body: "High-resolution front and rear captures documented alongside the seller's original listing images." },
  { icon: Stamp, title: "Tamper-seal serial", body: "A numbered tamper seal is logged and permanently bound to the deal record before the card ships onward." },
  { icon: PenLine, title: "Signature delivery", body: "Leg 2 to the buyer always requires a signature — it is never waived — and both legs are insured." },
];

function feeSummary(floorCents: number, percentBps: number, crossoverCents: number) {
  return `${formatCents(floorCents)} flat under ${formatCents(crossoverCents)}, then ${(percentBps / 100).toFixed(percentBps % 100 ? 2 : 0)}%`;
}

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const [free, pro, checkout] = await Promise.all([
    getFeeConfig("FREE"),
    getFeeConfig("PRO"),
    getCheckoutConfig(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <a href="#main" className="skip-link">Skip to content</a>
      <MarketingNav dark />
      <main id="main">

      {/* Hero */}
      <section className="hero-dark relative overflow-hidden">
        <div className="dotgrid-blue absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div>
            <p className="kicker mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] text-brand-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Private &amp; invitation-only
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              The safe way to close the card deal you{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                made on social.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/80">
              FlipLocker handles the payment, hub documentation, and insured signature delivery for
              peer-to-peer graded card deals. The buyer&apos;s money is held securely by our payment
              processor until the card is documented and delivered.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className={buttonClass("primary", "lg")}>
                Create a deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-2xl border border-white/20 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                I was invited
              </Link>
            </div>
          </div>

          {/* Premium hero: cards spin centrifugally on cursor proximity */}
          <HeroShowcase />
        </div>
      </section>

      {/* Live card-market news ticker */}
      <NewsTicker />

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-14 text-center">
          <SectionKicker>How it works</SectionKicker>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">One deal, four safe steps</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="group relative h-full rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="text-4xl font-extrabold text-ink-100" style={{ fontFamily: "var(--font-display)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-2 font-bold text-ink-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Product showcase */}
      <section className="border-y border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="mb-4 text-center">
            <SectionKicker>Recent documented deals</SectionKicker>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Real cards, protected end-to-end</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-500">
              Every deal is private and invitation-only — these are examples of the caliber of cards
              that move safely through FlipLocker. There is nothing to browse or buy here.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASE.map((c, i) => (
              <Reveal key={c.slug} delay={i * 110} className="h-full">
                <ShowcaseSlab card={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fee transparency teaser */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionKicker>Transparent pricing</SectionKicker>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A service fee based only on the sale price
            </h2>
            <p className="mt-4 text-ink-500">
              The card&apos;s market value is never used — the fee is a function of the agreed sale
              price alone, shown in full at checkout. Minimum deal price {formatCents(checkout.minSalePriceCents)}.
            </p>
            <Link href="/pricing" className={buttonClass("secondary", "md", "mt-6")}>
              See full pricing <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlanCard name="Free" tone="light" summary={feeSummary(free.floorCents, free.percentBps, free.crossoverPriceCents)} whoPays={free.whoPays} />
            <PlanCard name="Pro" tone="dark" summary={feeSummary(pro.floorCents, pro.percentBps, pro.crossoverPriceCents)} whoPays={pro.whoPays} />
          </div>
        </div>
      </section>

      {/* Security / process */}
      <section className="border-t border-ink-200/60 bg-gradient-to-b from-ink-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="mb-14 text-center">
            <SectionKicker>The documentation promise</SectionKicker>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Documented at the hub, delivered with a signature
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SECURITY.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mb-1.5 font-bold text-ink-900">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-500">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection
        items={HOME_FAQS}
        title="Good to know before you deal"
        intro="The essentials on how FlipLocker protects a peer-to-peer card deal from handshake to payout."
      />

      {/* Final CTA */}
      <section className="hero-dark relative overflow-hidden">
        <div className="dotgrid-blue absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            The handshake happened on social. The protection happens here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100/80">
            Every card is documented, and delivered with a signature before a single dollar
            reaches the seller.
          </p>
          <Link href="/register" className={buttonClass("primary", "lg", "mt-8")}>
            Start your first deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      </main>
      <MarketingFooter />
    </div>
  );
}

function PlanCard({
  name,
  tone,
  summary,
  whoPays,
}: {
  name: string;
  tone: "light" | "dark";
  summary: string;
  whoPays: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`rounded-2xl border p-6 shadow-soft ${
        dark ? "hero-dark border-navy-800 text-white" : "border-ink-200/70 bg-white"
      }`}
    >
      <p className={`kicker text-[11px] ${dark ? "text-brand-300" : "text-brand-600"}`}>{name} plan</p>
      <p className={`mt-2 text-lg font-bold ${dark ? "text-white" : "text-ink-900"}`}>{summary}</p>
      <p className={`mt-3 text-xs ${dark ? "text-brand-100/70" : "text-ink-500"}`}>
        Fee paid: {whoPays.toLowerCase() === "split" ? "split 50/50" : whoPays.toLowerCase()}
      </p>
    </div>
  );
}
