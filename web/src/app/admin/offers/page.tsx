import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { OfferStatusChip, OfferThumb } from "@/components/offer-ui";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { OFFER_STATUS_LABELS } from "@/lib/offers";
import type { OfferStatus, Prisma } from "@prisma/client";

const ALL_STATUSES = Object.keys(OFFER_STATUS_LABELS) as OfferStatus[];

export default async function AdminOffers({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser("ADMIN");
  const { status } = await searchParams;
  const where: Prisma.OfferWhereInput =
    status && ALL_STATUSES.includes(status as OfferStatus) ? { status: status as OfferStatus } : {};

  const offers = await db.offer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      seller: true,
      media: { where: { kind: { in: ["FRONT_PHOTO", "REAR_PHOTO"] } } },
      _count: { select: { waitlist: true } },
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Open offers</h1>

      <div className="flex flex-wrap gap-1.5 text-sm">
        <Link
          href="/admin/offers"
          className={`rounded-full px-3 py-1 ${!status ? "bg-brand-600 text-white" : "bg-white border border-ink-200 text-ink-600"}`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/offers?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-brand-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"}`}
          >
            {OFFER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Offer</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Seller</th>
              <th className="px-4 py-2 font-medium text-right">Price</th>
              <th className="px-4 py-2 font-medium text-right hidden sm:table-cell">Waitlist</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <OfferThumb media={o.media} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-ink-700">{o.shortCode}</span>
                        {o.status === "CLAIMED" && o.claimedDealId ? (
                          <Link href={`/admin/deals/${o.claimedDealId}`} className="text-xs font-semibold text-brand-700 hover:underline">
                            view sale
                          </Link>
                        ) : null}
                      </div>
                      <p className="text-xs text-ink-400 truncate max-w-[220px]">{cardTitle(o)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell text-ink-500">{o.seller.email}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatCents(o.salePriceCents)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell">{o._count.waitlist}</td>
                <td className="px-4 py-2.5">
                  <OfferStatusChip status={o.status} />
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                  No offers match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
