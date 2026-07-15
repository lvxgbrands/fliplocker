import Link from "next/link";
import { Wordmark } from "@/components/brand";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <Wordmark />
        <nav className="flex gap-4 text-sm text-ink-500">
          <Link href="/terms" className="hover:text-ink-900">Terms</Link>
          <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-slate prose-sm max-w-none">
        {children}
      </main>
    </div>
  );
}
