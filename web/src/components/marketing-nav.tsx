"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { buttonClass } from "@/components/ui";
import { TOP_NAV, type TopNavItem, type NavLeaf } from "@/lib/nav";
import { ARTICLES } from "@/lib/insights";

// Latest few articles power the Insights mega-menu column.
const INSIGHTS_LATEST: NavLeaf[] = ARTICLES.slice(0, 4).map((a) => ({
  href: `/insights/${a.slug}`,
  label: a.title,
  desc: a.description,
  icon: BookOpen,
}));

// Leaf links are always rendered on the white mega panel: brand-blue heading,
// dark-grey description body — regardless of whether the nav itself is dark.
function LeafLink({ leaf, onClick }: { leaf: NavLeaf; onClick?: () => void }) {
  const Icon = leaf.icon;
  return (
    <Link
      href={leaf.href}
      onClick={onClick}
      className="group/leaf flex gap-3 rounded-xl p-3 transition-colors hover:bg-ink-50"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover/leaf:bg-brand-100">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-700">{leaf.label}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-ink-600">{leaf.desc}</span>
      </span>
    </Link>
  );
}

// The mega panel is always white/opaque. Its outer full-bleed bar (in
// MarketingNav) supplies the background, border, and shadow; this renders the
// constrained inner content: link columns on the left, a bright brand-blue
// featured callout on the right.
function MegaPanel({ item, onNavigate }: { item: TopNavItem; onNavigate: () => void }) {
  if (!item.mega) return null;
  const columns =
    item.label === "Insights"
      ? [{ heading: "Latest from the blog", links: INSIGHTS_LATEST }]
      : item.mega.columns;
  const colClass =
    columns.length >= 3 ? "sm:grid-cols-3" : columns.length === 2 ? "sm:grid-cols-2" : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* Left — section overview CTA + link columns. */}
      <div>
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-100"
        >
          {item.label} overview
          <ArrowRight className="h-3.5 w-3.5 text-brand-500" strokeWidth={2.5} />
        </Link>
        <div className={`mt-2 grid gap-x-4 ${colClass}`}>
          {columns.map((col) => (
            <div key={col.heading} className="min-w-0">
              <p className="kicker px-3 pb-1 pt-3 text-[10px] text-brand-600">{col.heading}</p>
              {col.links.map((leaf) => (
                <LeafLink key={leaf.href} leaf={leaf} onClick={onNavigate} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right — featured callout: light background, blue heading, grey body,
          with a bright brand-blue accent that stays even in dark-nav mode. */}
      <Link
        href={item.mega.featured.href}
        onClick={onNavigate}
        className="group/feat relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 transition-transform hover:-translate-y-0.5"
      >
        <div>
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-soft">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <p className="kicker text-[10px] text-brand-600">{item.mega.featured.eyebrow}</p>
          <p className="mt-2 text-base font-bold leading-snug text-brand-700">{item.mega.featured.title}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-600">{item.mega.featured.body}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          Learn more
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/feat:translate-x-0.5" strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  );
}

export function MarketingNav({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState<string | null>(null); // desktop mega open
  const [drawer, setDrawer] = useState(false); // mobile drawer
  const [acc, setAcc] = useState<string | null>(null); // mobile accordion
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close everything on route change.
  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname]);

  // Esc closes menus; lock scroll while the mobile drawer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const openNow = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  const activeMega = open ? TOP_NAV.find((i) => i.label === open && i.mega) : undefined;

  return (
    <>
    <header
      ref={navRef}
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        dark ? "border-white/10 bg-navy-950/70" : "border-ink-200/60 bg-white/85"
      }`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4">
        <Wordmark dark={dark} />

        {/* Desktop nav */}
        <nav className="hidden items-center lg:flex" aria-label="Primary">
          <ul className="flex items-center">
            {TOP_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const base = `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                dark
                  ? "text-brand-100/85 hover:bg-white/10 hover:text-white"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              } ${active ? (dark ? "text-white" : "text-ink-900") : ""}`;
              if (!item.mega) {
                return (
                  <li key={item.label}>
                    <Link href={item.href} className={base}>
                      {item.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li
                  key={item.label}
                  onMouseEnter={() => openNow(item.label)}
                  onMouseLeave={closeSoon}
                >
                  {/* The label navigates to the section overview; hover/focus opens the mega panel. */}
                  <Link
                    href={item.href}
                    aria-expanded={open === item.label}
                    aria-haspopup="true"
                    onFocus={() => openNow(item.label)}
                    onClick={() => setOpen(null)}
                    className={`inline-flex items-center gap-1 ${base}`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${open === item.label ? "rotate-180" : ""}`}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`hidden rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:block ${
              dark ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            Sign in
          </Link>
          {/* Wrapper owns the responsive visibility so buttonClass's own
              `inline-flex` can't override `hidden` and leak the CTA onto the
              cramped mobile header (the drawer already carries this action). */}
          <span className="hidden sm:inline-flex">
            <Link href="/register" className={buttonClass("primary", "md")}>
              Create a deal
            </Link>
          </span>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg lg:hidden ${
              dark ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mega panel — full-bleed, opaque white bar spanning the full viewport
          width under the nav; inner content is constrained to max-w-6xl. It
          stays white even when the nav itself is in dark mode. */}
      {activeMega ? (
        <div
          className="absolute inset-x-0 top-full z-40 hidden border-b border-ink-200/70 bg-white shadow-lift lg:block"
          onMouseEnter={() => openNow(activeMega.label)}
          onMouseLeave={closeSoon}
        >
          <div className="mx-auto max-w-6xl px-4 py-6">
            <MegaPanel item={activeMega} onNavigate={() => setOpen(null)} />
          </div>
        </div>
      ) : null}
    </header>

    {/* Mobile drawer — rendered OUTSIDE <header> so the header's backdrop-blur
        doesn't become the containing block for this position:fixed overlay
        (it must stay viewport-relative to fill the screen). */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] flex-col bg-white shadow-lift">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-ink-200/60 px-4">
              <Wordmark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile">
              <ul className="space-y-1">
                {TOP_NAV.map((item) => {
                  if (!item.mega) {
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setDrawer(false)}
                          className="block rounded-xl px-3 py-3 text-[15px] font-semibold text-ink-800 hover:bg-ink-50"
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                  const cols =
                    item.label === "Insights"
                      ? [{ heading: "Latest", links: INSIGHTS_LATEST }]
                      : item.mega.columns;
                  const isOpen = acc === item.label;
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setAcc(isOpen ? null : item.label)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold text-ink-800 hover:bg-ink-50"
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
                      </button>
                      {isOpen ? (
                        <div className="space-y-0.5 pb-2 pl-2">
                          <Link
                            href={item.href}
                            onClick={() => setDrawer(false)}
                            className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            {item.label} overview
                          </Link>
                          {cols.flatMap((c) => c.links).map((leaf) => (
                            <Link
                              key={leaf.href}
                              href={leaf.href}
                              onClick={() => setDrawer(false)}
                              className="block rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-50"
                            >
                              {leaf.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="shrink-0 space-y-2 border-t border-ink-200/60 p-4">
              <Link href="/register" onClick={() => setDrawer(false)} className={buttonClass("primary", "md", "w-full")}>
                Create a deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link href="/login" onClick={() => setDrawer(false)} className={buttonClass("secondary", "md", "w-full")}>
                I was invited
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
