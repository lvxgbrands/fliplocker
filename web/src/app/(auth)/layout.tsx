import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="dotgrid absolute inset-0" aria-hidden />
      <div className="relative mb-8">
        <Wordmark />
      </div>
      <div className="rise relative w-full max-w-md rounded-3xl border border-ink-200/60 bg-white/95 p-8 shadow-lift backdrop-blur">
        {children}
      </div>
      <p className="relative mt-6 flex max-w-md items-center gap-2 text-center text-xs text-ink-400">
        <ShieldCheck className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} aria-hidden />
        Private &amp; invitation-only. Buyer payments are held securely by our payment processor.
      </p>
      <div className="relative mt-4 flex gap-5 text-xs font-medium text-ink-400">
        <Link href="/terms" className="hover:text-ink-700">Terms</Link>
        <Link href="/privacy" className="hover:text-ink-700">Privacy</Link>
      </div>
    </div>
  );
}
