import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip, Timeline, CostBreakdown } from "@/components/deal-ui";
import { DealPhotos } from "@/components/deal-photos";
import { cardTitle } from "@/lib/deals";
import { acceptAndPayAction, declineAction } from "../../actions";
import { ErrorNote, SuccessNote } from "@/components/form-ui";

export default async function BuyerDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; paid?: string; declined?: string; cancelled?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const notices = await searchParams;

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      media: true,
      seller: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!deal || deal.buyerId !== user.id) notFound();

  const canDecide = deal.status === "BUYER_NOTIFIED" || deal.status === "ACCEPTED";
  const isPaid = ["PAID", "AWAITING_SELLER_SHIPMENT"].includes(deal.status);

  return (
    <div>
      <Link href="/buyer" className="text-sm text-slate-400 hover:text-slate-600">
        ← Back to deals
      </Link>

      <ErrorNote message={notices.error} />
      <SuccessNote
        message={
          notices.paid
            ? "Payment confirmed! It's held securely by our payment processor until your card is verified and delivered."
            : notices.declined
              ? "You declined this deal. The seller has been notified — no payment was collected."
              : notices.cancelled
                ? "Checkout was cancelled — no payment was collected. You can accept and pay whenever you're ready."
                : undefined
        }
      />

      <div className="flex items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{cardTitle(deal)}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {deal.shortCode} · sold by {deal.seller.name || deal.seller.email}
          </p>
        </div>
        <StatusChip status={deal.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <DealPhotos media={deal.media} />

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Card details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Detail label="Sport" value={deal.sport} />
              <Detail label="Year" value={String(deal.cardYear)} />
              <Detail label="Player" value={deal.playerName} />
              <Detail label="Grading company" value={deal.gradingCompany} />
              <Detail label="Certificate #" value={deal.certNumber} />
            </dl>
            {deal.description ? (
              <p className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 whitespace-pre-wrap">
                {deal.description}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Deal timeline</h2>
            <Timeline events={deal.events} />
          </section>
        </div>

        <aside className="space-y-4 h-fit lg:sticky lg:top-24">
          <CostBreakdown
            totalLabel="Total"
            totalCents={deal.buyerTotalCents}
            lines={[
              {
                label: "Card (peer-to-peer amount)",
                cents: deal.salePriceCents,
                hint: "Paid to the seller, held by our payment processor until delivery",
                emphasize: true,
              },
              ...(deal.feeBuyerCents > 0
                ? [{ label: "FlipLocker service fee", cents: deal.feeBuyerCents, hint: "Verification, documentation & logistics" }]
                : []),
              { label: "Outbound shipping & signature", cents: deal.shippingCents },
              ...(deal.insuranceCents > 0
                ? [{ label: "Declared-value coverage", cents: deal.insuranceCents, hint: "Carrier coverage pass-through" }]
                : []),
              ...(deal.taxCents > 0 ? [{ label: "Tax", cents: deal.taxCents }] : []),
            ]}
          />

          {canDecide ? (
            <div className="space-y-3">
              <form action={acceptAndPayAction}>
                <input type="hidden" name="dealId" value={deal.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 px-6 py-3.5 text-base font-bold text-white hover:bg-teal-700 shadow-sm"
                >
                  Accept &amp; Pay with PayPal
                </button>
              </form>
              <form action={declineAction}>
                <input type="hidden" name="dealId" value={deal.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Decline this deal
                </button>
              </form>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your payment goes through PayPal checkout and is held securely by our payment
                processor — it is not released to the seller until the card passes hub inspection
                and is delivered to you with signature confirmation.
              </p>
            </div>
          ) : isPaid ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              ✔ Paid. The seller has been alerted to ship your card to the FlipLocker hub — follow
              every step on the timeline.
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
