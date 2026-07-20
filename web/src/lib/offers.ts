import { randomBytes } from "crypto";
import type { OfferStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Open offer links, pure helpers.
//
// A seller posts one public link for a card at a fixed price. The first buyer
// to reserve and pay wins: reserving takes an exclusive checkout hold, and a
// paid Deal is spawned on capture. Everything money-related still runs through
// the existing fee engine and payment flow, so this file stays pure and
// database-free (mirrors the testable core of deals.ts).
// ---------------------------------------------------------------------------

/** Public-facing labels for offer states. Keep copy within the approved terms. */
export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  OPEN: "Open",
  RESERVED: "Reserved",
  CLAIMED: "Sold",
  CANCELLED: "Closed",
};

// Human-friendly offer reference, e.g. OF-7G2K9Q (same unambiguous alphabet as
// deal short codes, distinct OF- prefix).
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function newOfferShortCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `OF-${code}`;
}

/** Unguessable public share token for the trust page URL. */
export function newOfferLinkToken(): string {
  return randomBytes(24).toString("hex");
}

// Minimal shape the reservation predicates need; a full Offer row satisfies it.
export interface ReservationView {
  status: OfferStatus;
  reservedById: string | null;
  reservedUntil: Date | null;
  expiresAt?: Date | null;
}

/** A RESERVED offer whose exclusive hold has lapsed, ready to re-open. */
export function reservationExpired(offer: ReservationView, now: Date): boolean {
  return (
    offer.status === "RESERVED" &&
    offer.reservedUntil !== null &&
    offer.reservedUntil.getTime() <= now.getTime()
  );
}

/** True when a fresh buyer can start a reservation on this offer right now. */
export function offerIsOpen(offer: ReservationView, now: Date): boolean {
  if (offer.status !== "OPEN") return false;
  if (offer.expiresAt && offer.expiresAt.getTime() <= now.getTime()) return false;
  return true;
}

export type ReserveOutcome =
  | "won" // this buyer claimed the exclusive hold
  | "reentrant" // this buyer already holds a live hold, continue paying
  | "held-by-other" // another buyer holds the hold (or a stale one about to sweep)
  | "sold" // already claimed and paid for
  | "closed" // withdrawn by the seller
  | "expired-listing"; // the listing window passed

/**
 * Explain a reserve attempt AFTER an atomic OPEN -> RESERVED compare-and-swap
 * (and a fallback "extend my own hold" swap) have been attempted. Pure, so the
 * race resolution is unit-testable without a database.
 */
export function resolveReserveOutcome(args: {
  casWon: boolean; // fresh OPEN -> RESERVED swap claimed the row
  reentrantWon?: boolean; // fallback "I already hold it" swap succeeded
  status: OfferStatus; // current status when neither swap won
  reservedById: string | null;
  reservedUntil: Date | null;
  buyerId: string;
  now: Date;
  expiresAt?: Date | null;
}): ReserveOutcome {
  if (args.casWon) return "won";
  if (args.reentrantWon) return "reentrant";

  if (args.status === "RESERVED") {
    const mine = args.reservedById === args.buyerId;
    const live = args.reservedUntil !== null && args.reservedUntil.getTime() > args.now.getTime();
    if (mine && live) return "reentrant";
    return "held-by-other";
  }
  if (args.status === "CLAIMED") return "sold";
  if (args.status === "CANCELLED") return "closed";
  if (args.status === "OPEN" && args.expiresAt && args.expiresAt.getTime() <= args.now.getTime()) {
    return "expired-listing";
  }
  // Status OPEN but neither swap won: lost the race, then swept back to OPEN.
  return "held-by-other";
}

/** Minutes hold -> a concrete deadline from a base time. */
export function holdDeadline(now: Date, holdMinutes: number): Date {
  return new Date(now.getTime() + holdMinutes * 60 * 1000);
}
