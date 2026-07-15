import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/deal-ui";
import { cardTitle, STATUS_LABELS } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import type { DealStatus, Prisma } from "@prisma/client";

const ALL_STATUSES = Object.keys(STATUS_LABELS) as DealStatus[];

export default async function AdminDeals({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser("ADMIN");
  const { status } = await searchParams;
  const where: Prisma.DealWhereInput = status && ALL_STATUSES.includes(status as DealStatus) ? { status: status as DealStatus } : {};

  const deals = await db.deal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { seller: true },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Deals</h1>

      <div className="flex flex-wrap gap-1.5 text-sm">
        <Link href="/admin/deals" className={`rounded-full px-3 py-1 ${!status ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/deals?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Deal</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Seller</th>
              <th className="px-4 py-2 font-medium text-right">Price</th>
              <th className="px-4 py-2 font-medium text-right">Fee</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deals.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/deals/${d.id}`} className="font-medium text-teal-700 hover:underline">
                    {d.shortCode}
                  </Link>
                  <p className="text-xs text-slate-400 truncate max-w-[220px]">{cardTitle(d)}</p>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell text-slate-500">{d.seller.email}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatCents(d.salePriceCents)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatCents(d.feeTotalCents)}</td>
                <td className="px-4 py-2.5"><StatusChip status={d.status} /></td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No deals match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
