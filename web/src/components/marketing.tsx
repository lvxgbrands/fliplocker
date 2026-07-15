import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { buttonClass } from "@/components/ui";
import type { ShowcaseCard } from "@/lib/marketing";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export function MarketingNav({ dark = false }: { dark?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur-md ${
        dark ? "border-white/10 bg-navy-950/70" : "border-ink-200/50 bg-white/80"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Wordmark dark={dark} />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                dark ? "text-brand-100/80 hover:bg-white/10 hover:text-white" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`hidden rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors sm:block ${
              dark ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            Sign in
          </Link>
          <Link href="/register" className={buttonClass("primary", "md")}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-200/60 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Wordmark />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-500">
          <Link href="/how-it-works" className="hover:text-ink-900">How it works</Link>
          <Link href="/pricing" className="hover:text-ink-900">Pricing</Link>
          <Link href="/security" className="hover:text-ink-900">Security</Link>
          <Link href="/terms" className="hover:text-ink-900">Terms</Link>
          <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-xs leading-relaxed text-ink-400">
        FlipLocker is a verification, documentation, and logistics service for private, peer-to-peer
        deals — not a marketplace. Cards are verified and documented; FlipLocker does not grade
        cards. Buyer payments are held by our payment processor and released to the seller after
        signature-confirmed delivery.
      </div>
    </footer>
  );
}

export function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className="kicker mb-3 text-[12px] text-brand-600">{children}</p>;
}

/** Marketing product-showcase card — slab-framed roster card with price & stat. */
export function ShowcaseSlab({ card }: { card: ShowcaseCard }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-navy-900 to-navy-800 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide text-white">
          <ShieldCheck className="h-4 w-4 text-brand-400" strokeWidth={2.4} />
          {card.grade}
        </span>
        <span className="kicker text-[10px] text-brand-200">Verified &amp; documented</span>
      </div>
      <div className="bg-ink-100 p-3">
        <div className="overflow-hidden rounded-lg shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/cards/${card.slug}-front.png`}
            alt={`${card.player} — ${card.meta}`}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-bold text-ink-900">{card.player}</h3>
          <span
            className="text-lg font-extrabold tabular-nums text-brand-700"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {card.price}
          </span>
        </div>
        <p className="kicker mt-0.5 text-[10px] text-ink-400">{card.meta}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-500">{card.stat}</p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-ink-100 pt-3">
          {["Verified", "Held", "Delivered"].map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${i < 2 ? "bg-brand-500" : "bg-ink-300"}`} />
              <span className="kicker text-[9px] text-ink-400">{s}</span>
              {i < 2 ? <span className="h-px w-3 bg-ink-200" /> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
