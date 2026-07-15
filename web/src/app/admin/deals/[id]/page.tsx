import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip, Timeline } from "@/components/deal-ui";
import { ShipmentPanel } from "@/components/shipment-panel";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { ErrorNote, SuccessNote } from "@/components/form-ui";
import {
  adminCancelDealAction,
  adminResolveFlaggedAction,
  adminRegenerateLabelAction,
  adminForceCompleteAction,
} from "../../actions";

const DONE: Record<string, string> = {
  cancelled: "Deal cancelled (buyer refunded if payment had been captured).",
  resolved: "Flag resolved.",
  label: "Leg 1 label regenerated.",
  released: "Funds released and deal completed.",
};

export default async function AdminDealDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  await requireUser("ADMIN");
  const { id } = await params;
  const { done, error } = await searchParams;

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      seller: true,
      buyer: true,
      events: { orderBy: { createdAt: "asc" } },
      shipments: { orderBy: { createdAt: "asc" } },
      payments: true,
      inspection: true,
    },
  });
  if (!deal) notFound();

  const canRegenLabel = ["PAID", "AWAITING_SELLER_SHIPMENT"].includes(deal.status);
  const isFlagged = deal.status === "FLAGGED";
  const canForceComplete = deal.status === "DELIVERED_SIGNED";
  const terminal = ["COMPLETE", "CANCELLED", "DECLINED", "REFUNDED"].includes(deal.status);

  return (
    <div>
      <Link href="/admin/deals" className="text-sm text-ink-400 hover:text-ink-600">← All deals</Link>

      {done ? <SuccessNote message={DONE[done]} /> : null}
      <ErrorNote message={error} />

      <div className="flex items-start justify-between gap-4 mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{cardTitle(deal)}</h1>
          <p className="text-sm text-ink-400 mt-1">
            {deal.shortCode} · seller {deal.seller.email} · buyer {deal.buyerEmail}
            {deal.buyer ? " (joined)" : " (invited)"}
          </p>
        </div>
        <StatusChip status={deal.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="text-sm font-semibold mb-3">Money</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <Money label="Sale price" cents={deal.salePriceCents} />
              <Money label="Service fee (total)" cents={deal.feeTotalCents} />
              <Money label="Buyer fee share" cents={deal.feeBuyerCents} />
              <Money label="Seller fee share" cents={deal.feeSellerCents} />
              <Money label="Shipping" cents={deal.shippingCents} />
              <Money label="Insurance" cents={deal.insuranceCents} />
              <Money label="Tax" cents={deal.taxCents} />
              <Money label="Buyer total" cents={deal.buyerTotalCents} strong />
              <Money label="Seller payout" cents={deal.sellerPayoutCents} strong />
            </dl>
            {deal.payments.length > 0 && (
              <p className="mt-3 pt-3 border-t border-ink-100 text-xs text-ink-500">
                Payment: {deal.payments[0].provider} · {deal.payments[0].state}
                {deal.payments[0].captureId ? ` · capture ${deal.payments[0].captureId}` : ""}
                {deal.payments[0].refundId ? ` · refund ${deal.payments[0].refundId}` : ""}
              </p>
            )}
          </section>

          {deal.flagReason ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>Flag reason:</strong> {deal.flagReason}
            </div>
          ) : null}

          <section>
            <h2 className="text-sm font-semibold mb-3">Timeline</h2>
            <Timeline events={deal.events} />
          </section>
        </div>

        <aside className="space-y-4 h-fit lg:sticky lg:top-24">
          <ShipmentPanel shipments={deal.shipments} />

          <section className="rounded-xl border border-ink-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold">Manual overrides</h2>
            {terminal ? (
              <p className="text-xs text-ink-400">This deal is closed — no overrides available.</p>
            ) : (
              <>
                {canRegenLabel && (
                  <Override action={adminRegenerateLabelAction} dealId={deal.id} label="Regenerate Leg 1 label" />
                )}
                {canForceComplete && (
                  <Override action={adminForceCompleteAction} dealId={deal.id} label="Release funds & complete" accent />
                )}
                {isFlagged && (
                  <form action={adminResolveFlaggedAction} className="space-y-2">
                    <input type="hidden" name="dealId" value={deal.id} />
                    <input type="hidden" name="resolution" value="refund" />
                    <button className="w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                      Resolve flag → refund buyer
                    </button>
                  </form>
                )}
                <Override action={adminCancelDealAction} dealId={deal.id} label="Cancel deal (refund if paid)" danger />
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Money({ label, cents, strong = false }: { label: string; cents: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold text-ink-900" : "text-ink-600"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatCents(cents)}</dd>
    </div>
  );
}

function Override({
  action,
  dealId,
  label,
  accent = false,
  danger = false,
}: {
  action: (fd: FormData) => Promise<void>;
  dealId: string;
  label: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const cls = accent
    ? "bg-brand-600 text-white hover:bg-brand-700"
    : danger
      ? "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
      : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-50";
  return (
    <form action={action}>
      <input type="hidden" name="dealId" value={dealId} />
      <button className={`w-full rounded-lg px-4 py-2 text-sm font-semibold ${cls}`}>{label}</button>
    </form>
  );
}
