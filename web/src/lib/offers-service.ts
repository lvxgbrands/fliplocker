import { db } from "@/lib/db";
import { getCheckoutConfig, getFeeConfig } from "@/lib/config";
import { computeQuote, type Quote } from "@/lib/fees";
import {
  newShortCode,
  newInviteToken,
  cardTitle,
  transitionDeal,
  logDealEvent,
} from "@/lib/deals";
import {
  newOfferShortCode,
  newOfferLinkToken,
  reservationExpired,
  resolveReserveOutcome,
  holdDeadline,
  type ReserveOutcome,
} from "@/lib/offers";
import {
  sendEmail,
  offerSoldSellerTemplate,
  offerWaitlistJoinedTemplate,
  offerReopenedTemplate,
} from "@/lib/email";
import type { Deal, Offer, PlanTier, Prisma, User } from "@prisma/client";

// ---------------------------------------------------------------------------
// Open offer links, database operations.
//
// This module owns the offer lifecycle and reuses the existing money engine:
//   - createOffer: a seller posts a public single-use offer.
//   - reserveOffer: the first buyer to reserve gets an EXCLUSIVE checkout hold
//     (an atomic OPEN -> RESERVED compare-and-swap) and a pending Deal is
//     spawned; the existing accept/pay/capture flow does the rest.
//   - claimOfferForPaidDeal: when the pending deal is PAID, the offer is
//     atomically claimed (RESERVED -> CLAIMED). Called from checkout.ts.
//   - reopenOfferForFallthrough: when a claimed offer's deal is later refunded
//     or cancelled, the offer re-opens and the waitlist is invited back. Called
//     from settlement.ts.
//   - sweepOfferReservations: the job tick releases holds that have lapsed.
//
// Import direction: checkout.ts and settlement.ts import THIS module (for the
// claim/reopen hooks); this module never imports them, so there is no cycle.
// ---------------------------------------------------------------------------

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

type OfferEventInput = {
  actor: "system" | "seller" | "buyer";
  type: string;
  message: string;
  payload?: Prisma.InputJsonValue;
};

export async function logOfferEvent(offerId: string, event: OfferEventInput): Promise<void> {
  await db.offerEvent.create({ data: { offerId, ...event } });
}

/** Full buyer/seller cost breakdown for an offer's fixed sale price. */
export async function quoteForOffer(salePriceCents: number, sellerPlan: PlanTier): Promise<Quote> {
  const checkout = await getCheckoutConfig();
  const feeConfig = await getFeeConfig(sellerPlan);
  return computeQuote({ salePriceCents, feeConfig, checkout, taxRateBps: 0 });
}

export interface CreateOfferData {
  sport: string;
  cardYear: number;
  playerName: string;
  gradingCompany: string;
  grade?: string | null;
  certNumber: string;
  description?: string | null;
  salePriceCents: number;
  media?: { kind: "FRONT_PHOTO" | "REAR_PHOTO"; storageKey: string; contentType: string }[];
  expiresAt?: Date | null;
}

export async function createOffer(seller: User, data: CreateOfferData): Promise<Offer> {
  const offer = await db.offer.create({
    data: {
      linkToken: newOfferLinkToken(),
      shortCode: newOfferShortCode(),
      sellerId: seller.id,
      status: "OPEN",
      sport: data.sport,
      cardYear: data.cardYear,
      playerName: data.playerName,
      gradingCompany: data.gradingCompany,
      grade: data.grade || null,
      certNumber: data.certNumber,
      description: data.description || null,
      salePriceCents: data.salePriceCents,
      expiresAt: data.expiresAt || null,
      media:
        data.media && data.media.length
          ? { create: data.media.map((m) => ({ kind: m.kind, storageKey: m.storageKey, contentType: m.contentType })) }
          : undefined,
    },
  });
  await logOfferEvent(offer.id, {
    actor: "seller",
    type: "OFFER_CREATED",
    message: `Open offer created by ${seller.name || seller.email}.`,
  });
  return offer;
}

