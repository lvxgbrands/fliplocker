import Link from "next/link";
import { ShieldCheck, ScanLine, Image as ImageIcon, Stamp, Video, Lock, Trash2, FileSignature, ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { MarketingNav, MarketingFooter, SectionKicker } from "@/components/marketing";

export const metadata = { title: "Security & verification — FlipLocker" };

const PROVES = [
  { icon: ScanLine, t: "Registry status check", b: "The certificate number on the slab is confirmed valid and active in the grading company's registry." },
  { icon: ImageIcon, t: "Physical-to-record comparison", b: "The physical card is compared against the grading registry's stored image where one is available." },
  { icon: Video, t: "Video + photo documentation", b: "A 15-second inspection video and two reference photos are captured and attached to the deal." },
  { icon: Stamp, t: "Tamper-seal logging", b: "A numbered tamper seal is applied and permanently bound to the deal record before onward shipment." },
];

const LIMITS = [
  "FlipLocker is not a grading service and does not perform forensic (chemical, paper, ink, or microscopic) examination.",
  "A genuine certificate number reprinted onto a counterfeit slab can pass a registry lookup — verification is an administrative data-match, not a guarantee of genuineness.",
  "A slab that has been opened and resealed may not be detectable by inspection alone.",
  "Cards are described as verified and documented — never as “authenticated,” “guaranteed genuine,” or “fraud-proof.”",
];

export default function Security() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav dark />
      <section className="hero-dark relative overflow-hidden">
        <div className="dotgrid-blue absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
          <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-brand-400" strokeWidth={1.8} />
          <SectionKicker>Security &amp; verification</SectionKicker>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            What our verification proves — and what it doesn&apos;t
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100/80">
            Honesty is the whole point. Here&apos;s exactly what happens to a card at the FlipLocker
            hub, and the limits every buyer and seller should understand.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20">
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

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/60 p-7">
          <h2 className="text-xl font-bold text-amber-900">The limits — in plain terms</h2>
          <ul className="mt-4 space-y-3">
            {LIMITS.map((l) => (
              <li key={l} className="flex items-start gap-3 text-sm leading-relaxed text-amber-900/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Pledge icon={Lock} t="Funds held by our processor" b="Buyer payments sit with our payment processor until delivery is signed for — FlipLocker never holds the purchase money." />
          <Pledge icon={FileSignature} t="Terms acknowledged" b="Both parties affirmatively accept the Terms of Service, including these limits, before a deal proceeds." />
          <Pledge icon={Trash2} t="Media auto-purged" b="Inspection videos are automatically deleted 30 days after confirmed delivery." />
        </div>
      </section>

      <section className="border-t border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Verified &amp; documented — clearly</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            No overclaiming. You get a documented, insured, signature-delivered transaction and a full
            record of everything that happened to the card.
          </p>
          <Link href="/register" className={buttonClass("primary", "lg", "mt-7")}>
            Start a protected deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
      <MarketingFooter />
    </div>
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
