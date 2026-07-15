import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/* Shared primitives for the FlipLocker UI system. Server-component safe. */

const BUTTON_VARIANTS = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft hover:from-brand-600 hover:to-brand-700 hover:shadow-glow active:translate-y-px",
  secondary:
    "border border-ink-200 bg-white text-ink-800 shadow-soft hover:border-brand-300 hover:text-brand-700 active:translate-y-px",
  ghost: "text-ink-500 hover:text-ink-900 hover:bg-ink-100",
  danger:
    "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300 active:translate-y-px",
} as const;

const BUTTON_SIZES = {
  sm: "px-3.5 py-2 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-[15px] rounded-2xl gap-2.5",
} as const;

export function buttonClass(
  variant: keyof typeof BUTTON_VARIANTS = "primary",
  size: keyof typeof BUTTON_SIZES = "md",
  extra = ""
): string {
  return `inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${extra}`;
}

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-200/70 bg-white shadow-soft ${padded ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  icon: Icon,
  children,
  className = "",
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`flex items-center gap-2 text-[15px] font-bold text-ink-900 ${className}`}>
      {Icon ? (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
      ) : null}
      {children}
    </h2>
  );
}

export function Stat({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-soft ${
        accent
          ? "border-brand-200 bg-gradient-to-br from-brand-50 to-white"
          : "border-ink-200/70 bg-white"
      }`}
    >
      {Icon ? (
        <Icon
          className={`absolute -right-3 -bottom-3 h-16 w-16 ${accent ? "text-brand-100" : "text-ink-100"}`}
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
      <p
        className={`relative mt-1.5 text-[1.7rem] font-bold leading-none tabular-nums tracking-tight ${
          accent ? "text-brand-800" : "text-ink-950"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 px-8 py-14 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">{body}</p>
      {action ? (
        <Link href={action.href} className={buttonClass("primary", "md", "mt-6")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Standard text-input class shared by custom form elements. */
export const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 shadow-[inset_0_1px_2px_rgb(18_55_54/0.04)] transition-colors duration-150 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";