// Create the in-flight Deal for a reservation, mirroring createDealAction's
// shape. The card details + optional photos are copied from the offer; the
// buyer is the reserver; the fee tier is the seller's plan.
async function spawnPendingDeal(offerId: string, buyer: User): Promise<string> {
  const offer = await db.offer.findUniqueOrThrow({
    where: { id: offerId },
    include: { seller: true, media: true },
  });
  const checkout = await getCheckoutConfig();
  const feeConfig = await getFeeConfig(offer.seller.plan);
  const quote = computeQuote({ salePriceCents: offer.salePriceCents, feeConfig, checkout, taxRateBps: 0 });

  const deal = await db.deal.create({
    data: {
      shortCode: newShortCode(),
      sellerId: offer.sellerId,
      buyerEmail: buyer.email,
      buyerId: buyer.id,
      inviteToken: newInviteToken(),
      status: "BUYER_NOTIFIED",
      offerId: offer.id,
      sport: offer.sport,
      cardYear: offer.cardYear,
      playerName: offer.playerName,
      gradingCompany: offer.gradingCompany,
      grade: offer.grade,
      certNumber: offer.certNumber,
      description: offer.description,
      salePriceCents: quote.salePriceCents,
      feeTotalCents: quote.feeTotalCents,
      feeBuyerCents: quote.feeBuyerCents,
      feeSellerCents: quote.feeSellerCents,
      shippingCents: quote.shippingCents,
      insuranceCents: quote.insuranceCents,
      taxCents: quote.taxCents,
      buyerTotalCents: quote.buyerTotalCents,
      sellerPayoutCents: quote.sellerPayoutCents,
      feeConfigSnapshot: quote.snapshot as Prisma.InputJsonValue,
      media: {
        create: offer.media
          .filter((m) => m.kind === "FRONT_PHOTO" || m.kind === "REAR_PHOTO")
          .map((m) => ({ kind: m.kind, storageKey: m.storageKey, contentType: m.contentType })),
      },
    },
  });
  await db.offer.update({ where: { id: offer.id }, data: { pendingDealId: deal.id } });
  await logDealEvent(deal.id, {
    actor: "buyer",
    type: "DEAL_CREATED",
    message: `Deal opened from open offer ${offer.shortCode}, ${cardTitle(deal)}.`,
  });
  await logOfferEvent(offer.id, {
    actor: "buyer",
    type: "RESERVED",
    message: "A buyer reserved this offer and started checkout.",
  });
  return deal.id;
}

/**
 * First-buyer-to-pay-wins reservation. Attempts an atomic OPEN -> RESERVED
 * swap; the single winner gets a pending deal to pay for. A buyer who already
 * holds a live reservation is let back in (re-entrant). Everyone else is told
 * why, so the page can offer the waitlist.
 */
export async function reserveOffer(
  offerId: string,
  buyer: User
): Promise<{ outcome: ReserveOutcome; dealId?: string }> {
  const now = new Date();
  const checkout = await getCheckoutConfig();

  // Self-heal: if this offer's hold has lapsed, release it before racing so the
  // demo works without a running cron.
  const current = await db.offer.findUnique({ where: { id: offerId } });
  if (!current) return { outcome: "closed" };
  if (reservationExpired(current, now)) {
    await releaseReservation(current, {
      reason: "The buyer's checkout hold lapsed, the offer re-opened.",
    });
  }

  const until = holdDeadline(now, checkout.offerHoldMinutes);

  // Fresh reservation: atomic OPEN -> RESERVED (Postgres re-checks the WHERE on
  // the locked row, so exactly one concurrent caller wins).
  const fresh = await db.offer.updateMany({
    where: { id: offerId, status: "OPEN" },
    data: { status: "RESERVED", reservedById: buyer.id, reservedAt: now, reservedUntil: until, pendingDealId: null },
  });
  if (fresh.count === 1) {
    const dealId = await spawnPendingDeal(offerId, buyer);
    return { outcome: "won", dealId };
  }

  // Re-entry: this buyer already holds the reservation and clicked again.
  const mine = await db.offer.updateMany({
    where: { id: offerId, status: "RESERVED", reservedById: buyer.id },
    data: { reservedUntil: until },
  });
  if (mine.count === 1) {
    const off = await db.offer.findUniqueOrThrow({ where: { id: offerId } });
    let dealId = off.pendingDealId ?? null;
    if (dealId) {
      const d = await db.deal.findUnique({ where: { id: dealId } });
      if (!d || (d.status !== "BUYER_NOTIFIED" && d.status !== "ACCEPTED")) dealId = null;
    }
    if (!dealId) dealId = await spawnPendingDeal(offerId, buyer);
    return { outcome: "reentrant", dealId };
  }

  // Neither swap won: explain for the page.
  const off = await db.offer.findUnique({ where: { id: offerId } });
  const outcome = resolveReserveOutcome({
    casWon: false,
    reentrantWon: false,
    status: off?.status ?? "CANCELLED",
    reservedById: off?.reservedById ?? null,
    reservedUntil: off?.reservedUntil ?? null,
    buyerId: buyer.id,
    now,
    expiresAt: off?.expiresAt ?? null,
  });
  return { outcome };
}

