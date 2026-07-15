import { db } from "@/lib/db";
import { createOrder, captureOrder, paypalMode } from "@/lib/paypal";
import { transitionDeal, logDealEvent, cardTitle } from "@/lib/deals";
import {
  sendEmail,
  paymentReceivedSellerTemplate,
  buyerReceiptTemplate,
  dealDeclinedSellerTemplate,
} from "@/lib/email";
import { formatCents } from "@/lib/fees";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

/**
 * Buyer clicked Accept & Pay: transition to ACCEPTED, create the processor
 * order (funds will be held by PayPal; platform_fees = service fee only),
 * and hand back the approval URL to send the buyer to.
 */
export async function acceptDealAndCreateOrder(dealId: string, buyerId: string): Promise<string> {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (deal.buyerId !== buyerId) throw new Error("This deal belongs to a different buyer.");

  if (deal.status === "BUYER_NOTIFIED") {
    await transitionDeal(dealId, "ACCEPTED", {
      actor: "buyer",
      message: "Buyer accepted the deal and started checkout.",
    });
    await db.deal.update({ where: { id: dealId }, data: { acceptedAt: new Date() } });
  } else if (deal.status !== "ACCEPTED") {
    throw new Error("This deal can no longer be accepted.");
  }

  const order = await createOrder(deal);
  await db.payment.upsert({
    where: { paypalOrderId: order.orderId },
    update: {},
    create: {
      dealId,
      provider: paypalMode() === "simulator" ? "PAYPAL_SIM" : "PAYPAL",
      paypalOrderId: order.orderId,
      state: "CREATED",
      grossCents: deal.buyerTotalCents,
      platformFeeCents: deal.feeTotalCents,
      sellerNetCents: deal.sellerPayoutCents,
      rawCreate: JSON.parse(JSON.stringify(order.raw)),
    },
  });
  await logDealEvent(dealId, {
    actor: "system",
    type: "CHECKOUT_ORDER_CREATED",
    message: `Checkout order opened with the payment processor (${formatCents(deal.buyerTotalCents)}).`,
    payload: { orderId: order.orderId, mode: paypalMode() },
  });
  return order.approveUrl;
}

/**
 * Capture the order after buyer approval, mark the deal PAID, alert both
 * parties. Idempotent: safe to hit from both the return URL and the webhook.
 */
export async function captureAndMarkPaid(orderId: string): Promise<{ dealId: string }> {
  const payment = await db.payment.findUniqueOrThrow({
    where: { paypalOrderId: orderId },
    include: { deal: { include: { seller: true, buyer: true } } },
  });
  const deal = payment.deal;

  if (payment.state === "CAPTURED") return { dealId: deal.id }; // already processed

  const capture = await captureOrder(orderId);
  if (capture.status !== "COMPLETED") {
    await db.payment.update({ where: { id: payment.id }, data: { state: "FAILED" } });
    throw new Error(`Payment capture did not complete (status ${capture.status}).`);
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      state: "CAPTURED",
      captureId: capture.captureId,
      rawCapture: JSON.parse(JSON.stringify(capture.raw)),
    },
  });

  await transitionDeal(deal.id, "PAID", {
    actor: "system",
    type: "PAYMENT_CAPTURED",
    message: `Payment of ${formatCents(deal.buyerTotalCents)} confirmed, held securely by the payment processor. FlipLocker receives only its ${formatCents(deal.feeTotalCents)} service fee.`,
    payload: { orderId, captureId: capture.captureId },
  });
  await db.deal.update({ where: { id: deal.id }, data: { paidAt: new Date() } });

  await transitionDeal(deal.id, "AWAITING_SELLER_SHIPMENT", {
    actor: "system",
    message: "Seller alerted to ship the card to the FlipLocker hub.",
  });

  const title = cardTitle(deal);
  const sellerMail = paymentReceivedSellerTemplate({
    url: `${appUrl()}/seller/deals/${deal.id}`,
    cardTitle: title,
    shortCode: deal.shortCode,
    sellerPayoutCents: deal.sellerPayoutCents,
  });
  await sendEmail({ to: deal.seller.email, ...sellerMail });

  const buyerMail = buyerReceiptTemplate({
    url: `${appUrl()}/buyer/deals/${deal.id}`,
    cardTitle: title,
    shortCode: deal.shortCode,
    buyerTotalCents: deal.buyerTotalCents,
  });
  await sendEmail({ to: deal.buyerEmail, ...buyerMail });

  return { dealId: deal.id };
}

export async function declineDeal(dealId: string, buyerId: string): Promise<void> {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true } });
  if (deal.buyerId !== buyerId) throw new Error("This deal belongs to a different buyer.");
  await transitionDeal(dealId, "DECLINED", {
    actor: "buyer",
    message: "Buyer declined the deal. No payment was collected.",
  });
  await db.deal.update({ where: { id: dealId }, data: { declinedAt: new Date() } });
  const mail = dealDeclinedSellerTemplate({
    url: `${appUrl()}/seller/deals/${dealId}`,
    cardTitle: cardTitle(deal),
    shortCode: deal.shortCode,
  });
  await sendEmail({ to: deal.seller.email, ...mail });
}
