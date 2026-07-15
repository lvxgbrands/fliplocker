import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip, Timeline, CostBreakdown } from "@/components/deal-ui";
import { DealPhotos } from "@/components/deal-photos";
import { HubEvidence } from "@/components/hub-evidence";
import { ShipmentPanel } from "@/components/shipment-panel";
import { DevControls } from "@/components/dev-controls";
import { cardTitle } from "@/lib/deals";
import { acceptAndPayAction, declineAction, approveDealAction, reportIssueAction } from "../../actions";
import { ErrorNote, SuccessNote } from "@/components/form-ui";

export default async function BuyerDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    paid?: string;
    declined?: string;
    cancelled?: string;
    approved?: string;
    reported?: string;
  }>;
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
      inspection: true,
      shipments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!deal || deal.buyerId !== user.id) notFound();

  const canDecide = deal.status === "BUYER_NOTIFIED" || deal.status === "ACCEPTED";
  const inReview = deal.status === "DELIVERED_SIGNED";
  const showEvidence = deal.inspection && deal.inspection.result !== "PENDING";

  return (
    <div>
      <Link href="/buyer" className="text-sm text-ink-400 hover:text-ink-600">
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
                : notices.approved
                  ? "Thanks! You approved the card — the seller's payout has been released and the deal is complete."
                  : notices.reported
                    ? "Issue reported. FlipLocker will review it and follow up — funds remain held by the payment processor."
                    : undefined
        }
      />

      <div className="flex items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{cardTitle(deal)}</h1>
          <p className="text-sm text-ink-400 mt-1">
            {deal.shortCode} · sold by {deal.seller.name || deal.seller.email}
          </p>
        </div>
        <StatusChip status={deal.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <DealPhotos media={deal.media} deal={deal} />
          {showEvidence ? <HubEvidence media={deal.media} inspection={deal.inspection!} /> : null}

          <section className="rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Card details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Detail label="Sport" value={deal.sport} />
              <Detail label="Year" value={String(deal.cardYear)} />
              <Detail label="Player" value={deal.playerName} />
              <Detail label="Grading company" value={deal.gradingCompany} />
              <Detail label="Certificate #" value={deal.certNumber} />
            </dl>
            {deal.description ? (
              <p className="mt-3 pt-3 border-t border-ink-100 text-sm text-ink-600 whitespace-pre-wrap">
                {deal.description}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Deal timeline</h2>
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
                  className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-bold text-white hover:bg-brand-700 shadow-sm"
                >
                  Accept &amp; Pay with PayPal
                </button>
              </form>
              <form action={declineAction}>
                <input type="hidden" name="dealId" value={deal.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-ink-300 px-6 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
                >
                  Decline this deal
                </button>
              </form>
              <p className="text-xs text-ink-400 leading-relaxed">
                Your payment goes through PayPal checkout and is held securely by our payment
                processor — it is not released to the seller until the card passes hub inspection
                and is delivered to you with signature confirmation.
              </p>
            </div>
          ) : inReview ? (
            <section className="rounded-xl border border-brand-300 bg-brand-50 p-4 space-y-3">
              <p className="font-semibold text-brand-900">Delivered — review your card</p>
              <p className="text-xs text-brand-800">
                You have 48 hours to approve or report an issue. If the window passes with no
                report, the deal completes automatically and the seller is paid.
              </p>
              <form action={approveDealAction}>
                <input type="hidden" name="dealId" value={deal.id} />
                <button className="w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                  Approve &amp; release payment
                </button>
              </form>
              <details className="text-sm">
                <summary className="cursor-pointer text-rose-700 font-medium">Report an issue</summary>
                <form action={reportIssueAction} className="mt-2 space-y-2">
                  <input type="hidden" name="dealId" value={deal.id} />
                  <textarea
                    name="reason"
                    required
                    rows={3}
                    placeholder="Describe the issue…"
                    className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm"
                  />
                  <button className="w-full rounded-lg border border-rose-300 bg-white px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                    Submit issue report
                  </button>
                </form>
              </details>
            </section>
          ) : deal.status === "COMPLETE" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              ✔ Complete. Thanks for using FlipLocker.
            </div>
          ) : (
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Your payment is held securely by our payment processor. Follow every step on the
              timeline.
            </div>
          )}

          <ShipmentPanel shipments={deal.shipments} />
          <DevControls dealId={deal.id} status={deal.status} />
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-800">{value}</dd>
    </div>
  );
}
