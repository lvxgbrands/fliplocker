import Link from "next/link";
import {
  MessageSquareText,
  FilePlus2,
  ShieldCheck,
  Video,
  PenLine,
  Lock,
  ArrowRight,
  BadgeCheck,
  Landmark,
  PackageCheck,
} from "lucide-react";
import { Wordmark, LockMark } from "@/components/brand";
import { buttonClass } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Agree your deal anywhere",
    body: "You and your buyer settle on the card and price off-platform — social media, a show, a group chat. FlipLocker is invitation-only: no listings, no browsing.",
  },
  {
    icon: FilePlus2,
    title: "Create the deal, invite the buyer",
    body: "The seller enters the card details, photos, and agreed price. The buyer gets a private email invitation to review and accept.",
  },
  {
    icon: Lock,
    title: "Payment held by our processor",
    body: "The buyer pays through PayPal checkout. Funds are held securely by our payment processor — never by FlipLocker — until the deal completes.",
  },
  {
    icon: Video,
    title: "Verified, documented, delivered",
    body: "The card ships to the FlipLocker hub, is inspected and documented on video, then delivered to the buyer with signature confirmation before the seller is paid.",
  },
];

const ASSURANCES = [
  { icon: BadgeCheck, label: "Hub-verified & documented on video" },
  { icon: Landmark, label: "Funds held by our payment processor" },
  { icon: PenLine, label: "Signature delivery — never waived" },
  { icon: PackageCheck, label: "Tamper-sealed & insured in transit" },
];

export default async function Landing() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-ink-200/40 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Wordmark />
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              Sign in
            </Link>
            <Link href="/register" className={buttonClass("primary", "md")}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative mesh overflow-hidden">
        <div className="dotgrid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:pt-28">
          <p className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700 shadow-soft backdrop-blur">
            <LockMark className="h-4 w-4" /> PRIVATE &amp; INVITATION-ONLY
          </p>
          <h1 className="mx-auto max-w-4xl text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-ink-950 sm:text-6xl">
            Close card deals you made anywhere —{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 bg-clip-text text-transparent">
              verified, documented, protected.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
            FlipLocker handles the payment, hub inspection, and insured signature delivery for
            peer-to-peer graded card deals. The buyer&apos;s money is held securely by our payment
            processor until the card is verified and delivered.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className={buttonClass("primary", "lg")}>
              Create a deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <Link href="/login" className={buttonClass("secondary", "lg")}>
              I was invited
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {ASSURANCES.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-2.5 rounded-xl border border-ink-200/60 bg-white/80 px-3.5 py-3 text-left shadow-soft backdrop-blur"
              >
                <a.icon className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={2} />
                <span className="text-xs font-semibold leading-snug text-ink-700">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            One deal, four safe steps
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span
                  className="text-4xl font-extrabold text-ink-100"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mb-2 font-bold text-ink-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-200/60 bg-gradient-to-b from-ink-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <ShieldCheck className="mx-auto mb-5 h-10 w-10 text-brand-500" strokeWidth={1.8} />
          <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
            The handshake happened on social. The protection happens here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-500">
            Every card passes through the FlipLocker hub — inspected, documented on video, tamper
            sealed, and delivered with a signature before a single dollar reaches the seller.
          </p>
          <Link href="/register" className={buttonClass("primary", "lg", "mt-8")}>
            Start your first deal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-200/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark />
          <div className="flex gap-6 text-sm font-medium text-ink-500">
            <Link href="/terms" className="hover:text-ink-900">Terms</Link>
            <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-10 text-xs leading-relaxed text-ink-400">
          FlipLocker is a verification, documentation, and logistics service for private
          peer-to-peer deals. Cards are verified and documented — FlipLocker does not grade cards.
          Buyer payments are held by our payment processor and released to the seller after
          signature-confirmed delivery.
        </div>
      </footer>
    </div>
  );
}
