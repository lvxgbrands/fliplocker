import type { Metadata } from "next";
import Link from "next/link";
import { Search, Clock, ArrowRight } from "lucide-react";
import { MarketingShell, PageHero } from "@/components/marketing-ui";
import { NewsletterForm } from "@/components/newsletter";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, SITE, absoluteUrl } from "@/lib/seo";
import { ARTICLES, ARTICLE_CATEGORIES, formatArticleDate, type Article } from "@/lib/insights";

export const metadata: Metadata = pageMetadata({
  title: "Insights — playbooks for safe peer-to-peer card deals",
  description:
    "Original, practical guides on selling graded cards on social media, spotting scams, shipping slabs safely, PayPal payment types, and what card documentation really means.",
  path: "/insights",
  keywords: ["sports card blog", "sell graded cards", "card deal safety", "trading card guides"],
});

function matches(a: Article, q: string): boolean {
  const hay = `${a.title} ${a.description} ${a.category} ${a.tags.join(" ")}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

function ArticleCard({ a, featured = false }: { a: Article; featured?: boolean }) {
  return (
    <Link
      href={`/insights/${a.slug}`}
      className={`group flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
        featured ? "sm:p-8" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="kicker rounded-full bg-brand-50 px-2.5 py-1 text-[10px] text-brand-700">{a.category}</span>
        <span className="flex items-center gap-1 text-xs text-ink-400">
          <Clock className="h-3 w-3" /> {a.readMinutes} min read
        </span>
      </div>
      <h3 className={`mt-3 font-bold text-ink-900 ${featured ? "text-2xl" : "text-lg"}`}>{a.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{a.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink-400">{formatArticleDate(a.date)}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

export default async function InsightsIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const filtered = ARTICLES.filter(
    (a) => (!q || matches(a, q)) && (!category || a.category === category)
  );
  const [featured, ...rest] = filtered;
  const isFiltering = Boolean(q || category);

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FlipLocker Insights",
    description: "Playbooks for safe peer-to-peer card deals.",
    url: absoluteUrl("/insights"),
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    blogPost: ARTICLES.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      url: absoluteUrl(`/insights/${a.slug}`),
      datePublished: a.date,
      description: a.description,
    })),
  };

  return (
    <MarketingShell>
      <JsonLd data={blogLd} />
      <PageHero
        kicker="Insights"
        title="Playbooks for safe card deals"
        lede="Practical, original guides on selling on social, spotting scams, shipping slabs, and what card documentation really means — written by the team that built FlipLocker."
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        {/* Search + categories */}
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form action="/insights" method="get" role="search" className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search insights…"
              aria-label="Search insights"
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/insights"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                !category ? "bg-brand-600 text-white" : "border border-ink-200 text-ink-600 hover:border-brand-300"
              }`}
            >
              All
            </Link>
            {ARTICLE_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/insights?category=${encodeURIComponent(c)}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  category === c ? "bg-brand-600 text-white" : "border border-ink-200 text-ink-600 hover:border-brand-300"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 px-8 py-16 text-center">
            <p className="text-ink-500">
              No insights match{q ? ` “${q}”` : ""}. <Link href="/insights" className="font-semibold text-brand-700">Clear filters</Link>.
            </p>
          </div>
        ) : (
          <>
            {featured && !isFiltering ? (
              <div className="mb-6">
                <ArticleCard a={featured} featured />
              </div>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(isFiltering ? filtered : rest).map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </>
        )}

        {/* Inline newsletter */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-to-br from-brand-50 to-white p-8 sm:p-10">
          <div className="grid items-center gap-6 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="kicker text-[11px] text-brand-600">The newsletter</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Deal-safety playbooks in your inbox</h2>
              <p className="mt-2 text-sm text-ink-500">
                Occasional, practical emails on closing peer-to-peer card deals safely. No spam, unsubscribe anytime.
              </p>
            </div>
            <NewsletterForm source="insights" />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
