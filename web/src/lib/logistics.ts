import { db } from "@/lib/db";
import type { Deal, Prisma } from "@prisma/client";
import { getCheckoutConfig } from "@/lib/config";
import { buyLabel, type Address } from "@/lib/shipping";
import { transitionDeal, logDealEvent, cardTitle } from "@/lib/deals";
import { sendEmail, genericEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { formatCents } from "@/lib/fees";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";
const hours = (n: number) => new Date(Date.now() + n * 3600 * 1000);

async function hubAddress(): Promise<Address> {
  const c = await getCheckoutConfig();
  return { name: c.hubName, street: c.hubStreet, city: c.hubCity, state: c.hubState, zip: c.hubZip };
}

// Placeholder seller/buyer addresses. Real addresses are collected in a later
// phase (seller ship-from at label time, buyer shipping at checkout); for the
// demo the label renders with these stand-ins.
function sellerAddress(deal: Deal & { seller: { name: string | null; email: string } }): Address {
  return { name: deal.seller.name || deal.seller.email, street: "1 Seller Ave", city: "Dallas", state: "TX", zip: "75201" };
}
function buyerAddress(deal: Deal): Address {
  return { name: deal.buyerEmail, street: "1 Buyer Blvd", city: "Miami", state: "FL", zip: "33101" };
}

/**
 * Leg 1 (seller → hub). Generated after payment, gated on ToS acceptance.
 * Starts the 72-hour ship window. Label charge billed to the seller (record).
 */
export async function generateLeg1Label(dealId: string) {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true } });
  if (!["PAID", "AWAITING_SELLER_SHIPMENT"].includes(deal.status)) {
    throw new Error("A label can only be generated after payment.");
  }
  if (!deal.tosAcceptedAt) throw new Error("Accept the Terms of Service before generating a label.");

  const existing = await db.shipment.findFirst({ where: { dealId, leg: "TO_HUB" } });
  if (existing?.labelUrl) return existing;

  const config = await getCheckoutConfig();
  const shipment =
    existing ??
    (await db.shipment.create({
      data: { dealId, leg: "TO_HUB", signatureRequired: false, service: "USPS Ground Advantage" },
    }));

  const label = await buyLabel({
    shipmentId: shipment.id,
    service: "USPS Ground Advantage",
    signatureRequired: false,
    from: sellerAddress(deal),
    to: await hubAddress(),
  });

  const updated = await db.shipment.update({
    where: { id: shipment.id },
    data: {
      provider: label.provider,
      carrier: label.carrier,
      service: label.service,
      trackingNumber: label.trackingNumber,
      labelUrl: label.labelUrl,
      labelChargeCents: config.sellerLabelChargeCents,
      status: "LABEL_CREATED",
    },
  });

  const deadline = hours(config.shipTimerHours);
  await db.deal.update({ where: { id: dealId }, data: { shipDeadlineAt: deadline } });
  await logDealEvent(dealId, {
    actor: "system",
    type: "LEG1_LABEL_CREATED",
    message: `Prepaid Leg 1 label to the hub generated (${label.trackingNumber}). Ship within ${config.shipTimerHours} hours.`,
    payload: { trackingNumber: label.trackingNumber, chargeCents: config.sellerLabelChargeCents },
  });

  const mail = genericEmail(
    `Your shipping label is ready — deal ${deal.shortCode}`,
    "Your prepaid shipping label is ready 🏷️",
    [
      `Your Leg 1 label to the FlipLocker hub for <strong>${cardTitle(deal)}</strong> is ready to print.`,
      `Please ship within <strong>${config.shipTimerHours} hours</strong> — if the package gets no carrier scan in that window, the deal auto-cancels and the buyer is refunded.`,
      `Tracking: <strong>${label.trackingNumber}</strong>. A ${formatCents(config.sellerLabelChargeCents)} label charge applies.`,
    ],
    { label: "Print your label", url: `${appUrl()}/seller/deals/${dealId}` }
  );
  await sendEmail({ to: deal.seller.email, dealId, ...mail });
  await sendSms({
    to: deal.seller.phone,
    dealId,
    body: `FlipLocker: label ready for deal ${deal.shortCode}. Ship within ${config.shipTimerHours}h. Tracking ${label.trackingNumber}.`,
  });
  return updated;
}

/** Simulated first carrier scan: seller handed the package to USPS. */
export async function scanLeg1Accepted(dealId: string) {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (deal.status !== "AWAITING_SELLER_SHIPMENT") throw new Error("No outbound shipment awaiting a scan.");
  const shipment = await db.shipment.findFirstOrThrow({ where: { dealId, leg: "TO_HUB" } });
  await db.shipment.update({ where: { id: shipment.id }, data: { status: "IN_TRANSIT", lastScanAt: new Date() } });
  await transitionDeal(dealId, "IN_TRANSIT_TO_HUB", {
    actor: "system",
    type: "LEG1_IN_TRANSIT",
    message: `Package accepted by the carrier — in transit to the hub (${shipment.trackingNumber}).`,
  });
}

