import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark } from "@/components/brand";
import { DealPhotos } from "@/components/deal-photos";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { ErrorNote, Field, SubmitButton } from "@/components/form-ui";
import { claimSignedInAction, claimWithNewAccountAction } from "../actions";
import { logoutAction } from "@/app/(auth)/actions";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 to-slate-50">
      <header className="max-w-3xl mx-auto px-4 h-16 flex items-center">
        <Wordmark />
      </header>
      <main className="max-w-3xl mx-auto px-4 pb-16">
        {!deal ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h1 className="text-xl font-bold mb-2">Invitation not found</h1>
            <p className="text-sm text-slate-500">
              This invitation link is invalid or has been withdrawn. Ask the seller to send a new one.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm font-medium text-teal-700 mb-1">Private deal invitation</p>
              <h1 className="text-2xl font-bold">
                {deal.seller.name || deal.seller.email} invited you to a verified card deal
              </h1>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-start">
                <DealPhotos media={deal.media} />
                <div>
                  <p className="text-xs text-slate-400">{deal.shortCode}</p>
                  <h2 className="text-lg font-bold">{cardTitle(deal)}</h2>
                  <p className="mt-2 text-3xl font-extrabold text-teal-700 tabular-nums">
                    {formatCents(deal.salePriceCents)}
                  </p>
                  <p className="text-xs text-slate-400">agreed sale price · full cost breakdown after you join</p>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    Your payment is held securely by our payment processor while the card is
                    inspected and documented at the FlipLocker hub, then delivered to you with
                    signature confirmation.
                  </p>
                </div>
              </div>
            </div>

            <ErrorNote message={error} />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 max-w-md mx-auto w-full">
              {deal.buyerId && (!user || user.id !== deal.buyerId) ? (
                <p className="text-sm text-slate-500 text-center">
                  This invitation has already been claimed.{" "}
                  <Link href="/login" className="font-semibold text-teal-700 hover:underline">
                    Sign in
                  </Link>{" "}
                  to view your deal.
                </p>
              ) : user ? (
                user.email === deal.buyerEmail ? (
                  <form action={claimSignedInAction} className="space-y-4 text-center">
                    <input type="hidden" name="token" value={token} />
                    <p className="text-sm text-slate-600">
                      Signed in as <strong>{user.email}</strong> — the invited buyer.
                    </p>
                    <SubmitButton>View &amp; review this deal</SubmitButton>
                  </form>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-slate-600">
                      This invitation was sent to <strong>{deal.buyerEmail}</strong>, but you&apos;re
                      signed in as <strong>{user.email}</strong>.
                    </p>
                    <form action={logoutAction}>
                      <button className="text-sm font-semibold text-teal-700 hover:underline" type="submit">
                        Sign out and claim with the invited email
                      </button>
                    </form>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">Claim your invitation</h3>
                  <form action={claimWithNewAccountAction} className="space-y-4">
                    <input type="hidden" name="token" value={token} />
                    <Field label="Email" name="emailShown" type="email" defaultValue={deal.buyerEmail} readOnly required={false} />
                    <Field label="Your name" name="name" placeholder="Blake Buyer" />
                    <Field label="Choose a password" name="password" type="password" hint="At least 8 characters" />
                    <SubmitButton>Create account &amp; review deal</SubmitButton>
                  </form>
                  <p className="text-xs text-slate-400 text-center">
                    Already have a FlipLocker account with this email?{" "}
                    <Link
                      href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
                      className="font-semibold text-teal-700 hover:underline"
                    >
                      Sign in instead
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
