import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheck } from "lucide-react";
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
      <Link href="/seller" className="text-sm text-ink-400 hover:text-ink-600">
        ← Back to deals
      </Link>

      <SuccessNote
        message={
          notices.created
            ? `Deal created, the buyer's invitation is on its way to ${deal.buyerEmail}.`
            : notices.labeled
              ? "Label generated, print it and ship within the 72-hour window."
              : undefined
        }
      />
      <ErrorNote message={notices.error} />

      {needsLabel && (
        <div className="hero-dark relative mt-4 overflow-hidden rounded-2xl p-5 shadow-lift">
          <div className="dotgrid-blue absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-glow">
                <PackageCheck className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div>
                <p className="kicker text-[11px] text-brand-300">Payment cleared</p>
                <p className="text-lg font-extrabold text-white">Payment received, ship now!</p>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100/85">
              The buyer&apos;s payment is confirmed and held securely by our payment processor.
              Accept the Terms of Service to generate your prepaid Leg&nbsp;1 label to the FlipLocker
              hub. A {config.shipTimerHours}-hour ship window applies once it&apos;s issued.
            </p>
            <form action={generateLabelAction} className="mt-4 space-y-3">
              <input type="hidden" name="dealId" value={deal.id} />
              <label className="flex items-start gap-2 text-sm text-brand-100/90">
                <input type="checkbox" name="tos" className="mt-0.5 accent-brand-500" required />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="font-semibold text-white underline">
                    Terms of Service
                  </Link>{" "}
                  and understand FlipLocker documents the card (it does not grade it).
                </span>
              </label>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:from-brand-500 hover:to-brand-700 hover:shadow-glow active:translate-y-px"
              >
                Accept &amp; generate shipping label
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{cardTitle(deal)}</h1>
          <p className="text-sm text-ink-400 mt-1 break-words">
            {deal.shortCode} · buyer {deal.buyerEmail}
            {deal.buyer ? " (joined)" : " (invited)"}
          </p>
        </div>
        <StatusChip status={deal.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <DealPhotos media={deal.media} deal={deal} />
          {deal.inspection?.result === "PASS" ? <HubEvidence media={deal.media} inspection={deal.inspection} /> : null}
          {deal.description ? (
            <section className="rounded-xl border border-ink-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-ink-900 mb-1">Description</h2>
              <p className="text-sm text-ink-600 whitespace-pre-wrap">{deal.description}</p>
            </section>
          ) : null}
          <section>
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Deal timeline</h2>
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
          <div className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-xs text-ink-500 space-y-1">
            <p>
              Buyer pays <strong>{formatCents(deal.buyerTotalCents)}</strong> (incl. their fee share,
              shipping &amp; coverage lines).
            </p>
            <p>
              Funds are held by our payment processor and released after hub documentation and
              signature-confirmed delivery. FlipLocker receives only its service fee.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
