import Link from "next/link";
import { Camera, AtSign, Mail } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { NewsletterForm } from "@/components/newsletter";
import { FOOTER_COLUMNS } from "@/lib/nav";

// Legal links required in the footer copyright row.
const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              The safe way to close the graded-card deal you made on social. Held payment,
              hub documentation, insured signature delivery — invitation-only.
            </p>
            <p className="kicker mt-6 text-[11px] text-ink-400">Get the FlipLocker newsletter</p>
            <div className="mt-2">
              <NewsletterForm source="footer" />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://instagram.com/fliplocker"
                aria-label="FlipLocker on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                <Camera className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/fliplocker"
                aria-label="FlipLocker on X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="mailto:support@fliplocker.app"
                aria-label="Email FlipLocker support"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <p className="kicker text-[11px] text-ink-400">{col.heading}</p>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-sm text-ink-600 transition-colors hover:text-brand-700">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Compliance blurb */}
        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-ink-400">
          FlipLocker is a documentation and logistics service for private, peer-to-peer deals — not a
          marketplace. Cards are documented; FlipLocker does not grade cards or guarantee a slab is
          genuine. Buyer payments are held by our payment processor and released to the seller after
          signature-confirmed delivery. Baseball cards only, for now.
        </p>

        {/* Copyright + legal */}
        <div className="mt-8 flex flex-col gap-4 border-t border-ink-200/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">© {year} FlipLocker. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs font-medium text-ink-500 hover:text-ink-900">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
