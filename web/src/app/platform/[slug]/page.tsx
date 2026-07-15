import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell, PageHero, AnswerBlock, ContentBlocks, ContentSection, RelatedGrid, CtaBand } from "@/components/marketing-ui";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo";
import { getPillar, PILLARS } from "@/lib/platform";
import { PLATFORM_LINKS } from "@/lib/nav";

export function generateStaticParams() {
  return PILLARS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) return {};
  return pageMetadata({
    title: pillar.title,
    description: pillar.description,
    path: `/platform/${slug}`,
    keywords: [pillar.eyebrow.toLowerCase(), "card deal", "documentation", "peer to peer"],
  });
}

function label(slug: string) {
  return PLATFORM_LINKS.find((l) => l.href === `/platform/${slug}`)?.label ?? slug;
}

export default async function PillarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) notFound();

  const leaf = PLATFORM_LINKS.find((l) => l.href === `/platform/${slug}`);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Platform", path: "/platform" },
    { name: leaf?.label ?? pillar.title, path: `/platform/${slug}` },
  ];
  const related = pillar.related
    .map((s) => PLATFORM_LINKS.find((l) => l.href === `/platform/${s}`))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({ href: l.href, title: l.label, desc: l.desc, icon: l.icon }));

  return (
    <MarketingShell>
      <PageHero kicker={pillar.eyebrow} title={pillar.title} lede={pillar.intro} breadcrumbs={crumbs} align="left" />

      <article className="mx-auto max-w-3xl px-4 py-14">
        <AnswerBlock>{pillar.answer}</AnswerBlock>

        {/* On this page */}
        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-ink-200/70 bg-ink-50 p-5">
          <p className="kicker text-[11px] text-ink-400">On this page</p>
          <ul className="mt-3 space-y-1.5">
            {pillar.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-brand-700 hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 space-y-12">
          {pillar.sections.map((s) => (
            <ContentSection key={s.id} id={s.id} heading={s.heading}>
              <ContentBlocks blocks={s.body} />
            </ContentSection>
          ))}
        </div>
      </article>

      <FaqSection items={pillar.faqs} kicker="Questions" title={`${label(slug)} — FAQ`} />

      {related.length ? (
        <RelatedGrid title="Related platform pillars" items={related} />
      ) : null}

      <CtaBand title={pillar.cta.title} body={pillar.cta.body} primary={{ href: "/register", label: "Create a deal" }} secondary={{ href: "/platform", label: "Back to Platform" }} />
    </MarketingShell>
  );
}
