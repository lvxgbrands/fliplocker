import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/deal-ui";
import { cardTitle, STATUS_LABELS } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import type { DealStatus } from "@prisma/client";

export default async function AdminOverview() {
  await requireUser("ADMIN");

  const [deals, grouped, feesAgg, gmvAgg, recent] = await Promise.all([
    db.deal.count(),
    db.deal.groupBy({ by: ["status"], _count: { _all: true } }),
    db.deal.aggregate({ _sum: { feeTotalCents: true }, where: { status: { in: ["FUNDS_RELEASED", "COMPLETE"] } } }),
    db.deal.aggregate({
      _sum: { salePriceCents: true },
      where: { status: { in: ["PAID", "AWAITING_SELLER_SHIPMENT", "IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"] } },
    }),
    db.deal.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { seller: true } }),
  ]);

  const byStatus = new Map(grouped.map((g) => [g.status, g._count._all]));
  const active = deals - (byStatus.get("COMPLETE") ?? 0) - (byStatus.get("CANCELLED") ?? 0) - (byStatus.get("DECLINED") ?? 0) - (byStatus.get("REFUNDED") ?? 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total deals" value={String(deals)} />
        <Stat label="Active deals" value={String(active)} />
        <Stat label="Processed volume (GMV)" value={formatCents(gmvAgg._sum.salePriceCents ?? 0)} />
        <Stat label="Fees collected" value={formatCents(feesAgg._sum.feeTotalCents ?? 0)} accent />
      </div>

      <section>
        <h2 className="font-semibold mb-3">Deals by status</h2>
        <div className="flex flex-wrap gap-2">
          {[...byStatus.entries()].map(([status, count]) => (
            <Link
              key={status}
              href={`/admin/deals?status=${status}`}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:bg-ink-50"
            >
              <span className="text-ink-500">{STATUS_LABELS[status as DealStatus]}</span>{" "}
              <strong>{count}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent deals</h2>
          <Link href="/admin/deals" className="text-sm text-brand-700 hover:underline">View all →</Link>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white divide-y divide-ink-100">
          {recent.map((d) => (
            <Link key={d.id} href={`/admin/deals/${d.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-ink-50 first:rounded-t-2xl last:rounded-b-2xl">
              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate">{cardTitle(d)}</p>
                <p className="text-xs text-ink-400">{d.shortCode} · {d.seller.email}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm tabular-nums">{formatCents(d.salePriceCents)}</span>
                <StatusChip status={d.status} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-brand-200 bg-brand-50" : "border-ink-200 bg-white"}`}>
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-brand-800" : "text-ink-900"}`}>{value}</p>
    </div>
  );
}
