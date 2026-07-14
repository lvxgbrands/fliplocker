import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/deal-ui";
import { VerifyEmailBanner } from "@/components/shell";
import { formatCents } from "@/lib/fees";
import { cardTitle } from "@/lib/deals";
import { SuccessNote } from "@/components/form-ui";

export default async function SellerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ verification_sent?: string; verified?: string; welcome?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const deals = await db.deal.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const shipNow = deals.filter((d) => d.status === "AWAITING_SELLER_SHIPMENT" || d.status === "PAID");

  return (
    <div>
      <VerifyEmailBanner user={user} />
      <SuccessNote
        message={
          params.verified
            ? "Email verified — you're all set."
            : params.verification_sent
              ? "Verification email sent — check your inbox."
              : params.welcome
                ? "Welcome to FlipLocker! We sent a verification link to your email."
                : undefined
        }
      />

      {shipNow.length > 0 && (
        <div className="mt-4 mb-2 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3">
          <p className="text-sm font-semibold text-teal-900">
            📦 Payment received on {shipNow.length === 1 ? "a deal" : `${shipNow.length} deals`} — time to ship!
          </p>
          <ul className="mt-1 text-sm text-teal-800">
            {shipNow.map((d) => (
              <li key={d.id}>
                <Link className="underline font-medium" href={`/seller/deals/${d.id}`}>
                  {d.shortCode} — {cardTitle(d)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mt-6 mb-4">
        <h1 className="text-2xl font-bold">Your deals</h1>
        <Link
          href="/seller/deals/new"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + Create deal
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500 mb-4">
            No deals yet. Agreed a price with a buyer? Lock it in.
          </p>
          <Link
            href="/seller/deals/new"
            className="inline-block rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Create your first deal
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {deals.map((d) => (
            <Link
              key={d.id}
              href={`/seller/deals/${d.id}`}
              className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-slate-50 first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{cardTitle(d)}</p>
                <p className="text-xs text-slate-400">
                  {d.shortCode} · buyer {d.buyerEmail} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold tabular-nums">{formatCents(d.salePriceCents)}</span>
                <StatusChip status={d.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