/** Atomically claim a reserved offer when its pending deal is PAID. */
export async function claimOfferForPaidDeal(deal: Deal): Promise<void> {
  if (!deal.offerId) return;
  const now = new Date();
  const claimed = await db.offer.updateMany({
    where: { id: deal.offerId, status: "RESERVED" },
    data: {
      status: "CLAIMED",
      claimedById: deal.buyerId,
      claimedDealId: deal.id,
      claimedAt: now,
      pendingDealId: null,
      reservedById: null,
      reservedAt: null,
      reservedUntil: null,
    },
  });
  if (claimed.count === 0) return; // already claimed or reopened elsewhere; payment still stands

  const offer = await db.offer.findUniqueOrThrow({ where: { id: deal.offerId }, include: { seller: true } });
  await logOfferEvent(offer.id, {
    actor: "system",
    type: "CLAIMED",
    message: `Sold: first buyer to pay won this offer (deal ${deal.shortCode}).`,
  });
  const mail = offerSoldSellerTemplate({
    url: `${appUrl()}/seller/deals/${deal.id}`,
    cardTitle: cardTitle(deal),
    shortCode: offer.shortCode,
    sellerPayoutCents: deal.sellerPayoutCents,
  });
  await sendEmail({ to: offer.seller.email, dealId: deal.id, ...mail });
}

// Re-open a reserved or claimed offer and invite the waitlist back.
async function reopenOffer(
  offerId: string,
  { reason, actor = "system" }: { reason: string; actor?: "system" | "seller" | "buyer" }
): Promise<void> {
  const offer = await db.offer.findUnique({ where: { id: offerId }, include: { waitlist: true } });
  if (!offer) return;
  if (offer.status !== "RESERVED" && offer.status !== "CLAIMED") return;

  await db.offer.update({
    where: { id: offerId },
    data: {
      status: "OPEN",
      reservedById: null,
      reservedAt: null,
      reservedUntil: null,
      pendingDealId: null,
      claimedById: null,
      claimedDealId: null,
      claimedAt: null,
    },
  });
  await logOfferEvent(offerId, { actor, type: "REOPENED", message: reason });

  for (const w of offer.waitlist) {
    const mail = offerReopenedTemplate({
      url: `${appUrl()}/offer/${offer.linkToken}`,
      cardTitle: cardTitle(offer),
      shortCode: offer.shortCode,
    });
    await sendEmail({ to: w.email, ...mail }).catch(() => undefined);
    await db.offerWaitlist.update({ where: { id: w.id }, data: { notifiedAt: new Date() } }).catch(() => undefined);
  }
}

