import { Wordmark } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-teal-50/70 to-slate-50">
      <div className="mb-8">
        <Wordmark />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {children}
      </div>
      <p className="mt-6 text-xs text-slate-400 max-w-md text-center">
        Private &amp; invitation-only. Buyer payments are held securely by our payment processor.
      </p>
    </div>
  );
}
