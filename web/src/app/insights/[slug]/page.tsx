import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, CalendarDays, CheckCircle2, ArrowRight } from "lucide-react";
import {
  MarketingShell,
  AnswerBlock,
  ContentBlocks,
  ContentSection,
  RelatedGrid,
  CtaBand,
  Breadcrumbs,
} from "@/components/marketing-ui";
import { FaqSection } from "@/components/faq-section";
import { NewsletterForm } from "@/components/newsletter";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, articleLd } from "@/lib/seo";
import { getArticle, ARTICLES, relatedArticles, formatArticleDate } from "@/lib/insights";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return pageMetadata({
    title: a.title,
    description: a.description,
    path: `/insights/${slug}`,
    type: "article",
    keywords: a.tags,
    publishedTime: a.date,
    modifiedTime: a.updated || a.date,
    authors: [a.author.name],
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights" },
    { name: a.title.length > 44 ? a.title.slice(0, 41) + "…" : a.title, path: `/insights/${slug}` },
  ];
  const related = relatedArticles(slug).map((r) => ({
    href: `/insights/${r.slug}`,
    title: r.title,
    desc: r.description,
    eyebrow: r.category,
  }));

  const toc = [
    { id: "key-takeaways", label: "Key takeaways" },
    ...a.sections.map((s) => ({ id: s.id, label: s.heading })),
    { id: "faq", label: "FAQ" },
  ];

  return (
    <MarketingShell>
      <JsonLd
        data={articleLd({
          title: a.title,
          description: a.description,
          path: `/insights/${slug}`,
          datePublished: a.date,
          dateModified: a.updated || a.date,
          authorName: a.author.name,
        })}
      />

      {/* Header */}
      <header className="border-b border-ink-200/60 bg-ink-50">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <Breadcrumbs items={crumbs} />
          <span className="kicker rounded-full bg-brand-50 px-2.5 py-1 text-[10px] text-brand-700">{a.category}</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">{a.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{a.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
            <span className="font-semibold text-ink-700">{a.author.name}</span>
            <span className="text-ink-300">·</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {formatArticleDate(a.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {a.readMinutes} min read
            </span>
          </div>
        </div>
      </header>

      {/* Body + sticky TOC */}
      <div className="mx-auto max-w-6xl px-4 py-14 lg:grid lg:grid-cols-[1fr_15rem] lg:gap-12">
        <article className="min-w-0 max-w-2xl">
          <AnswerBlock>{a.answer}</AnswerBlock>

          <section id="key-takeaways" className="mt-10 scroll-mt-24 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-ink-900">Key takeaways</h2>
            <ul className="mt-4 space-y-2.5">
              {a.keyTakeaways.map((k) => (
                <li key={k} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.2} />
                  {k}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 space-y-12">
            {a.sections.map((s) => (
              <ContentSection key={s.id} id={s.id} heading={s.heading}>
                <ContentBlocks blocks={s.body} />
              </ContentSection>
            ))}
          </div>

          {/* Inline newsletter */}
          <div className="mt-14 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6">
            <p className="kicker text-[11px] text-brand-600">Get the next one</p>
            <p className="mt-1.5 text-sm text-ink-600">Practical deal-safety playbooks, occasionally, in your inbox.</p>
            <div className="mt-3 max-w-md">
              <NewsletterForm source="insights" />
            </div>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="kicker text-[11px] text-ink-400">On this page</p>
            <ul className="mt-3 space-y-2 border-l border-ink-200">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-ink-500 hover:border-brand-500 hover:text-brand-700">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
              Start a protected deal <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </aside>
      </div>

      <FaqSection items={a.faqs} kicker="Questions" title="FAQ" />

      {related.length ? <RelatedGrid title="Related reading" items={related} /> : null}

      <CtaBand
        title="Close your next deal the safe way"
        body="Held payment, hub documentation, and insured signature delivery — from the handshake to the payout."
        primary={{ href: "/register", label: "Create a deal" }}
        secondary={{ href: "/insights", label: "More insights" }}
      />
    </MarketingShell>
  );
}
