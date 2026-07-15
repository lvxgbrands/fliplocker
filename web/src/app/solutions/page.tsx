import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { MarketingShell, PageHero, AnswerBlock, RelatedGrid, CtaBand } from "@/components/marketing-ui";
import { SectionKicker } from "@/components/marketing";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { SOLUTIONS_LINKS } from "@/lib/nav";
import { SOLUTIONS } from "@/lib/solutions";
import { SOLUTIONS_FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Solutions, safe card deals for every kind of dealer",
  description:
    "However you deal, social seller, serious collector, high-value trader, first-timer, or breaker, FlipLocker gives your peer-to-peer graded-card deal a held payment, hub documentation, and signature delivery.",
  path: "/solutions",
  keywords: ["sell trading cards safely", "buy graded cards", "breakers", "high value cards"],
});

export default function SolutionsPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Solutions"
        title="Built for the way you actually deal"
        lede="Instagram sellers, grail-chasing buyers, breakers, and first-timers all face the same two risks, an unprotected payment and an undocumented card. FlipLocker removes both, whatever your angle."
        actions={
          <Link href="/register" className={buttonClass("primary", "lg")}>
            Start a deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        }
      />

      <section className="mx-auto max-w-3xl px-4 pt-16">
        <AnswerBlock label="One protection, many use cases">
          Every FlipLocker path shares the same core: the buyer&apos;s payment is <strong>held</strong> by our
          payment processor, the card is <strong>documented</strong> at a neutral hub, and it&apos;s delivered
          with an insured <strong>signature</strong>. What changes by audience is the volume, the stakes, and
          the tools, not the underlying safety.
        </AnswerBlock>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <SectionKicker>By audience</SectionKicker>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your playbook</h2>
        </div>
        <RelatedGrid
          bare
          items={SOLUTIONS.map((s) => {
            const leaf = SOLUTIONS_LINKS.find((l) => l.href === `/solutions/${s.slug}`);
            return {
              href: `/solutions/${s.slug}`,
              title: leaf?.label ?? s.title,
              desc: s.audience,
              eyebrow: s.eyebrow,
              icon: leaf?.icon,
            };
          })}
        />
      </section>

      <FaqSection items={SOLUTIONS_FAQS} kicker="Solutions questions" title="Which path fits you?" />

      <CtaBand
        title="Your deal, protected end to end"
        body="Pick your path or just start a deal, the protection is the same either way."
        primary={{ href: "/register", label: "Create a deal" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </MarketingShell>
  );
}
