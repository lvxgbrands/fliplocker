import Link from "next/link";
import { Tag, Plus, ExternalLink, Users, Radio, PackageCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VerifyEmailBanner } from "@/components/shell";
import { buttonClass, EmptyState, Stat } from "@/components/ui";
import { ErrorNote, SuccessNote } from "@/components/form-ui";
import { OfferStatusChip, OfferThumb } from "@/components/offer-ui";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { CopyLink } from "./copy-link";
import { cancelOfferAction } from "./actions";

const appUrl = process.env.APP_URL || "http://localhost:3000";

export default async function SellerOffers({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; cancelled?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const offers = await db.offer.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { media: { where: { kind: { in: ["FRONT_PHOTO", "REAR_PHOTO"] } } }, _count: { select: { waitlist: true } } },
  });

  const open = offers.filter((o) => o.status === "OPEN").length;
  const reserved = offers.filter((o) => o.status === "RESERVED").length;
  const sold = offers.filter((o) => o.status === "CLAIMED").length;
  const created = params.created ? offers.find((o) => o.id === params.created) : null;

  return (
    <div>
      <VerifyEmailBanner user={user} />

      {created ? (
        <div className="mt-2 overflow-hidden rounded-2xl border border-brand-300/70 bg-gradient-to-r from-brand-50 to-white p-5 shadow-soft">
          <p className="font-bold text-brand-900">Your open offer is live 🎉</p>
          <p className="mt-1 text-sm text-brand-800">
            Share this link. The first buyer to pay <strong>{formatCents(created.salePriceCents)}</strong> wins.
          </p>
          <div className="mt-3 max-w-xl">
            <CopyLink url={`${appUrl}/offer/${created.linkToken}`} />
          </div>
        </div>
      ) : null}
      <SuccessNote message={params.cancelled ? "Offer withdrawn." : undefined} />
      <ErrorNote message={params.error} />

      {offers.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="Open" value={String(open)} icon={Radio} accent />
          <Stat label="Reserved" value={String(reserved)} icon={Users} />
          <Stat label="Sold" value={String(sold)} icon={PackageCheck} />
        </div>
      )}

      <div className="mb-5 mt-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Open offers</h1>
          <p className="mt-1 text-sm text-ink-500">
            One public link per card. First buyer to pay wins; the rest can join a waitlist.
          </p>
        </div>
        <Link href="/seller/offers/new" className={buttonClass("primary", "md")}>
          <Plus className="h-4 w-4" strokeWidth={2.5} /> New open offer
        </Link>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No open offers yet"
          body="Post a card at a fixed price, share the link anywhere, and let the first buyer to pay claim it."
          action={{ label: "Post your first offer", href: "/seller/offers/new" }}
        />
      ) : (
        <div className="space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <OfferThumb media={o.media} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{cardTitle(o)}</p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      <span className="font-mono">{o.shortCode}</span>
                      {o._count.waitlist > 0 ? <> · {o._count.waitlist} on waitlist</> : null} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink-900">
                    {formatCents(o.salePriceCents)}
                  </span>
                  <OfferStatusChip status={o.status} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {o.status === "OPEN" || o.status === "RESERVED" ? (
                  <div className="min-w-0 flex-1 basis-64">
                    <CopyLink url={`${appUrl}/offer/${o.linkToken}`} />
                  </div>
                ) : null}
                <a
                  href={`/offer/${o.linkToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("secondary", "sm")}
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} /> View public page
                </a>
                {o.status === "CLAIMED" && o.claimedDealId ? (
                  <Link href={`/seller/deals/${o.claimedDealId}`} className={buttonClass("primary", "sm")}>
                    View the sale
                  </Link>
                ) : null}
                {o.status === "OPEN" || o.status === "RESERVED" ? (
                  <form action={cancelOfferAction}>
                    <input type="hidden" name="offerId" value={o.id} />
                    <button type="submit" className={buttonClass("danger", "sm")}>
                      Withdraw
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
