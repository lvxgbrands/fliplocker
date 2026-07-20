import { db } from "@/lib/db";
import { getCheckoutConfig } from "@/lib/config";
import { refundCapture, releaseDisbursement } from "@/lib/paypal";
import { transitionDeal, cardTitle, type Actor } from "@/lib/deals";
import { reopenOfferForFallthrough } from "@/lib/offers-service";
import { sendEmail, genericEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { formatCents } from "@/lib/fees";
import type { DealStatus } from "@prisma/client";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

/**
 * Release the seller's payout + FlipLocker's fee at the same time (multiparty),
 * then COMPLETE the deal. Also schedules hub media purge (30 days).
 */
export async function releaseFunds(dealId: string, actor: Actor = "system", reason = "Buyer review window closed"): Promise<void> {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true, payments: true } });
  if (deal.status !== "DELIVERED_SIGNED") throw new Error("Funds release requires signature-confirmed delivery.");

  const payment = deal.payments.find((p) => p.state === "CAPTURED");
  if (payment) {
    await releaseDisbursement(payment.captureId || payment.paypalOrderId);
    await db.payment.update({ where: { id: payment.id }, data: { disbursedAt: new Date() } });
  }

  await transitionDeal(dealId, "FUNDS_RELEASED", {
    actor,
    type: "FUNDS_RELEASED",
    message: `${reason}. Seller payout of ${formatCents(deal.sellerPayoutCents)} released; FlipLocker fee of ${formatCents(deal.feeTotalCents)} routed.`,
  });
  await db.deal.update({ where: { id: dealId }, data: { fundsReleasedAt: new Date() } });

  await transitionDeal(dealId, "COMPLETE", {
    actor: "system",
    type: "COMPLETE",
    message: "Deal complete. Thanks for using FlipLocker.",
  });
  await db.deal.update({ where: { id: dealId }, data: { completedAt: new Date() } });

  // Schedule hub media purge.
  const config = await getCheckoutConfig();
  const purgeAt = new Date(Date.now() + config.mediaPurgeDays * 24 * 3600 * 1000);
  await db.dealMedia.updateMany({
    where: { dealId, kind: { in: ["HUB_VIDEO", "HUB_PHOTO_1", "HUB_PHOTO_2"] } },
    data: { purgeAfter: purgeAt },
  });

  const sellerMail = genericEmail(
    `Payout released, deal ${deal.shortCode}`,
    "Your payout has been released 🎉",
    [
      `The buyer review window for <strong>${cardTitle(deal)}</strong> has closed.`,
      `Your payout of <strong>${formatCents(deal.sellerPayoutCents)}</strong> has been released to you by our payment processor. This deal is now complete.`,
    ],
    { label: "View deal", url: `${appUrl()}/seller/deals/${dealId}` }
  );
  await sendEmail({ to: deal.seller.email, dealId, ...sellerMail });
  await sendSms({ to: deal.seller.phone, dealId, body: `FlipLocker: payout of ${formatCents(deal.sellerPayoutCents)} released for deal ${deal.shortCode}. Complete!` });
}

interface RefundArgs {
  actor: Actor;
  reason: string;
  toStatus: Extract<DealStatus, "REFUNDED" | "CANCELLED">;
}

/** Refund the buyer's captured payment (or void an open order) and close the deal. */
export async function refundDeal(dealId: string, { actor, reason, toStatus }: RefundArgs): Promise<void> {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true, buyer: true, payments: true } });

  const captured = deal.payments.find((p) => p.state === "CAPTURED");
  if (captured) {
    const refund = await refundCapture(captured.captureId || captured.paypalOrderId, captured.grossCents);
    await db.payment.update({
      where: { id: captured.id },
      data: { state: "REFUNDED", refundId: refund.refundId, refundedAt: new Date() },
    });
  } else {
    await db.payment.updateMany({ where: { dealId, state: "CREATED" }, data: { state: "VOIDED" } });
  }

  await transitionDeal(dealId, toStatus, {
    actor,
    type: toStatus === "REFUNDED" ? "REFUNDED" : "CANCELLED",
    message: `${reason}${captured ? ` Buyer refunded ${formatCents(captured.grossCents)}.` : " No payment was captured."}`,
  });
  await db.deal.update({
    where: { id: dealId },
    data: toStatus === "REFUNDED" ? { refundedAt: new Date() } : { cancelledAt: new Date() },
  });

  if (captured) {
    const buyerMail = genericEmail(
      `Refund issued, deal ${deal.shortCode}`,
      "You've been refunded",
      [
        `${reason}`,
        `Your payment of <strong>${formatCents(captured.grossCents)}</strong> for <strong>${cardTitle(deal)}</strong> has been refunded by our payment processor.`,
      ],
      { label: "View deal", url: `${appUrl()}/buyer/deals/${dealId}` }
    );
    await sendEmail({ to: deal.buyerEmail, dealId, ...buyerMail });
    await sendSms({ to: deal.buyer?.phone, dealId, body: `FlipLocker: deal ${deal.shortCode}, you were refunded ${formatCents(captured.grossCents)}.` });
  }

  // If this deal came from an open offer, re-open the offer to the waitlist.
  if (deal.offerId) {
    await reopenOfferForFallthrough(deal).catch((e) =>
      console.error("[offer] reopen hook failed", e)
    );
  }
}
