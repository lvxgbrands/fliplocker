import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import type { Deal, DealStatus, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Deal state machine. Every transition is guarded server-side and writes an
// append-only deal_events row that powers the transparency timeline.
// ---------------------------------------------------------------------------

export const ALLOWED_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  DRAFT: ["CREATED", "CANCELLED"],
  CREATED: ["BUYER_NOTIFIED", "CANCELLED"],
  BUYER_NOTIFIED: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["PAID", "BUYER_NOTIFIED", "CANCELLED"], // back to BUYER_NOTIFIED if checkout is abandoned
  PAID: ["AWAITING_SELLER_SHIPMENT", "REFUNDED"],
  AWAITING_SELLER_SHIPMENT: ["IN_TRANSIT_TO_HUB", "CANCELLED", "REFUNDED"],
  IN_TRANSIT_TO_HUB: ["RECEIVED_AT_HUB"],
  RECEIVED_AT_HUB: ["VERIFIED", "FLAGGED"],
  VERIFIED: ["REPACKED"],
  REPACKED: ["IN_TRANSIT_TO_BUYER"],
  IN_TRANSIT_TO_BUYER: ["DELIVERED_SIGNED"],
  DELIVERED_SIGNED: ["FUNDS_RELEASED", "FLAGGED"],
  FUNDS_RELEASED: ["COMPLETE"],
  COMPLETE: [],
  DECLINED: [],
  CANCELLED: [],
  REFUNDED: [],
  FLAGGED: ["REFUNDED", "CANCELLED"],
};

export type Actor = "system" | "seller" | "buyer" | "facilitator" | "admin";

export async function transitionDeal(
  dealId: string,
  to: DealStatus,
  event: { actor: Actor; message: string; type?: string; payload?: Prisma.InputJsonValue },
  tx: Prisma.TransactionClient | typeof db = db
): Promise<Deal> {
  const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (!ALLOWED_TRANSITIONS[deal.status].includes(to)) {
    throw new Error(`Illegal deal transition ${deal.status} -> ${to} (deal ${deal.shortCode})`);
  }
  const updated = await tx.deal.update({ where: { id: dealId }, data: { status: to } });
  await tx.dealEvent.create({
    data: {
      dealId,
      type: event.type ?? to,
      actor: event.actor,
      message: event.message,
      payload: event.payload,
    },
  });
  return updated;
}

export async function logDealEvent(
  dealId: string,
  event: { actor: Actor; type: string; message: string; payload?: Prisma.InputJsonValue },
  tx: Prisma.TransactionClient | typeof db = db
): Promise<void> {
  await tx.dealEvent.create({ data: { dealId, ...event } });
}

// Human-friendly deal reference, e.g. FL-7G2K9Q (unambiguous alphabet).
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function newShortCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `FL-${code}`;
}

export function newInviteToken(): string {
  return randomBytes(24).toString("hex");
}

export function cardTitle(deal: Pick<Deal, "cardYear" | "playerName" | "sport" | "gradingCompany" | "certNumber">): string {
  return `${deal.cardYear} ${deal.playerName} (${deal.sport}) — ${deal.gradingCompany} #${deal.certNumber}`;
}

/** Statuses shown to users, in copy that follows the language rules. */
export const STATUS_LABELS: Record<DealStatus, string> = {
  DRAFT: "Draft",
  CREATED: "Created",
  BUYER_NOTIFIED: "Buyer invited",
  ACCEPTED: "Accepted — payment in progress",
  PAID: "Paid — awaiting shipment",
  AWAITING_SELLER_SHIPMENT: "Awaiting seller shipment",
  IN_TRANSIT_TO_HUB: "In transit to FlipLocker hub",
  RECEIVED_AT_HUB: "Received at hub",
  VERIFIED: "Documented",
  REPACKED: "Repacked for delivery",
  IN_TRANSIT_TO_BUYER: "On the way to buyer",
  DELIVERED_SIGNED: "Delivered — signature confirmed",
  FUNDS_RELEASED: "Seller payout released",
  COMPLETE: "Complete",
  DECLINED: "Declined by buyer",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  FLAGGED: "On hold — under review",
};
