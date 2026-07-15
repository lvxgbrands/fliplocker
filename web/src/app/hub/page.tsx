import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/deal-ui";
import { cardTitle } from "@/lib/deals";
import { ErrorNote, SuccessNote } from "@/components/form-ui";
import { checkInAction } from "./actions";

export default async function HubQueue({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; shipped?: string }>;
}) {
  await requireUser("FACILITATOR");
  const { error, shipped } = await searchParams;

  const [awaiting, inbound, inProgress] = await Promise.all([
    db.deal.findMany({ where: { status: "RECEIVED_AT_HUB" }, orderBy: { receivedAt: "asc" }, include: { shipments: true } }),
    db.deal.findMany({ where: { status: "IN_TRANSIT_TO_HUB" }, orderBy: { updatedAt: "asc" }, include: { shipments: true } }),
    db.deal.findMany({ where: { status: { in: ["VERIFIED", "REPACKED"] } }, orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Hub — documentation queue</h1>
        <p className="text-sm text-ink-500 mt-1">Check in inbound packages and document each card.</p>
      </div>

      <SuccessNote message={shipped ? `Deal ${shipped} documented, repacked, and shipped to the buyer.` : undefined} />
      <ErrorNote message={error} />

      <section className="rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="font-semibold mb-3">Check in a package</h2>
        <form action={checkInAction} className="flex gap-2">
          <input
            name="tracking"
            placeholder="Scan or enter tracking number"
            className="flex-1 rounded-lg border border-ink-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Open deal
          </button>
        </form>
      </section>

      <Queue title={`Awaiting inspection (${awaiting.length})`} deals={awaiting} emptyText="Nothing waiting to be inspected." highlight />
      <Queue title={`Expected inbound (${inbound.length})`} deals={inbound} emptyText="No packages in transit to the hub." />
      <Queue title={`In progress (${inProgress.length})`} deals={inProgress} emptyText="No cards mid-processing." />
    </div>
  );
}

function Queue({
  title,
  deals,
  emptyText,
  highlight = false,
}: {
  title: string;
  deals: Awaited<ReturnType<typeof db.deal.findMany>>;
  emptyText: string;
  highlight?: boolean;
}) {
  return (
    <section>
      <h2 className="font-semibold mb-3">{title}</h2>
      {deals.length === 0 ? (
        <p className="text-sm text-ink-400">{emptyText}</p>
      ) : (
        <div className="rounded-2xl border border-ink-200 bg-white divide-y divide-ink-100">
          {deals.map((d) => (
            <Link
              key={d.id}
              href={`/hub/deals/${d.id}`}
              className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-ink-50 first:rounded-t-2xl last:rounded-b-2xl ${
                highlight ? "bg-brand-50/40" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 truncate">{cardTitle(d)}</p>
                <p className="text-xs text-ink-400">{d.shortCode}</p>
              </div>
              <StatusChip status={d.status} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
