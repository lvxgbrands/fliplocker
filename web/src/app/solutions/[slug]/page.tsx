import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell, PageHero, AnswerBlock, ContentBlocks, ContentSection, RelatedGrid, CtaBand } from "@/components/marketing-ui";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { getSolution, SOLUTIONS } from "@/lib/solutions";
import { SOLUTIONS_LINKS } from "@/lib/nav";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sol = getSolution(slug);
  if (!sol) return {};
  return pageMetadata({
    title: sol.title,
    description: sol.description,
    path: `/solutions/${slug}`,
    keywords: [sol.eyebrow.toLowerCase(), "card deals", "buyer protection", "seller protection"],
  });
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sol = getSolution(slug);
  if (!sol) notFound();

  const leaf = SOLUTIONS_LINKS.find((l) => l.href === `/solutions/${slug}`);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Solutions", path: "/solutions" },
    { name: leaf?.label ?? sol.title, path: `/solutions/${slug}` },
  ];
  const related = sol.related
    .map((s) => SOLUTIONS_LINKS.find((l) => l.href === `/solutions/${s}`))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({ href: l.href, title: l.label, desc: l.desc, icon: l.icon }));

  return (
    <MarketingShell>
      <PageHero kicker={sol.eyebrow} title={sol.title} lede={sol.intro} breadcrumbs={crumbs} align="left" />

      <article className="mx-auto max-w-3xl px-4 py-14">
        <AnswerBlock>{sol.answer}</AnswerBlock>

        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-ink-200/70 bg-ink-50 p-5">
          <p className="kicker text-[11px] text-ink-400">On this page</p>
          <ul className="mt-3 space-y-1.5">
            {sol.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-brand-700 hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 space-y-12">
          {sol.sections.map((s) => (
            <ContentSection key={s.id} id={s.id} heading={s.heading}>
              <ContentBlocks blocks={s.body} />
            </ContentSection>
          ))}
        </div>
      </article>

      <FaqSection items={sol.faqs} kicker="Questions" title={`${leaf?.label ?? sol.title}, FAQ`} />

      {related.length ? <RelatedGrid title="Other solutions" items={related} /> : null}

      <CtaBand title={sol.cta.title} body={sol.cta.body} primary={{ href: "/register", label: "Create a deal" }} secondary={{ href: "/solutions", label: "All solutions" }} />
    </MarketingShell>
  );
}
