import { JsonLd } from "@/components/json-ld";
import { faqPageLd } from "@/lib/seo";
import type { QA } from "@/lib/faqs";

// Shared FAQ block used on every marketing page. Renders native <details>
// accordions and emits FAQPage JSON-LD from the same data.
export function FaqSection({
  items,
  title = "Frequently asked questions",
  intro,
  id = "faq",
  className = "",
  emitJsonLd = true,
}: {
  items: QA[];
  title?: string;
  kicker?: string;
  intro?: string;
  id?: string;
  className?: string;
  emitJsonLd?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section id={id} className={`mx-auto max-w-3xl px-4 py-20 ${className}`} aria-labelledby={`${id}-title`}>
      {emitJsonLd ? <JsonLd data={faqPageLd(items)} /> : null}
      <div className="mb-10 text-center">
        <h2 id={`${id}-title`} className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {intro ? <p className="mx-auto mt-3 max-w-xl text-ink-500">{intro}</p> : null}
      </div>
      <div className="space-y-3">
        {items.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-ink-200/70 bg-white px-5 py-4 shadow-soft [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
              {f.q}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-400 transition-transform duration-200 group-open:rotate-45">
                <span className="text-lg leading-none">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
