import Link from "next/link";

export function LockMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect x="4" y="13" width="24" height="15" rx="4" className="fill-teal-600" />
      <path
        d="M10 13v-3a6 6 0 1 1 12 0v3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-teal-600"
      />
      <path d="M13 20.5 15.2 23l4.3-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
      <LockMark />
      <span>
        Flip<span className="text-teal-600">Locker</span>
      </span>
    </Link>
  );
}
