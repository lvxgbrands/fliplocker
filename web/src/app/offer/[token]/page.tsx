import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Video, PenLine, Lock, Users, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark } from "@/components/brand";
import { cardTitle } from "@/lib/deals";
import { formatCents } from "@/lib/fees";
import { reservationExpired } from "@/lib/offers";
import { quoteForOffer } from "@/lib/offers-service";
import { OfferPhotos, OfferProtection, OfferStatusChip, OfferActivity } from "@/components/offer-ui";
import { CostBreakdown } from "@/components/deal-ui";
import { Field, SubmitButton, ErrorNote, SuccessNote } from "@/components/form-ui";
import { buttonClass } from "@/components/ui";
import { reserveOfferAction, joinWaitlistAction } from "./actions";

const TRUST = [
  { icon: ShieldCheck, label: "Hub-documented" },
  { icon: Video, label: "Documented on video" },
  { icon: PenLine, label: "Signature delivery" },
  { icon: Lock, label: "Funds held by processor" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const offer = await db.offer.findUnique({ where: { linkToken: token } });
  return {
    title: offer ? `FlipLocker offer, ${cardTitle(offer)}` : "FlipLocker offer",
    // Single-use share links should not be indexed.
    robots: { index: false, follow: false },
  };
}

function Shell({ hero, children }: { hero?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="hero-dark relative overflow-hidden">
        <div className="dotgrid-blue absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="flex h-20 items-center">
            <Wordmark dark />
          </div>
          {hero ? <div className="pb-12 pt-2">{hero}</div> : null}
        </div>
      </header>
      <main className="mx-auto -mt-6 max-w-3xl px-4 pb-16">{children}</main>
    </div>
  );
}

export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { token } = await params;
  const { msg } = await searchParams;

  const offer = await db.offer.findUnique({
    where: { linkToken: token },
    include: {
      seller: true,
      media: { where: { kind: { in: ["FRONT_PHOTO", "REAR_PHOTO"] } } },
      _count: { select: { waitlist: true } },
      events: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
  const user = await getCurrentUser();

  if (!offer) {
    return (
      <Shell>
        <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center shadow-soft">
          <h1 className="mb-2 text-xl font-bold">Offer not found</h1>
          <p className="text-sm text-ink-500">
            This offer link is invalid or has been withdrawn. Ask the seller for a current one.
          </p>
        </div>
      </Shell>
    );
  }

  const now = new Date();
  const expiredHold = reservationExpired(offer, now);
  const listingExpired = Boolean(offer.expiresAt && offer.expiresAt.getTime() <= now.getTime());
  const isSold = offer.status === "CLAIMED";
  const isClosed = offer.status === "CANCELLED" || listingExpired;
  const isReservedByOther = offer.status === "RESERVED" && !expiredHold && offer.reservedById !== user?.id;
  const isReservedByMe = offer.status === "RESERVED" && !expiredHold && !!user && offer.reservedById === user.id;
  const isOwner = !!user && user.id === offer.sellerId;

  const quote = await quoteForOffer(offer.salePriceCents, offer.seller.plan);
  const lines = [
    { label: "Card price", cents: offer.salePriceCents, emphasize: true },
    ...(quote.feeBuyerCents > 0 ? [{ label: "Buyer service fee", cents: quote.feeBuyerCents }] : []),
    { label: "Outbound shipping & signature", cents: quote.shippingCents },
    ...(quote.insuranceCents > 0 ? [{ label: "Declared-value coverage", cents: quote.insuranceCents }] : []),
    ...(quote.taxCents > 0 ? [{ label: "Tax", cents: quote.taxCents }] : []),
  ];

  const sellerName = offer.seller.name || "A FlipLocker seller";
  const loginNext = `/login?next=${encodeURIComponent(`/offer/${token}`)}`;
  const registerNext = `/register?next=${encodeURIComponent(`/offer/${token}`)}`;

  const hero = (
    <div className="text-center">
      <h1 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
        {sellerName} listed a card for sale
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm text-brand-100/90">
        Open offer: the first buyer to pay wins. Protected by FlipLocker from payment to signed delivery.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {TRUST.map((t) => (
          <span key={t.label} className="flex items-center gap-1.5 text-xs font-semibold text-brand-100/90">
            <t.icon className="h-4 w-4 text-brand-300" strokeWidth={2.2} />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <Shell hero={hero}>
      <div className="space-y-6">
        {/* Message banners */}
        {msg === "waitlisted" ? (
          <SuccessNote message="You're on the waitlist. We'll email you if this offer re-opens." />
        ) : null}
        {msg === "bademail" ? <ErrorNote message="Enter a valid email to join the waitlist." /> : null}
        {msg === "error" ? <ErrorNote message="Something went wrong, please try again." /> : null}
        {msg && ["own", "held-by-other", "sold", "closed", "expired-listing"].includes(msg) ? (
          <p className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-600 shadow-soft">
            {msg === "own"
              ? "That's your own offer. Share the link with buyers."
              : msg === "held-by-other"
                ? "Another buyer is checking out right now. Join the waitlist and we'll email you if it re-opens."
                : msg === "sold"
                  ? "This offer just sold to another buyer."
                  : msg === "expired-listing"
                    ? "This offer's listing window has ended."
                    : "This offer is closed."}
          </p>
        ) : null}

        {/* Card + price */}
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-lift">
          <div className="grid items-start gap-6 sm:grid-cols-[220px_1fr]">
            <OfferPhotos media={offer.media} offer={offer} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-400">{offer.shortCode}</span>
                <OfferStatusChip status={offer.status} />
              </div>
              <h2 className="mt-1 text-lg font-bold">{cardTitle(offer)}</h2>
              {offer.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{offer.description}</p>
              ) : null}
              <p
                className="mt-3 text-4xl font-extrabold tabular-nums text-brand-700"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatCents(offer.salePriceCents)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" strokeWidth={2.2} />
                  {offer._count.waitlist} on waitlist
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Listed {new Date(offer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What the buyer pays */}
        <div>
          <h3 className="mb-2 text-sm font-bold text-ink-700">What you pay</h3>
          <CostBreakdown lines={lines} totalLabel="You pay" totalCents={quote.buyerTotalCents} />
        </div>

        {/* Action card */}
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
          {isSold ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-ink-700">
                Sold. The first buyer to pay won this card.
              </p>
              {!isOwner ? <WaitlistForm token={token} loggedIn={!!user} reopen /> : null}
            </div>
          ) : isClosed ? (
            <p className="text-center text-sm text-ink-500">This offer is no longer available.</p>
          ) : isReservedByOther ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-ink-700">
                Reserved. Another buyer is completing checkout right now.
              </p>
              {!isOwner ? <WaitlistForm token={token} loggedIn={!!user} reopen /> : null}
            </div>
          ) : isReservedByMe ? (
            <form action={reserveOfferAction} className="space-y-3 text-center">
              <input type="hidden" name="token" value={token} />
              <p className="text-sm text-ink-600">You&apos;re holding this offer. Finish checkout to make it yours.</p>
              <SubmitButton>Continue to payment, {formatCents(quote.buyerTotalCents)}</SubmitButton>
            </form>
          ) : isOwner ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-ink-600">This is your offer.</p>
              <Link href="/seller/offers" className={buttonClass("secondary", "md")}>
                Manage your offers
              </Link>
            </div>
          ) : user ? (
            <div className="space-y-5">
              <form action={reserveOfferAction} className="space-y-3 text-center">
                <input type="hidden" name="token" value={token} />
                <SubmitButton>Reserve &amp; pay {formatCents(quote.buyerTotalCents)}</SubmitButton>
                <p className="text-xs text-ink-400">
                  First buyer to pay wins. You get an exclusive checkout window to complete payment.
                </p>
              </form>
              <div className="border-t border-ink-100 pt-4">
                <WaitlistForm token={token} loggedIn secondary />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2 text-center">
                <p className="text-sm text-ink-600">Sign in or create an account to buy this card.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href={loginNext} className={buttonClass("primary", "md")}>
                    Sign in to buy
                  </Link>
                  <Link href={registerNext} className={buttonClass("secondary", "md")}>
                    Create an account
                  </Link>
                </div>
              </div>
              <div className="border-t border-ink-100 pt-4">
                <WaitlistForm token={token} loggedIn={false} secondary />
              </div>
            </div>
          )}
        </div>

        {/* Protection explainer */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-ink-700">How FlipLocker protects you</h3>
          <OfferProtection />
        </div>

        {/* Public activity */}
        {offer.events.length > 0 ? (
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
            <h3 className="mb-3 text-sm font-bold text-ink-700">Recent activity</h3>
            <OfferActivity events={offer.events} />
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

function WaitlistForm({
  token,
  loggedIn,
  secondary = false,
  reopen = false,
}: {
  token: string;
  loggedIn: boolean;
  secondary?: boolean;
  reopen?: boolean;
}) {
  return (
    <form action={joinWaitlistAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm font-semibold text-ink-700">
        {reopen ? "Want a shot if it re-opens?" : secondary ? "Not ready to buy?" : "Join the waitlist"}
      </p>
      {!loggedIn ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" placeholder="you@example.com" />
          <Field label="Name (optional)" name="name" required={false} placeholder="Blake Buyer" />
        </div>
      ) : null}
      <button type="submit" className={buttonClass("secondary", "md")}>
        Join the waitlist
      </button>
      <p className="text-xs text-ink-400">
        We&apos;ll email you if this offer re-opens. First buyer to pay still wins.
      </p>
    </form>
  );
}
