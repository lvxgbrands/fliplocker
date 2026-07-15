import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Scale, Eye, Lock, ShieldCheck, Trash2, PenLine, Users } from "lucide-react";
import { MarketingShell, PageHero, AnswerBlock, CtaBand } from "@/components/marketing-ui";
import { SectionKicker } from "@/components/marketing";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { ABOUT_FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "About FlipLocker — why we exist",
  description:
    "FlipLocker exists to make the graded-card deals people negotiate on social media safe to close. Our mission, our safety promise, and the honest limits we hold ourselves to.",
  path: "/about",
  keywords: ["about FlipLocker", "FlipLocker mission", "safe card deals company"],
});

const VALUES = [
  { icon: Scale, t: "Honesty over hype", b: "We say documented, never guaranteed genuine. We publish our limits instead of hiding them. An accurate promise is worth more than an impressive one." },
  { icon: Eye, t: "Transparency by default", b: "Both parties watch the same timestamped timeline. There is no hidden state, no separate stories — one shared source of truth for every deal." },
  { icon: Lock, t: "Safety through structure", b: "We don't ask people to trust strangers. We build a process that protects both sides even when trust isn't there: held payment, documentation, signature." },
  { icon: Users, t: "For the community", b: "FlipLocker is built by people who deal cards, for people who deal cards — starting with baseball, the category we know best." },
];

const PROMISES = [
  { icon: Lock, t: "Payments held by our processor", b: "Buyer funds sit with our payment processor until delivery is signed for — never with FlipLocker." },
  { icon: ShieldCheck, t: "Documented, not overclaimed", b: "We document cards; we don't grade them or guarantee they're genuine, and we say so plainly." },
  { icon: PenLine, t: "A signature, never waived", b: "The buyer-leg delivery signature is required on every deal. Convenience never trumps proof." },
  { icon: Trash2, t: "Privacy by default", b: "Inspection media is automatically purged 30 days after delivery. We keep the record, not your business forever." },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <PageHero
        dark
        kicker="About"
        title={
          <>
            The handshake happens on social.{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              The protection happens here.
            </span>
          </>
        }
        lede="FlipLocker exists to make the card deals people negotiate in DMs safe to actually close — without anyone shipping into the unknown or paying into it."
      />

      {/* Mission / why */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <AnswerBlock label="Our mission">
          FlipLocker makes peer-to-peer graded-card deals safe to close. We hold the buyer&apos;s payment
          with our payment processor, document every card at a neutral hub, and deliver it with an insured
          signature — turning a risky social-media handshake into a documented, protected transaction.
        </AnswerBlock>

        <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-ink-600">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">Why we built it</h2>
          <p>
            The trading-card hobby moved to social media, but the tools to close a deal never caught up.
            People find each other on Instagram, X, and Discord, agree a price in the DMs, and then hit the
            scariest part: sending money to a stranger, or shipping a valuable slab on a promise. Every week,
            someone gets burned — a Friends &amp; Family payment with no recourse, a card that never arrives,
            a &ldquo;that&apos;s not what I sent&rdquo; standoff with no neutral record.
          </p>
          <p>
            FlipLocker was built to close that gap. Not as a marketplace — there&apos;s nothing here to browse
            or buy — but as the safe, neutral place to finish a deal two people already agreed to. We handle
            the three moments where private deals go wrong: the payment, the handoff, and the record.
          </p>
          <p>
            We&apos;re starting with baseball, using real graded cards from names like Ken Griffey Jr., Bo
            Jackson, and Cal Ripken Jr., because we&apos;d rather do one category exceptionally well than do
            everything adequately.
          </p>
        </div>
      </section>

      {/* Safety promise */}
      <section className="border-y border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <SectionKicker>The safety promise</SectionKicker>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Four commitments on every deal</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.t} className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="font-bold text-ink-900">{p.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{p.b}</p>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-500">
            Read the honest, detailed version of what our documentation does and doesn&apos;t cover on the{" "}
            <Link href="/security" className="font-semibold text-brand-700 hover:underline">Security &amp; limits</Link> page.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-center gap-3">
          <Compass className="h-7 w-7 text-brand-600" strokeWidth={1.8} />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What we value</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.t} className="flex gap-4 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-bold text-ink-900">{v.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{v.b}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FaqSection items={ABOUT_FAQS} kicker="About FAQ" title="More about FlipLocker" />

      <CtaBand
        title="Deal like the pros — safely"
        body="Bring the buyer you found on social. We'll handle the payment, the documentation, and the delivery."
        primary={{ href: "/register", label: "Create a deal" }}
        secondary={{ href: "/how-it-works", label: "How it works" }}
      />
    </MarketingShell>
  );
}
