import Link from "next/link";

/** FlipLocker logomark: rounded slab + lock shackle + check, on brand gradient. */
export function LockMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="flg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1ba397" />
          <stop offset="1" stopColor="#0f6a65" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="34" height="34" rx="10" fill="url(#flg)" />
      <path
        d="M14 19v-3.2a6 6 0 0 1 12 0V19"
        stroke="#aeeae0"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="11.5" y="18.5" width="17" height="12.5" rx="3.5" fill="#ffffff" fillOpacity="0.96" />
      <path
        d="m16.4 24.6 2.3 2.4 4.9-5.2"
        stroke="#0f6a65"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 font-bold text-[1.35rem] tracking-tight ${
        dark ? "text-white" : "text-ink-950"
      }`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      <LockMark className="h-8 w-8 transition-transform duration-300 group-hover:-rotate-6" />
      <span>
        Flip<span className={dark ? "text-brand-300" : "text-brand-600"}>Locker</span>
      </span>
    </Link>
  );
}
