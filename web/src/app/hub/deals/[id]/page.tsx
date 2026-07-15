import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip, Timeline } from "@/components/deal-ui";
import { DealPhotos } from "@/components/deal-photos";
import { HubEvidence } from "@/components/hub-evidence";
import { cardTitle } from "@/lib/deals";
import { ErrorNote } from "@/components/form-ui";
import { InspectionForm } from "./inspection-form";
import { repackAction } from "../../actions";

export default async function HubDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser("FACILITATOR");
  const { id } = await params;
  const { error } = await searchParams;

  const deal = await db.deal.findUnique({
    where: { id },
    include: { media: true, events: { orderBy: { createdAt: "asc" } }, inspection: true, shipments: true },
  });
  if (!deal) notFound();

  const leg1 = deal.shipments.find((s) => s.leg === "TO_HUB");

  return (
    <div>
      <Link href="/hub" className="text-sm text-ink-400 hover:text-ink-600">
        ← Back to queue
      </Link>
      <div className="flex items-start justify-between gap-4 mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{cardTitle(deal)}</h1>
          <p className="text-sm text-ink-400 mt-1">
            {deal.shortCode}
            {leg1?.trackingNumber ? ` · inbound ${leg1.trackingNumber}` : ""}
          </p>
        </div>
        <StatusChip status={deal.status} />
      </div>

      <ErrorNote message={error} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-ink-900 mb-2">Seller&apos;s listing photos</h2>
            <DealPhotos media={deal.media} deal={deal} />
          </div>
          <section className="rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-2">Card details to match</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Detail label="Sport" value={deal.sport} />
              <Detail label="Year" value={String(deal.cardYear)} />
              <Detail label="Player" value={deal.playerName} />
              <Detail label="Grading company" value={deal.gradingCompany} />
              <Detail label="Certificate #" value={deal.certNumber} />
            </dl>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Timeline</h2>
            <Timeline events={deal.events} />
          </section>
        </div>

        <aside className="space-y-4 h-fit lg:sticky lg:top-24">
          {deal.status === "RECEIVED_AT_HUB" ? (
            <section className="rounded-xl border border-brand-200 bg-white p-4">
              <h2 className="font-semibold text-ink-900 mb-3">Record inspection</h2>
              <InspectionForm dealId={deal.id} />
            </section>
          ) : deal.status === "VERIFIED" ? (
            <section className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 space-y-3">
              <p className="text-sm text-brand-900 font-semibold">Verified ✔ — ready to repack</p>
              <p className="text-xs text-brand-800">
                Repack the card and generate the Leg 2 label. Delivery requires a signature.
              </p>
              <form action={repackAction}>
                <input type="hidden" name="dealId" value={deal.id} />
                <button className="w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                  Repack &amp; ship to buyer
                </button>
              </form>
            </section>
          ) : (
            <div className="rounded-xl border border-ink-200 bg-white p-4 text-sm text-ink-500">
              This deal is {deal.status.replace(/_/g, " ").toLowerCase()}.
            </div>
          )}
          {deal.inspection && deal.inspection.result !== "PENDING" ? (
            <HubEvidence media={deal.media} inspection={deal.inspection} />
          ) : null}
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
