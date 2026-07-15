import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { NewsTicker } from "@/components/news-ticker";
import { buttonClass } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/seo";
import type { Block } from "@/lib/insights";

// ---------------------------------------------------------------------------
// Page shell — nav (+ optional ticker) + <main> + footer + skip link.
// ---------------------------------------------------------------------------
export function MarketingShell({
  children,
  dark = false,
  ticker = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
  ticker?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* News ticker pinned at the very top; the sticky nav slides under it on scroll. */}
      {ticker ? <NewsTicker /> : null}
      <MarketingNav dark={dark} />
      <main id="main">{children}</main>
      <MarketingFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline markdown-ish renderer for content blocks: **bold** and [label](/href).
// ---------------------------------------------------------------------------
function renderBold(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/\*\*([^*]+)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-ink-900">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export function renderInline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) nodes.push(...renderBold(text.slice(last, m.index), `${keyPrefix}-${i}`));
    const label = m[1];
    const href = m[2];
    nodes.push(
      href.startsWith("/") ? (
        <Link
          key={`${keyPrefix}-l${i}`}
          href={href}
          className="font-medium text-brand-700 underline decoration-brand-200 underline-offset-2 transition-colors hover:decoration-brand-500"
        >
          {label}
        </Link>
      ) : (
        <a
          key={`${keyPrefix}-l${i}`}
          href={href}
          className="font-medium text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500"
        >
          {label}
        </a>
      )
    );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(...renderBold(text.slice(last), `${keyPrefix}-end`));
  return nodes;
}

export function ContentBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (typeof b === "string") {
          return (
            <p key={i} className="text-[15px] leading-relaxed text-ink-600">
              {renderInline(b, `p${i}`)}
            </p>
          );
        }
        if ("list" in b) {
          return (
            <ul key={i} className="space-y-2.5">
              {b.list.map((li, j) => (
                <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-ink-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                  <span>{renderInline(li, `l${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if ("steps" in b) {
          return (
            <ol key={i} className="space-y-3">
              {b.steps.map((st, j) => (
                <li key={j} className="flex gap-3.5 text-[15px] leading-relaxed text-ink-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {j + 1}
                  </span>
                  <span>{renderInline(st, `s${i}-${j}`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        // note callout
        return (
          <div key={i} className="rounded-2xl border-l-4 border-brand-400 bg-brand-50/60 px-5 py-4">
            <p className="text-[15px] leading-relaxed text-ink-700">{renderInline(b.note, `n${i}`)}</p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumbs (+ BreadcrumbList JSON-LD).
// ---------------------------------------------------------------------------
export function Breadcrumbs({ items, dark = false }: { items: { name: string; path: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <JsonLd data={breadcrumbLd(items)} />
      <ol className={`flex flex-wrap items-center gap-1.5 text-xs ${dark ? "text-brand-100/60" : "text-ink-400"}`}>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={it.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span className={dark ? "text-brand-100/90" : "text-ink-600"} aria-current="page">
                  {it.name}
                </span>
              ) : (
                <>
                  <Link href={it.path} className={dark ? "hover:text-white" : "hover:text-brand-700"}>
                    {it.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Page hero — light or dark, with kicker/title/lede + optional actions.
// ---------------------------------------------------------------------------
export function PageHero({
  kicker,
  title,
  lede,
  dark = false,
  actions,
  breadcrumbs,
  align = "center",
  children,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  dark?: boolean;
  actions?: React.ReactNode;
  breadcrumbs?: { name: string; path: string }[];
  align?: "center" | "left";
  children?: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <section className={`relative overflow-hidden ${dark ? "hero-dark" : "border-b border-ink-200/60 bg-ink-50"}`}>
      {dark ? <div className="dotgrid-blue absolute inset-0" aria-hidden /> : null}
      <div className={`relative mx-auto max-w-4xl px-4 py-16 sm:py-20 ${centered ? "text-center" : ""}`}>
        {breadcrumbs ? (
          <div className={centered ? "flex justify-center" : ""}>
            <Breadcrumbs items={breadcrumbs} dark={dark} />
          </div>
        ) : null}
        {kicker ? (
          <p className={`kicker mb-3 text-[12px] ${dark ? "text-brand-300" : "text-brand-600"}`}>{kicker}</p>
        ) : null}
        <h1
          className={`text-4xl font-extrabold tracking-tight sm:text-5xl ${dark ? "text-white" : "text-ink-950"}`}
        >
          {title}
        </h1>
        {lede ? (
          <p
            className={`mt-4 text-lg leading-relaxed ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"} ${
              dark ? "text-brand-100/80" : "text-ink-500"
            }`}
          >
            {lede}
          </p>
        ) : null}
        {actions ? <div className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>{actions}</div> : null}
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// AEO answer block — a concise, quotable answer engines can extract.
// ---------------------------------------------------------------------------
export function AnswerBlock({ children, label = "The short answer" }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-600" strokeWidth={2.2} />
        <p className="kicker text-[11px] text-brand-600">{label}</p>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{children}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dark CTA band.
// ---------------------------------------------------------------------------
export function CtaBand({
  title,
  body,
  primary = { href: "/register", label: "Create a deal" },
  secondary,
}: {
  title: string;
  body?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="hero-dark relative overflow-hidden">
      <div className="dotgrid-blue absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
        {body ? <p className="mx-auto mt-4 max-w-xl text-brand-100/80">{body}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={primary.href} className={buttonClass("primary", "lg")}>
            {primary.label} <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className="inline-flex items-center rounded-2xl border border-white/20 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Related links grid.
// ---------------------------------------------------------------------------
export function RelatedGrid({
  title = "Keep exploring",
  items,
  bare = false,
}: {
  title?: string;
  items: { href: string; title: string; desc: string; eyebrow?: string; icon?: LucideIcon }[];
  /** Render just the card grid, without the section wrapper/background/heading. */
  bare?: boolean;
}) {
  if (!items.length) return null;
  const grid = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
              <Link
                key={it.href}
                href={it.href}
                className="group flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                {Icon ? (
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                ) : null}
                {it.eyebrow ? <p className="kicker text-[10px] text-brand-600">{it.eyebrow}</p> : null}
                <h3 className="mt-1 font-bold text-ink-900">{it.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">{it.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  Read more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                </span>
          </Link>
        );
      })}
    </div>
  );
  if (bare) return grid;
  return (
    <section className="border-t border-ink-200/60 bg-ink-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {title ? <h2 className="mb-8 text-2xl font-bold tracking-tight">{title}</h2> : null}
        {grid}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Prose section wrapper for article/pillar bodies with a section heading.
// ---------------------------------------------------------------------------
export function ContentSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold tracking-tight text-ink-900">{heading}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
