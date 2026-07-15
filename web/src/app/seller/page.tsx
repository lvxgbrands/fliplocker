import Link from "next/link";
import { PackageOpen, Plus, Wallet, ArrowUpRight, Layers, PackageCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/deal-ui";
import { VerifyEmailBanner } from "@/components/shell";
import { buttonClass, EmptyState, Stat } from "@/components/ui";
import { formatCents } from "@/lib/fees";
import { cardTitle } from "@/lib/deals";
import { DealThumb } from "@/components/deal-photos";
import { SuccessNote } from "@/components/form-ui";

const ACTIVE_STATUSES = [
  "CREATED", "BUYER_NOTIFIED", "ACCEPTED", "PAID", "AWAITING_SELLER_SHIPMENT",
  "IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED",
  "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED",
] as const;

export default async function SellerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ verification_sent?: string; documented?: string; welcome?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const deals = await db.deal.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { media: { where: { kind: { in: ["FRONT_PHOTO", "REAR_PHOTO"] } } } },
  });

  const shipNow = deals.filter((d) => d.status === "AWAITING_SELLER_SHIPMENT" || d.status === "PAID");
  const active = deals.filter((d) => (ACTIVE_STATUSES as readonly string[]).includes(d.status));
  const completed = deals.filter((d) => d.status === "COMPLETE");
  const earnedCents = completed.reduce((sum, d) => sum + d.sellerPayoutCents, 0);

  return (
    <div>
      <VerifyEmailBanner user={user} />
      <SuccessNote
        message={
          params.documented
            ? "Email confirmed, you're all set."
            : params.verification_sent
              ? "Confirmation email sent, check your inbox."
              : params.welcome
                ? user.emailVerified
                  ? "Welcome to FlipLocker! Your account is ready."
                  : "Welcome to FlipLocker! We sent a confirmation link to your email."
                : undefined
        }
      />

      {shipNow.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-brand-300/70 bg-gradient-to-r from-brand-50 via-brand-50 to-white shadow-soft">
          <div className="flex items-start gap-3.5 px-5 py-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft">
              <PackageCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-bold text-brand-900">
                Payment received on {shipNow.length === 1 ? "a deal" : `${shipNow.length} deals`}, time to ship!
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-brand-800">
                {shipNow.map((d) => (
                  <li key={d.id}>
                    <Link
                      className="inline-flex items-center gap-1 font-semibold underline decoration-brand-300 underline-offset-2 hover:decoration-brand-500"
                      href={`/seller/deals/${d.id}`}
                    >
                      {d.shortCode}, {cardTitle(d)}
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {deals.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Active deals" value={String(active.length)} icon={Layers} />
          <Stat label="Completed" value={String(completed.length)} icon={PackageCheck} />
          <Stat label="Earned payouts" value={formatCents(earnedCents)} icon={Wallet} accent />
        </div>
      )}

      <div className="mb-5 mt-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your deals</h1>
        <Link href="/seller/deals/new" className={buttonClass("primary", "md")}>
          <Plus className="h-4 w-4" strokeWidth={2.5} /> Create deal
        </Link>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No deals yet"
          body="Agreed a price with a buyer? Lock it in, we'll handle payment, documentation, and delivery."
          action={{ label: "Create your first deal", href: "/seller/deals/new" }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft">
          <div className="divide-y divide-ink-100">
            {deals.map((d) => (
              <Link
                key={d.id}
                href={`/seller/deals/${d.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-brand-50/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <DealThumb media={d.media} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900 group-hover:text-brand-800">
                      {cardTitle(d)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      <span className="font-mono">{d.shortCode}</span> · buyer {d.buyerEmail} ·{" "}
                      {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink-900">
                    {formatCents(d.salePriceCents)}
                  </span>
                  <StatusChip status={d.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
