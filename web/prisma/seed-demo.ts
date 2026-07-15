import { PrismaClient, type DealStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeQuote } from "../src/lib/fees";

// Populates a spread of deals across lifecycle states so the admin dashboard,
// hub queue, and portals look realistic in a live demo. Additive and
// idempotent-ish (clears prior demo deals by shortCode prefix DEMO-). Run with
// `npm run seed:demo` AFTER `npm run db:seed`.
const db = new PrismaClient();

const PLAYERS: [string, string, string, string][] = [
  // sport, year, player, grader
  ["Basketball", "2018", "Luka Dončić", "PSA"],
  ["Basketball", "2003", "LeBron James", "BGS"],
  ["Baseball", "2011", "Mike Trout", "PSA"],
  ["Football", "2017", "Patrick Mahomes", "SGC"],
  ["Baseball", "2001", "Ichiro Suzuki", "PSA"],
  ["Basketball", "1986", "Michael Jordan", "PSA"],
  ["Football", "2020", "Justin Herbert", "CGC"],
  ["Pokémon / TCG", "1999", "Charizard 1st Edition", "PSA"],
];

const PRICES = [45000, 120000, 38000, 26000, 90000, 250000, 31000, 500000];

// Which statuses to showcase, with a plausible event trail for each.
const SPREAD: DealStatus[] = [
  "COMPLETE",
  "COMPLETE",
  "AWAITING_SELLER_SHIPMENT",
  "RECEIVED_AT_HUB",
  "IN_TRANSIT_TO_BUYER",
  "FLAGGED",
  "DECLINED",
  "DELIVERED_SIGNED",
];

const EVENTS_BY_STATUS: Record<string, { type: string; actor: string; message: string }[]> = {
  base: [
    { type: "DEAL_CREATED", actor: "seller", message: "Deal created." },
    { type: "BUYER_NOTIFIED", actor: "system", message: "Invitation emailed to the buyer." },
  ],
  paid: [
    { type: "INVITE_CLAIMED", actor: "buyer", message: "Buyer claimed the invitation." },
    { type: "ACCEPTED", actor: "buyer", message: "Buyer accepted and started checkout." },
    { type: "PAYMENT_CAPTURED", actor: "system", message: "Payment confirmed — held by the payment processor." },
    { type: "AWAITING_SELLER_SHIPMENT", actor: "system", message: "Seller alerted to ship to the hub." },
  ],
  shipped1: [
    { type: "LEG1_LABEL_CREATED", actor: "system", message: "Prepaid Leg 1 label generated." },
    { type: "LEG1_IN_TRANSIT", actor: "system", message: "In transit to the hub." },
  ],
  hub: [{ type: "RECEIVED_AT_HUB", actor: "system", message: "Package received at the hub." }],
  verified: [
    { type: "VERIFIED", actor: "facilitator", message: "Card verified and documented at the hub." },
    { type: "REPACKED", actor: "facilitator", message: "Card repacked for delivery." },
    { type: "LEG2_IN_TRANSIT", actor: "system", message: "Shipped to the buyer with Signature Confirmation." },
  ],
  delivered: [{ type: "DELIVERED_SIGNED", actor: "system", message: "Delivered and signed for. Review window open." }],
  released: [
    { type: "FUNDS_RELEASED", actor: "system", message: "Seller payout + fee released." },
    { type: "COMPLETE", actor: "system", message: "Deal complete." },
  ],
};

