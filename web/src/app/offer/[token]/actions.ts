"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { acceptDealAndCreateOrder } from "@/lib/checkout";
import { reserveOffer, joinWaitlist } from "@/lib/offers-service";
import type { ReserveOutcome } from "@/lib/offers";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Buyer clicks "Reserve & pay": take the exclusive hold, then start checkout. */
export async function reserveOfferAction(formData: FormData) {
  const user = await requireUser();
  const token = String(formData.get("token") || "");

  const offer = await db.offer.findUnique({ where: { linkToken: token } });
  if (!offer) redirect(`/offer/${token}`);
  if (offer.sellerId === user.id) redirect(`/offer/${token}?msg=own`);

  let outcome: ReserveOutcome;
  let dealId: string | undefined;
  try {
    ({ outcome, dealId } = await reserveOffer(offer.id, user));
  } catch {
    redirect(`/offer/${token}?msg=error`);
  }

  if ((outcome === "won" || outcome === "reentrant") && dealId) {
    let approveUrl: string;
    try {
      approveUrl = await acceptDealAndCreateOrder(dealId, user.id);
    } catch {
      redirect(`/offer/${token}?msg=error`);
    }
    redirect(approveUrl);
  }

  redirect(`/offer/${token}?msg=${outcome}`);
}

/** Anyone can join the waitlist to be invited back if the offer re-opens. */
export async function joinWaitlistAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const emailInput = String(formData.get("email") || "").trim();
  const name = String(formData.get("name") || "").trim() || null;

  const offer = await db.offer.findUnique({ where: { linkToken: token } });
  if (!offer) redirect(`/offer/${token}`);

  const user = await getCurrentUser();
  const email = (emailInput || user?.email || "").toLowerCase();
  if (!EMAIL_RE.test(email)) redirect(`/offer/${token}?msg=bademail`);

  try {
    await joinWaitlist(offer.id, { email, name, userId: user?.id ?? null });
  } catch {
    redirect(`/offer/${token}?msg=error`);
  }
  redirect(`/offer/${token}?msg=waitlisted`);
}
