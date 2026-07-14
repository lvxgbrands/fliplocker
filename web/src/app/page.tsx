import Link from "next/link";
import { Wordmark, LockMark } from "@/components/brand";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const STEPS = [
  {
    title: "Agree your deal anywhere",
    body: "You and your buyer settle on the card and price off-platform — social media, a show, a group chat. FlipLocker is invitation-only: no listings, no browsing.",
  },
  {
    title: "Create the deal, invite the buyer",
    body: "The seller enters the card details, photos, and agreed price. The buyer gets a private email invitation to review and accept.",
  },
  {
    title: "Payment held by our processor",
    body: "The buyer pays through PayPal checkout. Funds are held securely by our payment processor — never by FlipLocker — until the deal completes.",
  },
  {
    title: "Verified, documented, delivered",
    body: "The card ships to the FlipLocker hub, is inspected and documented on video, then delivered to the buyer with signature confirmation before the seller is paid.",
  },
];

export default async function Landing() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="bg-gradient-to-b from-teal-50/70 to-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-medium text-teal-700 mb-6">
            <LockMark className="h-4 w-4" /> Private &amp; invitation-only
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto">
            Close card deals you made anywhere —{" "}
            <span className="text-teal-600">verified, documented, protected.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            FlipLocker handles the payment, hub inspection, and insured signature delivery for
            peer-to-peer graded card deals. The buyer&apos;s money is held securely by our payment
            processor until the card is verified and delivered.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm"
            >
              Create a deal
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              I was invited
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How a FlipLocker deal works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 p-5 bg-white">
              <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 text-xs text-slate-400">
          FlipLocker is a verification, documentation, and logistics service for private
          peer-to-peer deals. Cards are verified and documented — FlipLocker does not grade cards.
          Buyer payments are held by our payment processor and released to the seller after
          signature-confirmed delivery.
        </div>
      </footer>
    </div>
  );
}
