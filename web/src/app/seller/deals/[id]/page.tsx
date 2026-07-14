import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip, Timeline, CostBreakdown } from "@/components/deal-ui";
import { DealPhotos } from "@/components/deal-photos";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { SuccessNote } from "@/components/form-ui";

export default async function SellerDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { created } = await searchParams;

  const deal = await db.deal.findUnique({
    where: { id },
    include: { media: true, events: { orderBy: { createdAt: "asc" } }, buyer: true },
  });
  if (!deal || deal.sellerId !== user.id) notFound();

  const shipNow = deal.status === "AWAITING_SELLER_SHIPMENT" || deal.status === "PAID";

  return (
    <div>
      <Link href="/seller" className="text-sm text-slate-400 hover:text-slate-600">
        ← Back to deals
      </Link>

      <SuccessNote
        message={
          created
            ? `Deal created — the buyer's invitation is on its way to ${deal.buyerEmail}.`
            : undefined
        }
      />

      {shipNow && (
        <div className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-4 py-4">
          <p className="font-semibold text-teal-900">
            📦 Payment received — ship now!
          </p>
          <p className="text-sm text-teal-800 mt-1">
            The buyer&apos;s payment is confirmed and held securely by our payment processor. Your
            prepaid Leg&nbsp;1 label to the FlipLocker hub is being prepared — a 72-hour ship window
            applies once it&apos;s issued.
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{cardTitle(deal)}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {deal.shortCode} · buyer {deal.buyerEmail}
            {deal.buyer ? " (joined)" : " (invited)"}
          </p>
        </div>
        <StatusChip status={deal.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <DealPhotos media={deal.media} />
          {deal.description ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Description</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{deal.description}</p>
            </section>
          ) : null}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Deal timeline</h2>
            <Timeline events={deal.events} />
          </section>
        </div>

        <aside className="space-y-4 h-fit lg:sticky lg:top-24">
          <CostBreakdown
            totalLabel="Your payout on completion"
            totalCents={deal.sellerPayoutCents}
            lines={[
              { label: "Agreed sale price", cents: deal.salePriceCents, emphasize: true },
              ...(deal.feeSellerCents > 0
                ? [{ label: "Your service fee share", cents: -deal.feeSellerCents }]
                : []),
            ]}
          />
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 space-y-1">
            <p>
              Buyer pays <strong>{formatCents(deal.buyerTotalCents)}</strong> (incl. their fee share,
              shipping &amp; coverage lines).
            </p>
            <p>
              Funds are held by our payment processor and released after hub verification and
              signature-confirmed delivery. FlipLocker receives only its service fee.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