function eventsFor(status: DealStatus) {
  const e = [...EVENTS_BY_STATUS.base];
  const paidStates = ["ACCEPTED", "PAID", "AWAITING_SELLER_SHIPMENT", "IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED"];
  if (status === "DECLINED") { e.push({ type: "DECLINED", actor: "buyer", message: "Buyer declined the deal." }); return e; }
  if (paidStates.includes(status)) e.push(...EVENTS_BY_STATUS.paid);
  if (["IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED"].includes(status)) e.push(...EVENTS_BY_STATUS.shipped1);
  if (["RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED"].includes(status)) e.push(...EVENTS_BY_STATUS.hub);
  if (["IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status)) e.push(...EVENTS_BY_STATUS.verified);
  if (["DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status)) e.push(...EVENTS_BY_STATUS.delivered);
  if (["COMPLETE"].includes(status)) e.push(...EVENTS_BY_STATUS.released);
  if (status === "FLAGGED") e.push({ type: "FLAGGED", actor: "facilitator", message: "Condition mismatch flagged at the hub." });
  return e;
}

const CODE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const code = (i: number) => `DEMO-${String(i).padStart(2, "0")}${CODE[i % CODE.length]}${CODE[(i * 7) % CODE.length]}`;

async function main() {
  const checkout = await db.checkoutConfig.findUnique({ where: { id: "default" } });
  const feeFree = await db.feeConfig.findUnique({ where: { plan: "FREE" } });
  if (!checkout || !feeFree) throw new Error("Run `npm run db:seed` first.");

  const passwordHash = await bcrypt.hash("fliplocker-demo", 10);
  const seller = await db.user.upsert({
    where: { email: "demo.seller@fliplocker.app" },
    update: {},
    create: { email: "demo.seller@fliplocker.app", name: "Demo Seller", role: "SELLER", passwordHash, emailVerified: new Date() },
  });
  const buyer = await db.user.upsert({
    where: { email: "demo.buyer@fliplocker.app" },
    update: {},
    create: { email: "demo.buyer@fliplocker.app", name: "Demo Buyer", role: "BUYER", passwordHash, emailVerified: new Date() },
  });

  // Clear prior demo deals.
  await db.deal.deleteMany({ where: { shortCode: { startsWith: "DEMO-" } } });

  for (let i = 0; i < SPREAD.length; i++) {
    const status = SPREAD[i];
    const [sport, year, player, grader] = PLAYERS[i];
    const q = computeQuote({ salePriceCents: PRICES[i], feeConfig: feeFree, checkout, taxRateBps: 0 });
    const paid = status !== "DECLINED" && status !== "CREATED" && status !== "BUYER_NOTIFIED";
    const buyerJoined = status !== "CREATED";

    const deal = await db.deal.create({
      data: {
        shortCode: code(i),
        sellerId: seller.id,
        buyerEmail: buyer.email,
        buyerId: buyerJoined ? buyer.id : null,
        inviteToken: `demo-invite-${i}-${Date.now()}`,
        status,
        sport, cardYear: Number(year), playerName: player, gradingCompany: grader, certNumber: `${1000000 + i * 7331}`,
        salePriceCents: q.salePriceCents,
        feeTotalCents: q.feeTotalCents, feeBuyerCents: q.feeBuyerCents, feeSellerCents: q.feeSellerCents,
        shippingCents: q.shippingCents, insuranceCents: q.insuranceCents, taxCents: q.taxCents,
        buyerTotalCents: q.buyerTotalCents, sellerPayoutCents: q.sellerPayoutCents,
        feeConfigSnapshot: JSON.parse(JSON.stringify(q.snapshot)),
        tosAcceptedAt: paid ? new Date() : null,
        paidAt: paid ? new Date() : null,
        verifiedAt: ["VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status) ? new Date() : null,
        deliveredAt: ["DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status) ? new Date() : null,
        fundsReleasedAt: status === "COMPLETE" ? new Date() : null,
        completedAt: status === "COMPLETE" ? new Date() : null,
        flagReason: status === "FLAGGED" ? "Surface scratch not shown in listing photos." : null,
        media: {
          create: [
            { kind: "FRONT_PHOTO", storageKey: `demo/front-${i}.png`, contentType: "image/png" },
            { kind: "REAR_PHOTO", storageKey: `demo/rear-${i}.png`, contentType: "image/png" },
          ],
        },
      },
    });

    // Events
    await db.dealEvent.createMany({ data: eventsFor(status).map((e) => ({ dealId: deal.id, ...e })) });

    // Payment for paid states
    if (paid) {
      await db.payment.create({
        data: {
          dealId: deal.id, provider: "PAYPAL_SIM", paypalOrderId: `DEMO-ORD-${i}-${Date.now()}`,
          captureId: `DEMO-CAP-${i}`, state: status === "FLAGGED" ? "REFUNDED" : "CAPTURED",
          grossCents: q.buyerTotalCents, platformFeeCents: q.feeTotalCents, sellerNetCents: q.sellerPayoutCents,
          disbursedAt: status === "COMPLETE" ? new Date() : null,
          refundId: status === "FLAGGED" ? `DEMO-REF-${i}` : null,
        },
      });
    }

    // Shipments
    if (["IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED", "AWAITING_SELLER_SHIPMENT"].includes(status)) {
      await db.shipment.create({ data: { dealId: deal.id, leg: "TO_HUB", carrier: "USPS", service: "USPS Ground Advantage", trackingNumber: `9400100000${1000000000 + i}`, status: status === "AWAITING_SELLER_SHIPMENT" ? "LABEL_CREATED" : "DELIVERED", provider: "SIM" } });
    }
    if (["IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status)) {
      await db.shipment.create({ data: { dealId: deal.id, leg: "TO_BUYER", carrier: "USPS", service: "USPS Priority + Signature", signatureRequired: true, trackingNumber: `9400100000${2000000000 + i}`, status: status === "IN_TRANSIT_TO_BUYER" ? "IN_TRANSIT" : "DELIVERED", signedBy: ["DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status) ? "Demo Recipient" : null, provider: "SIM" } });
    }

    // Hub inspection
    if (["VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status)) {
      await db.hubInspection.create({ data: { dealId: deal.id, tamperSealSerial: `TS-${700000 + i}`, result: "PASS", notes: "Matches listing; cert active in registry.", completedAt: new Date() } });
    } else if (status === "FLAGGED") {
      await db.hubInspection.create({ data: { dealId: deal.id, tamperSealSerial: `TS-${700000 + i}`, result: "FAIL", notes: "Condition mismatch.", completedAt: new Date() } });
    }
  }

  const counts = await db.deal.groupBy({ by: ["status"], _count: { _all: true }, where: { shortCode: { startsWith: "DEMO-" } } });
  console.log("Seeded demo deals:", counts.map((c) => `${c.status}=${c._count._all}`).join(", "));
  console.log("Demo seller: demo.seller@fliplocker.app / fliplocker-demo");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
