import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Video, PenLine, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark } from "@/components/brand";
import { DealPhotos } from "@/components/deal-photos";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { ErrorNote, Field, SubmitButton } from "@/components/form-ui";
import { claimSignedInAction, claimWithNewAccountAction } from "../actions";
import { logoutAction } from "@/app/(auth)/actions";

const TRUST = [
  { icon: ShieldCheck, label: "Hub-documented" },
  { icon: Video, label: "Documented on video" },
  { icon: PenLine, label: "Signature delivery" },
  { icon: Lock, label: "Funds held by processor" },
];

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const deal = await db.deal.findUnique({
    where: { inviteToken: token },
    include: { seller: true, media: true },
  });

  const user = await getCurrentUser();
  if (deal?.buyerId && user?.id === deal.buyerId) redirect(`/buyer/deals/${deal.id}`);

  if (!deal) {
    return (
      <div className="min-h-screen bg-ink-50">
        <header className="mx-auto flex h-20 max-w-3xl items-center px-4">
          <Wordmark />
        </header>
        <main className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center shadow-soft">
            <h1 className="mb-2 text-xl font-bold">Invitation not found</h1>
            <p className="text-sm text-ink-500">
              This invitation link is invalid or has been withdrawn. Ask the seller to send a new one.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const sellerName = deal.seller.name || deal.seller.email;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Navy hero header */}
      <header className="hero-dark relative overflow-hidden">
        <div className="dotgrid-blue absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="flex h-20 items-center">
            <Wordmark dark />
          </div>
          <div className="pb-12 pt-6 text-center">
            <p className="kicker mb-3 text-[12px] text-brand-300">Private deal invitation</p>
            <h1 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {sellerName} sent you a documented card deal
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {TRUST.map((t) => (
                <span key={t.label} className="flex items-center gap-1.5 text-xs font-semibold text-brand-100/90">
                  <t.icon className="h-4 w-4 text-brand-300" strokeWidth={2.2} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-3xl px-4 pb-16">
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-lift">
            <div className="grid items-start gap-6 sm:grid-cols-[200px_1fr]">
              <div className="grid grid-cols-1">
                <DealPhotos media={deal.media} deal={deal} />
              </div>
              <div>
                <p className="kicker text-[11px] text-ink-400">{deal.shortCode}</p>
                <h2 className="mt-1 text-lg font-bold">{cardTitle(deal)}</h2>
                <p
                  className="mt-3 text-4xl font-extrabold tabular-nums text-brand-700"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatCents(deal.salePriceCents)}
                </p>
                <p className="kicker mt-1 text-[10px] text-ink-400">
                  Agreed sale price · full breakdown after you join
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-600">
                  Your payment is held securely by our payment processor while the card is inspected
                  and documented at the FlipLocker hub, then delivered to you with signature
                  confirmation.
                </p>
              </div>
            </div>
          </div>

          <ErrorNote message={error} />

          <div className="mx-auto w-full max-w-md rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
            {deal.buyerId && (!user || user.id !== deal.buyerId) ? (
              <p className="text-center text-sm text-ink-500">
                This invitation has already been claimed.{" "}
                <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                  Sign in
                </Link>{" "}
                to view your deal.
              </p>
            ) : user ? (
              user.email === deal.buyerEmail ? (
                <form action={claimSignedInAction} className="space-y-4 text-center">
                  <input type="hidden" name="token" value={token} />
                  <p className="text-sm text-ink-600">
                    Signed in as <strong>{user.email}</strong>, the invited buyer.
                  </p>
                  <SubmitButton>View &amp; review this deal</SubmitButton>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-ink-600">
                    This invitation was sent to <strong>{deal.buyerEmail}</strong>, but you&apos;re
                    signed in as <strong>{user.email}</strong>.
                  </p>
                  <form action={logoutAction}>
                    <button className="text-sm font-semibold text-brand-700 hover:underline" type="submit">
                      Sign out and claim with the invited email
                    </button>
                  </form>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <h3 className="text-center font-bold">Claim your invitation</h3>
                <form action={claimWithNewAccountAction} className="space-y-4">
                  <input type="hidden" name="token" value={token} />
                  <Field label="Email" name="emailShown" type="email" defaultValue={deal.buyerEmail} readOnly required={false} />
                  <Field label="Your name" name="name" placeholder="Blake Buyer" />
                  <Field label="Choose a password" name="password" type="password" hint="At least 8 characters" />
                  <SubmitButton>Create account &amp; review deal</SubmitButton>
                </form>
                <p className="text-center text-xs text-ink-400">
                  Already have a FlipLocker account with this email?{" "}
                  <Link
                    href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Sign in instead
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
