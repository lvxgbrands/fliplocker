import Link from "next/link";

/**
 * FlipLocker shield mark — a bold-blue crest with an interlocked "F" + reversed
 * "L" monogram and an integrated check signifying the protected transaction.
 */
export function LockMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="fl-shield" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B75FF" />
          <stop offset="1" stopColor="#0757D6" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M9 8.5Q9 6 11.5 6L36.5 6Q39 6 39 8.5L39 25.5Q39 33.4 24 43Q9 33.4 9 25.5Z"
        fill="url(#fl-shield)"
      />
      {/* 2px white inner keyline */}
      <path
        d="M11.6 9Q11.6 8.6 12 8.6L36 8.6Q36.4 8.6 36.4 9L36.4 25.1Q36.4 31.8 24 40.1Q11.6 31.8 11.6 25.1Z"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="1.4"
        fill="none"
      />
      {/* Monogram: bold "F" (left) */}
      <g fill="#ffffff">
        <rect x="14.6" y="12.8" width="4.4" height="17.2" rx="0.6" />
        <rect x="14.6" y="12.8" width="11" height="4.2" rx="0.6" />
        <rect x="14.6" y="19.4" width="8.3" height="4" rx="0.6" />
      </g>
      {/* Reversed-L that sweeps into the check — the protected-transaction mark.
          Blue halo underneath separates it from the F where they meet. */}
      <path
        d="M25.6 12.8 L25.6 27 L22.4 30.6 L20.4 28.6"
        stroke="url(#fl-shield)"
        strokeWidth="6.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.6 12.8 L25.6 26.6 L22.6 30 L33.6 21.4"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
      <LockMark className="h-8 w-8 transition-transform duration-300 group-hover:-translate-y-0.5" />
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