/** Package delivered to the hub — enters the facilitator inbound queue. */
export async function receiveAtHub(dealId: string) {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true } });
  if (deal.status !== "IN_TRANSIT_TO_HUB") throw new Error("Deal is not in transit to the hub.");
  const shipment = await db.shipment.findFirstOrThrow({ where: { dealId, leg: "TO_HUB" } });
  await db.shipment.update({ where: { id: shipment.id }, data: { status: "DELIVERED", deliveredAt: new Date() } });
  await db.hubInspection.upsert({
    where: { dealId },
    update: {},
    create: { dealId, result: "PENDING" },
  });
  await db.deal.update({ where: { id: dealId }, data: { receivedAt: new Date() } });
  await transitionDeal(dealId, "RECEIVED_AT_HUB", {
    actor: "system",
    type: "RECEIVED_AT_HUB",
    message: "Package received at the FlipLocker hub. Awaiting inspection.",
  });
  const mail = genericEmail(
    `Your card arrived at the hub — deal ${deal.shortCode}`,
    "Your card reached the hub 🏢",
    [
      `<strong>${cardTitle(deal)}</strong> has arrived at the FlipLocker hub and is queued for inspection and documentation.`,
      `You'll be notified as soon as it's verified and on its way to the buyer.`,
    ],
    { label: "View deal", url: `${appUrl()}/seller/deals/${dealId}` }
  );
  await sendEmail({ to: deal.seller.email, dealId, ...mail });
}

/**
 * Leg 2 (hub → buyer). Signature Confirmation is ALWAYS required (A-6).
 * Generated at REPACKED (after a passing inspection + repack).
 */
export async function generateLeg2Label(dealId: string) {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true, buyer: true } });
  if (deal.status !== "REPACKED") throw new Error("Leg 2 label is generated after repack.");

  const existing = await db.shipment.findFirst({ where: { dealId, leg: "TO_BUYER" } });
  const shipment =
    existing ??
    (await db.shipment.create({
      data: { dealId, leg: "TO_BUYER", signatureRequired: true, service: "USPS Priority + Signature" },
    }));

  if (!shipment.labelUrl) {
    const label = await buyLabel({
      shipmentId: shipment.id,
      service: "USPS Priority + Signature",
      signatureRequired: true,
      from: await hubAddress(),
      to: buyerAddress(deal),
    });
    await db.shipment.update({
      where: { id: shipment.id },
      data: {
        provider: label.provider,
        carrier: label.carrier,
        service: label.service,
        trackingNumber: label.trackingNumber,
        labelUrl: label.labelUrl,
        status: "IN_TRANSIT",
        lastScanAt: new Date(),
      },
    });
  }

  const tracking = (await db.shipment.findUniqueOrThrow({ where: { id: shipment.id } })).trackingNumber;
  await transitionDeal(dealId, "IN_TRANSIT_TO_BUYER", {
    actor: "system",
    type: "LEG2_IN_TRANSIT",
    message: `Repacked and shipped to the buyer with Signature Confirmation (${tracking}).`,
  });

  const mail = genericEmail(
    `On its way — deal ${deal.shortCode}`,
    "Your card is on its way ✈️",
    [
      `<strong>${cardTitle(deal)}</strong> passed hub inspection, was documented on video, and is now shipping to you.`,
      `Delivery requires a signature — it is never waived. Tracking: <strong>${tracking}</strong>.`,
    ],
    { label: "Track delivery", url: `${appUrl()}/buyer/deals/${dealId}` }
  );
  await sendEmail({ to: deal.buyerEmail, dealId, ...mail });
  await sendSms({ to: deal.buyer?.phone, dealId, body: `FlipLocker: deal ${deal.shortCode} shipped with signature delivery. Tracking ${tracking}.` });
}

/** Signature-confirmed delivery. Starts the 48-hour buyer review window. */
export async function deliverToBuyer(dealId: string, signedBy: string) {
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId }, include: { seller: true } });
  if (deal.status !== "IN_TRANSIT_TO_BUYER") throw new Error("Deal is not out for delivery.");
  const shipment = await db.shipment.findFirstOrThrow({ where: { dealId, leg: "TO_BUYER" } });
  const config = await getCheckoutConfig();
  const now = new Date();
  const reviewDeadline = hours(config.reviewWindowHours);

  await db.shipment.update({
    where: { id: shipment.id },
    data: { status: "DELIVERED", deliveredAt: now, signedBy },
  });
  await db.deal.update({ where: { id: dealId }, data: { deliveredAt: now, reviewDeadlineAt: reviewDeadline } });
  await transitionDeal(dealId, "DELIVERED_SIGNED", {
    actor: "system",
    type: "DELIVERED_SIGNED",
    message: `Delivered and signed for by ${signedBy}. ${config.reviewWindowHours}-hour buyer review window open.`,
  });

  const buyerMail = genericEmail(
    `Delivered — please review (deal ${deal.shortCode})`,
    "Delivered ✔ — you have 48 hours to review",
    [
      `<strong>${cardTitle(deal)}</strong> was delivered and signed for.`,
      `You have <strong>${config.reviewWindowHours} hours</strong> to approve the card or report an issue. If the window passes with no report, the deal completes automatically and the seller is paid.`,
    ],
    { label: "Review your card", url: `${appUrl()}/buyer/deals/${dealId}` }
  );
  await sendEmail({ to: deal.buyerEmail, dealId, ...buyerMail });

  const sellerMail = genericEmail(
    `Delivered — deal ${deal.shortCode}`,
    "Your card was delivered 📬",
    [
      `<strong>${cardTitle(deal)}</strong> was delivered to the buyer with signature confirmation.`,
      `Your payout of <strong>${formatCents(deal.sellerPayoutCents)}</strong> is released once the ${config.reviewWindowHours}-hour buyer review window closes.`,
    ],
    { label: "View deal", url: `${appUrl()}/seller/deals/${dealId}` }
  );
  await sendEmail({ to: deal.seller.email, dealId, ...sellerMail });
}

export type EventPayload = Prisma.InputJsonValue;
