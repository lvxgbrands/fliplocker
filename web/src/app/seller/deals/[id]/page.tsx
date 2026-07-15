import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip, Timeline, CostBreakdown } from "@/components/deal-ui";
import { DealPhotos } from "@/components/deal-photos";
import { HubEvidence } from "@/components/hub-evidence";
import { ShipmentPanel, ShipDeadline } from "@/components/shipment-panel";
import { DevControls } from "@/components/dev-controls";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { getCheckoutConfig } from "@/lib/config";
import { SuccessNote, ErrorNote } from "@/components/form-ui";
import { generateLabelAction } from "../../actions";

export default async function SellerDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; labeled?: string; error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const notices = await searchParams;

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      media: true,
      events: { orderBy: { createdAt: "asc" } },
      buyer: true,
      shipments: { orderBy: { createdAt: "asc" } },
      inspection: true,
    },
  });
  if (!deal || deal.sellerId !== user.id) notFound();

  const config = await getCheckoutConfig();
  const leg1 = deal.shipments.find((s) => s.leg === "TO_HUB");
  const needsLabel = deal.status === "AWAITING_SELLER_SHIPMENT" && !leg1?.labelUrl;

  return (
    <div>
      <Link href="/seller" className="text-sm text-slate-400 hover:text-slate-600">
        ← Back to deals
      </Link>

      <SuccessNote
        message={
          notices.created
            ? `Deal created — the buyer's invitation is on its way to ${deal.buyerEmail}.`
            : notices.labeled
              ? "Label generated — print it and ship within the 72-hour window."
              : undefined
        }
      />
      <ErrorNote message={notices.error} />

      {needsLabel && (
        <div className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-4 py-4">
          <p className="font-semibold text-teal-900">📦 Payment received — ship now!</p>
          <p className="text-sm text-teal-800 mt-1 mb-3">
            The buyer&apos;s payment is confirmed and held securely by our payment processor.
            Accept the Terms of Service to generate your prepaid Leg&nbsp;1 label to the FlipLocker
            hub. A {config.shipTimerHours}-hour ship window applies once it&apos;s issued.
          </p>
          <form action={generateLabelAction} className="space-y-3">
            <input type="hidden" name="dealId" value={deal.id} />
            <label className="flex items-start gap-2 text-sm text-teal-900">
              <input type="checkbox" name="tos" className="mt-0.5" required />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="underline font-semibold">
                  Terms of Service
                </Link>{" "}
                and understand FlipLocker verifies and documents the card (it does not grade it).
              </span>
            </label>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Accept &amp; generate shipping label
            </button>
          </form>
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
          {deal.inspection?.result === "PASS" ? <HubEvidence media={deal.media} inspection={deal.inspection} /> : null}
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
          {leg1?.labelUrl && deal.status === "AWAITING_SELLER_SHIPMENT" ? (
            <ShipDeadline deadline={deal.shipDeadlineAt} chargeCents={leg1.labelChargeCents} />
          ) : null}
          <ShipmentPanel shipments={deal.shipments} />
          <DevControls dealId={deal.id} status={deal.status} />
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
