"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { buttonClass } from "@/components/ui";
import {
  PACKAGES,
  ANNUAL_SAVINGS,
  effectiveMonthly,
  annualTotal,
  formatUsd,
  type Billing,
} from "@/lib/pricing";

export function PricingCards() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-ink-200 bg-white p-1 shadow-soft"
        >
          {(["monthly", "annual"] as Billing[]).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                billing === b ? "bg-brand-600 text-white shadow-soft" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {b === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-win-600">
          <Sparkles className="h-4 w-4" strokeWidth={2.2} />
          Save {Math.round(ANNUAL_SAVINGS * 100)}% with annual billing
        </p>
      </div>

      {/* Package cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((pkg) => {
          const dark = Boolean(pkg.popular);
          const free = pkg.priceMonthly === 0;
          const perMo = effectiveMonthly(pkg, billing);
          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl border p-8 shadow-soft ${
                dark ? "hero-dark border-navy-800 text-white shadow-lift lg:-mt-2 lg:mb-2" : "border-ink-200/70 bg-white"
              }`}
            >
              {dark ? <div className="dotgrid-blue absolute inset-0" aria-hidden /> : null}
              {pkg.popular ? (
                <span className="absolute right-5 top-5 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <div className="relative flex flex-1 flex-col">
                <p className={`kicker text-[12px] ${dark ? "text-brand-300" : "text-brand-600"}`}>{pkg.name}</p>
                <p className={`mt-1 text-sm ${dark ? "text-brand-100/70" : "text-ink-500"}`}>{pkg.tagline}</p>

                <div className="mt-5 flex items-end gap-1.5">
                  <span
                    className={`text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-ink-950"}`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {free ? "$0" : `${formatUsd(perMo)}`}
                  </span>
                  {!free ? (
                    <span className={`pb-1 text-sm font-semibold ${dark ? "text-brand-100/70" : "text-ink-400"}`}>/mo</span>
                  ) : (
                    <span className={`pb-1 text-sm font-semibold ${dark ? "text-brand-100/70" : "text-ink-400"}`}>
                      pay per deal
                    </span>
                  )}
                </div>
                <p className={`mt-1 h-5 text-xs ${dark ? "text-brand-100/60" : "text-ink-400"}`}>
                  {free
                    ? "No subscription, only the per-deal fee"
                    : billing === "annual"
                      ? `${formatUsd(annualTotal(pkg))} billed yearly`
                      : `${formatUsd(pkg.priceMonthly * 12)} billed yearly`}
                </p>

                <p className={`mt-5 text-sm leading-relaxed ${dark ? "text-brand-100/85" : "text-ink-600"}`}>{pkg.who}</p>

                <Link
                  href={pkg.ctaHref}
                  className={buttonClass(dark ? "primary" : "secondary", "md", "mt-6 w-full")}
                >
                  {pkg.ctaLabel} <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>

                <div className={`mt-6 border-t pt-5 ${dark ? "border-white/10" : "border-ink-100"}`}>
                  <p className={`text-xs font-semibold ${dark ? "text-brand-200" : "text-ink-500"}`}>{pkg.perDeal}</p>
                  <ul className="mt-4 space-y-2.5">
                    {pkg.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${dark ? "text-brand-100/85" : "text-ink-600"}`}>
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-brand-300" : "text-brand-600"}`} strokeWidth={2.6} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
