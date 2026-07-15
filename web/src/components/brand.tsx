import Link from "next/link";

/**
 * FlipLocker shield mark, the official client-provided logo
 * (public/brand/fliplocker-logo.svg), a two-blue crest with an "F" + check.
 * Sizing is controlled by the passed className (e.g. h-8 w-8).
 */
export function LockMark({ className = "h-8 w-8" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/fliplocker-logo.svg" alt="" aria-hidden className={`${className} object-contain`} />;
}

/** Shield-only app/favicon usage. */
export function AppIcon({ className = "h-10 w-10" }: { className?: string }) {
  return <LockMark className={className} />;
}

export function Wordmark({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5"
      aria-label="FlipLocker home"
    >
      <LockMark className="h-16 w-16 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span
        className="text-[1.4rem] font-extrabold leading-none tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className={dark ? "text-white" : "text-ink-950"}>FLIP</span>
        <span className={dark ? "text-brand-400" : "text-brand-600"}>LOCKER</span>
      </span>
    </Link>
  );
}
