import { ShieldCheck } from "lucide-react";
import type { ShowcaseCard } from "@/lib/marketing";

// Barrel for shared marketing components. Nav and footer moved to dedicated
// files (the nav is a client mega-menu); re-exported here so existing imports
// keep working.
export { MarketingNav } from "@/components/marketing-nav";
export { MarketingFooter } from "@/components/marketing-footer";

// Section eyebrows have been removed site-wide (no small all-caps labels above
// headings). Kept as a no-op so existing call sites stay valid.
export function SectionKicker({ children }: { children: React.ReactNode }) {
  void children;
  return null;
}

/** Marketing product-showcase card, slab-framed roster card with price & stat. */
export function ShowcaseSlab({ card }: { card: ShowcaseCard }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-navy-900 to-navy-800 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide text-white">
          <ShieldCheck className="h-4 w-4 text-brand-400" strokeWidth={2.4} />
          {card.grade}
        </span>
        <span className="kicker text-[10px] text-brand-200">Inspected &amp; documented</span>
      </div>
      <div className="bg-ink-100 p-3">
        <div className="grid grid-cols-2 gap-2">
          {([["", "Front"], ["-back", "Back"]] as const).map(([face, label]) => (
            <figure key={label} className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/cards/${card.slug}${face}.jpg`}
                alt={`${card.player}, ${label.toLowerCase()} of the graded slab`}
                className="aspect-[3/4] w-full rounded-lg object-cover shadow-inner"
              />
              <figcaption className="mt-1.5 text-center text-[10px] font-medium text-ink-500">
                {label}
              </figcaption>
            </figure>
          ))}
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
          {["Documented", "Held", "Delivered"].map((s, i) => (
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