/** Cancel the in-flight (unpaid) deal for a reservation, then re-open the offer. */
async function releaseReservation(offer: Offer, { reason }: { reason: string }): Promise<void> {
  if (offer.pendingDealId) {
    const deal = await db.deal.findUnique({ where: { id: offer.pendingDealId } });
    if (deal && (deal.status === "BUYER_NOTIFIED" || deal.status === "ACCEPTED")) {
      await db.payment.updateMany({ where: { dealId: deal.id, state: "CREATED" }, data: { state: "VOIDED" } });
      await transitionDeal(deal.id, "CANCELLED", {
        actor: "system",
        type: "CHECKOUT_CANCELLED",
        message: reason,
      });
      await db.deal.update({ where: { id: deal.id }, data: { cancelledAt: new Date() } });
    }
  }
  await reopenOffer(offer.id, { reason });
}

/**
 * Re-open a claimed offer whose deal later fell through (refunded/cancelled).
 * Called from settlement.refundDeal. Idempotent, and a no-op for non-offer deals.
 */
export async function reopenOfferForFallthrough(deal: Pick<Deal, "id" | "offerId">): Promise<void> {
  if (!deal.offerId) return;
  const offer = await db.offer.findUnique({ where: { id: deal.offerId } });
  if (!offer) return;
  if (offer.claimedDealId === deal.id || offer.pendingDealId === deal.id) {
    await reopenOffer(offer.id, { reason: "The buyer's purchase fell through, the offer is open again." });
  }
}

/** Release every reservation whose checkout hold has lapsed. Run by the job tick. */
export async function sweepOfferReservations(now: Date = new Date()): Promise<number> {
  const expired = await db.offer.findMany({ where: { status: "RESERVED", reservedUntil: { lt: now } } });
  let count = 0;
  for (const offer of expired) {
    await releaseReservation(offer, {
      reason: "The buyer's checkout hold lapsed, the offer re-opened to the waitlist.",
    });
    count++;
  }
  return count;
}

export async function joinWaitlist(
  offerId: string,
  { email, name, userId }: { email: string; name?: string | null; userId?: string | null }
): Promise<{ ok: boolean }> {
  const offer = await db.offer.findUnique({ where: { id: offerId } });
  if (!offer) return { ok: false };
  const normEmail = email.trim().toLowerCase();

  await db.offerWaitlist.upsert({
    where: { offerId_email: { offerId, email: normEmail } },
    update: { name: name || undefined, userId: userId || undefined },
    create: { offerId, email: normEmail, name: name || null, userId: userId || null },
  });
  await logOfferEvent(offerId, {
    actor: "buyer",
    type: "WAITLIST_JOINED",
    message: "A buyer joined the waitlist.",
  });
  const mail = offerWaitlistJoinedTemplate({
    url: `${appUrl()}/offer/${offer.linkToken}`,
    cardTitle: cardTitle(offer),
    shortCode: offer.shortCode,
  });
  await sendEmail({ to: normEmail, ...mail }).catch(() => undefined);
  return { ok: true };
}

export async function cancelOffer(offerId: string, sellerId: string): Promise<{ ok: boolean; error?: string }> {
  const offer = await db.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.sellerId !== sellerId) return { ok: false, error: "Offer not found." };
  if (offer.status === "CLAIMED") return { ok: false, error: "This offer already sold and cannot be withdrawn." };
  if (offer.status === "CANCELLED") return { ok: true };

  if (offer.status === "RESERVED" && offer.pendingDealId) {
    const deal = await db.deal.findUnique({ where: { id: offer.pendingDealId } });
    if (deal && (deal.status === "BUYER_NOTIFIED" || deal.status === "ACCEPTED")) {
      await db.payment.updateMany({ where: { dealId: deal.id, state: "CREATED" }, data: { state: "VOIDED" } });
      await transitionDeal(deal.id, "CANCELLED", {
        actor: "seller",
        type: "CHECKOUT_CANCELLED",
        message: "Seller withdrew the offer during checkout.",
      });
      await db.deal.update({ where: { id: deal.id }, data: { cancelledAt: new Date() } });
    }
  }

  await db.offer.update({
    where: { id: offerId },
    data: { status: "CANCELLED", reservedById: null, reservedAt: null, reservedUntil: null, pendingDealId: null },
  });
  await logOfferEvent(offerId, { actor: "seller", type: "CANCELLED", message: "Seller withdrew this offer." });
  return { ok: true };
}
