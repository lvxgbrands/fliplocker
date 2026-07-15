import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ScanLine, Image as ImageIcon, Stamp, Video, Lock, Trash2, FileSignature, ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { MarketingShell, PageHero, AnswerBlock } from "@/components/marketing-ui";
import { SectionKicker } from "@/components/marketing";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { SECURITY_FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Security & limits, what documentation proves",
  description:
    "The honest version of FlipLocker's documentation: what the hub confirms about a card, and the limits every buyer and seller should understand. We document cards; we do not grade them or guarantee they're genuine.",
  path: "/security",
  keywords: ["card documentation limits", "is FlipLocker safe", "tamper seal", "signature delivery"],
});

const PROVES = [
  { icon: ScanLine, t: "Registry status check", b: "The certificate number on the slab is confirmed valid and active in the grading company's registry." },
  { icon: ImageIcon, t: "Physical-to-record comparison", b: "The physical card is compared against the grading registry's stored image where one is available." },
  { icon: Video, t: "Video + photo documentation", b: "A 15-second inspection video and two reference photos are captured and attached to the deal." },
  { icon: Stamp, t: "Tamper-seal logging", b: "A numbered tamper seal is applied and permanently bound to the deal record before onward shipment." },
];

const LIMITS = [
  "FlipLocker is not a grading service and does not perform forensic (chemical, paper, ink, or microscopic) examination.",
  "A genuine certificate number reprinted onto a counterfeit slab can pass a registry lookup, documentation is an administrative data-match, not a guarantee of genuineness.",
  "A slab that has been opened and resealed may not be detectable by inspection alone.",
  "Cards are described as documented, never as guaranteed genuine, fraud-proof, or forensically examined.",
];

export default function Security() {
  return (
    <MarketingShell dark>
      <PageHero
        dark
        kicker="Security & documentation"
        title={
          <>
            What our documentation proves,{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              and what it doesn&apos;t
            </span>
          </>
        }
        lede="Honesty is the whole point. Here's exactly what happens to a card at the FlipLocker hub, and the limits every buyer and seller should understand."
      />

      <section className="mx-auto max-w-3xl px-4 pt-16">
        <AnswerBlock label="The honest answer">
          FlipLocker documents cards, it films, photographs, and tamper-seals them and confirms the slab&apos;s
          certificate number is active in the grading company&apos;s registry. It does <strong>not</strong> grade
          cards, judge whether they&apos;re genuine, or perform forensic examination. Documentation is a neutral,
          timestamped record of a card in transit, not a guarantee of genuineness.
        </AnswerBlock>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">What we document</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {PROVES.map((p) => (
            <div key={p.t} className="flex gap-4 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <p.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900">{p.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{p.b}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-ink-200 border-l-4 border-l-brand-500 bg-ink-50 p-7">
          <h2 className="text-xl font-bold text-ink-900">The limits, in plain terms</h2>
          <ul className="mt-4 space-y-3">
            {LIMITS.map((l) => (
              <li key={l} className="flex items-start gap-3 text-sm leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Pledge icon={Lock} t="Funds held by our processor" b="Buyer payments sit with our payment processor until delivery is signed for, FlipLocker never holds the purchase money." />
          <Pledge icon={FileSignature} t="Terms acknowledged" b="Both parties affirmatively accept the Terms of Service, including these limits, before a deal proceeds." />
          <Pledge icon={Trash2} t="Media auto-purged" b="Inspection videos are automatically deleted 30 days after confirmed delivery." />
        </div>

        <div className="mt-10 rounded-2xl border border-ink-200/70 bg-ink-50 p-6 text-center">
          <ShieldCheck className="mx-auto mb-2 h-7 w-7 text-brand-600" strokeWidth={1.8} />
          <p className="mx-auto max-w-xl text-sm text-ink-600">
            Want the mechanics behind each safeguard? Explore the{" "}
            <Link href="/platform" className="font-semibold text-brand-700 hover:underline">platform pillars</Link>{" "}
            or read the <Link href="/disclaimer" className="font-semibold text-brand-700 hover:underline">Disclaimer</Link>.
          </p>
        </div>
      </section>

      <section className="border-t border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <SectionKicker>Inspected &amp; documented, clearly</SectionKicker>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">No overclaiming, ever</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            You get a documented, insured, signature-delivered transaction and a full record of everything that
            happened to the card.
          </p>
          <Link href="/register" className={buttonClass("primary", "lg", "mt-7")}>
            Start a protected deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <FaqSection items={SECURITY_FAQS} kicker="Security FAQ" title="Security &amp; limits, answered" />
    </MarketingShell>
  );
}

function Pledge({ icon: Icon, t, b }: { icon: typeof Lock; t: string; b: string }) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
      <Icon className="mb-3 h-6 w-6 text-brand-600" strokeWidth={2} />
      <h3 className="font-bold text-ink-900">{t}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">{b}</p>
    </div>
  );
}
