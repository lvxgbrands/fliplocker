import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, PageHero, CtaBand } from "@/components/marketing-ui";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, faqPageLd } from "@/lib/seo";
import { FAQ_HUB, faqHubFlat } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "FAQ, payments, shipping, documentation & safety",
  description:
    "Answers to the most common FlipLocker questions, grouped by topic: getting started, payments & fees, shipping & the hub, documentation & the card, safety & disputes, and account.",
  path: "/faq",
  keywords: ["FlipLocker FAQ", "how does FlipLocker work", "card deal questions"],
});

export default function FaqHub() {
  return (
    <MarketingShell>
      <JsonLd data={faqPageLd(faqHubFlat())} />

      <PageHero
        kicker="FAQ"
        title="Questions, answered"
        lede="Everything about closing a peer-to-peer card deal on FlipLocker, the payment, the hub, the documentation, and the safeguards, in one place."
      />

      <div className="mx-auto max-w-4xl px-4 py-14">
        {/* Category quick-nav */}
        <nav aria-label="FAQ categories" className="mb-12 flex flex-wrap justify-center gap-2">
          {FAQ_HUB.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {c.heading}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          {FAQ_HUB.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-24">
              <h2 className="mb-5 text-2xl font-bold tracking-tight text-ink-900">{cat.heading}</h2>
              <div className="space-y-3">
                {cat.items.map((f) => (
                  <details
                    key={f.q}
                    className="group rounded-2xl border border-ink-200/70 bg-white px-5 py-4 shadow-soft [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                      {f.q}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-400 transition-transform duration-200 group-open:rotate-45">
                        <span className="text-lg leading-none">+</span>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-2xl border border-ink-200/70 bg-ink-50 p-6 text-center text-sm text-ink-600">
          Didn&apos;t find it? Read <Link href="/how-it-works" className="font-semibold text-brand-700 hover:underline">How it works</Link>,
          the <Link href="/security" className="font-semibold text-brand-700 hover:underline">Security &amp; limits</Link> page, or{" "}
          <Link href="/contact" className="font-semibold text-brand-700 hover:underline">contact us</Link>.
        </p>
      </div>

      <CtaBand
        title="Ready to close a deal safely?"
        body="Create a deal, invite your buyer, and let FlipLocker handle the rest."
        primary={{ href: "/register", label: "Create a deal" }}
        secondary={{ href: "/contact", label: "Contact support" }}
      />
    </MarketingShell>
  );
}
