import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { MarketingShell, PageHero } from "@/components/marketing-ui";
import { ContactForm } from "@/components/contact-form";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Contact FlipLocker",
  description:
    "Get in touch with the FlipLocker team about a deal, selling, buying, press, or partnerships. Email support@fliplocker.app or send a message — we reply within one business day.",
  path: "/contact",
  keywords: ["contact FlipLocker", "FlipLocker support"],
});

const DETAILS = [
  { icon: Mail, t: "Email us", b: "support@fliplocker.app", href: "mailto:support@fliplocker.app" },
  { icon: Clock, t: "Response time", b: "Within one business day (faster for Pro)." },
  { icon: ShieldCheck, t: "On a specific deal?", b: "Include your deal's short code so we can help quickly." },
];

export default function ContactPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Contact"
        title="Talk to FlipLocker"
        lede="Questions about a deal, selling, buying, or working together? Send a note and we'll get back to you within one business day."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Form */}
          <div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-bold text-ink-900">Send us a message</h2>
            <p className="mt-1.5 text-sm text-ink-500">We read every one. No bots, no runaround.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {DETAILS.map((d) => {
              const Icon = d.icon;
              const inner = (
                <div className="flex gap-4 rounded-2xl border border-ink-200/70 bg-white p-5 shadow-soft">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink-900">{d.t}</h3>
                    <p className="mt-0.5 text-sm text-ink-500">{d.b}</p>
                  </div>
                </div>
              );
              return d.href ? (
                <a key={d.t} href={d.href} className="block transition-transform hover:-translate-y-0.5">
                  {inner}
                </a>
              ) : (
                <div key={d.t}>{inner}</div>
              );
            })}

            <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6">
              <HelpCircle className="h-6 w-6 text-brand-600" strokeWidth={2} />
              <h3 className="mt-2 font-bold text-ink-900">Looking for a quick answer?</h3>
              <p className="mt-1 text-sm text-ink-600">
                Our <Link href="/faq" className="font-semibold text-brand-700 hover:underline">FAQ hub</Link> covers
                payments, shipping, documentation, safety, and accounts. The{" "}
                <Link href="/how-it-works" className="font-semibold text-brand-700 hover:underline">How it works</Link>{" "}
                page walks the whole flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={CONTACT_FAQS} kicker="Contact FAQ" title="Before you write" />
    </MarketingShell>
  );
}
