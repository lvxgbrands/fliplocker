import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/deal-ui";
import { formatCents } from "@/lib/fees";
import { cardTitle } from "@/lib/deals";

export default async function BuyerDashboard() {
  const user = await requireUser();
  const deals = await db.deal.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your deals</h1>
      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No deals yet. When a seller invites you, the deal shows up here after you claim the
          invitation from your email.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {deals.map((d) => (
            <Link
              key={d.id}
              href={`/buyer/deals/${d.id}`}
              className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-slate-50 first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{cardTitle(d)}</p>
                <p className="text-xs text-slate-400">
                  {d.shortCode} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold tabular-nums">{formatCents(d.salePriceCents)}</span>
                <StatusChip status={d.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
