import { ExternalLink } from "lucide-react";
import { getNewsHeadlines, type Headline } from "@/lib/news";

// Dark marquee of REAL card-market headlines. Scrolls right-to-left, fades in
// from the right edge and out at the left (edge mask), pauses on hover, and
// respects prefers-reduced-motion (animation is gated in globals.css).

function Highlighted({ title, highlight }: { title: string; highlight: string }) {
  const idx = highlight ? title.indexOf(highlight) : -1;
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="font-bold text-brand-400">{highlight}</span>
      {title.slice(idx + highlight.length)}
    </>
  );
}

function TickerItem({ h, hidden }: { h: Headline; hidden?: boolean }) {
  return (
    <a
      href={h.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className="group inline-flex items-center gap-2.5 text-sm text-white/90 transition-colors hover:text-white"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500/70" aria-hidden />
      <span>
        <Highlighted title={h.title} highlight={h.highlight} />
      </span>
      <span className="hidden text-[11px] font-medium text-brand-200/50 sm:inline">{h.source}</span>
      <ExternalLink className="h-3 w-3 shrink-0 text-brand-200/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
    </a>
  );
}

export async function NewsTicker() {
  const { items } = await getNewsHeadlines(12);
  if (!items.length) return null;

  return (
    <section className="news-ticker relative z-50 overflow-hidden border-b border-white/10 bg-navy-950 py-3.5" aria-label="Sports-card market news">
      <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center pl-4 pr-3">
        <span className="kicker hidden rounded-full border border-white/10 bg-navy-950 px-2.5 py-1 text-[10px] text-brand-300 md:inline">
          Card market
        </span>
      </div>
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <div className="ticker-track ticker-slow flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
          {items.map((h, i) => (
            <TickerItem key={`a-${i}`} h={h} />
          ))}
          {items.map((h, i) => (
            <TickerItem key={`b-${i}`} h={h} hidden />
          ))}
        </div>
      </div>
    </section>
  );
}
