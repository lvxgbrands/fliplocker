import Link from "next/link";
import { MarketingShell } from "@/components/marketing-ui";

const LEGAL_NAV = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingShell ticker={false}>
      <div className="border-b border-ink-200/60 bg-ink-50">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-2 px-4 py-5">
          {LEGAL_NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <article
        className="mx-auto max-w-3xl px-4 py-12
          [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-ink-950
          [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink-900
          [&_h3]:mt-6 [&_h3]:mb-1 [&_h3]:font-bold [&_h3]:text-ink-900
          [&_p]:mt-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-ink-600
          [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
          [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:text-ink-600
          [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:decoration-brand-200 [&_a:hover]:decoration-brand-500
          [&_strong]:font-semibold [&_strong]:text-ink-900"
      >
        {children}
      </article>
    </MarketingShell>
  );
}
