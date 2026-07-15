import { PrismaClient, type DealStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { computeQuote } from "../src/lib/fees";

// Populates a spread of deals across lifecycle states using the real baseball
// card roster + generated card art, so the admin dashboard, hub queue, and
// portals look realistic in a live demo. Run `npm run seed:demo` AFTER
// `npm run db:seed` (and after `node scripts/generate-card-art.mjs`).
const db = new PrismaClient();

const CARDS_DIR = path.join(process.cwd(), "public", "cards");
const UPLOAD_ROOT = path.join(process.cwd(), ".data", "uploads");

// slug, player, team, year, grade, cert, priceCents, statLine, status
// Real cards from the client's own collection (photos in public/cards/{slug}.jpg).
const ROSTER: [string, string, string, number, string, string, number, string, DealStatus][] = [
  ["griffey", "Ken Griffey Jr.", "Seattle Mariners", 1989, "PSA 8", "24810881", 42500,
    "The Kid — 630 HR, 10x Gold Glove, 1997 AL MVP, HOF 2016 (99.3%).", "COMPLETE"],
  ["ohtani", "Shohei Ohtani", "Los Angeles Dodgers", 2024, "PSA 10", "77120346", 52000,
    "Unanimous 3x MVP; first 50-HR / 50-SB season in MLB history.", "COMPLETE"],
  ["bojackson", "Bo Jackson", "Kansas City Royals", 1989, "PSA 9", "30556214", 18500,
    "Two-sport phenom; 1989 MLB All-Star Game MVP.", "DELIVERED_SIGNED"],
  ["ripken", "Cal Ripken Jr.", "Baltimore Orioles", 1989, "PSA 9", "19204773", 16500,
    "The Iron Man — 2,632 consecutive games, 3,184 hits, HOF 2007.", "IN_TRANSIT_TO_BUYER"],
  ["griffin", "Konnor Griffin", "Pittsburgh Pirates", 2025, "GEM MT 10", "60050231", 31000,
    "2025 Topps Now rookie — top-of-the-draft phenom prospect.", "AWAITING_SELLER_SHIPMENT"],
  ["misiorowski", "Jacob Misiorowski", "Milwaukee Brewers", 2025, "GEM MT 10", "60050194", 24000,
    "2025 Topps Now rookie — 100+ mph flamethrower.", "RECEIVED_AT_HUB"],
  ["murakami", "Munetaka Murakami", "Tokyo (NPB)", 2025, "PSA 9", "88041127", 17500,
    "NPB single-season home-run record holder; among the fastest to 200 HR.", "FLAGGED"],
  ["valdez", "Esmerlyn Valdez", "Pittsburgh Pirates", 2025, "PSA 8", "60050288", 16000,
    "2025 Topps Now — go-ahead grand slam fuels a doubleheader sweep.", "DECLINED"],
];

const CODE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const code = (i: number) => `DEMO-${String(i).padStart(2, "0")}${CODE[i % CODE.length]}${CODE[(i * 7) % CODE.length]}`;

// Copies a real card photo into local media storage so the signed-URL flow
// renders it exactly like a seller upload. face: "" (front) or "-back".
function copyMedia(slug: string, face: "" | "-back"): string | null {
  const src = path.join(CARDS_DIR, `${slug}${face}.jpg`);
  if (!fs.existsSync(src)) return null;
  const key = `deal-photos/demo/${slug}${face}.jpg`;
  const dest = path.join(UPLOAD_ROOT, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return key;
}

const EVENTS = {
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
  const e = [...EVENTS.base];
  const has = (s: DealStatus[]) => s.includes(status);
  if (status === "DECLINED") return [...e, { type: "DECLINED", actor: "buyer", message: "Buyer declined the deal." }];
  if (has(["ACCEPTED", "PAID", "AWAITING_SELLER_SHIPMENT", "IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED"])) e.push(...EVENTS.paid);
  if (has(["IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED"])) e.push(...EVENTS.shipped1);
  if (has(["RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED"])) e.push(...EVENTS.hub);
  if (has(["IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"])) e.push(...EVENTS.verified);
  if (has(["DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"])) e.push(...EVENTS.delivered);
  if (has(["COMPLETE"])) e.push(...EVENTS.released);
  if (status === "FLAGGED") e.push({ type: "FLAGGED", actor: "facilitator", message: "Condition mismatch flagged at the hub." });
  return e;
}

async function main() {
  const checkout = await db.checkoutConfig.findUnique({ where: { id: "default" } });
  const feeFree = await db.feeConfig.findUnique({ where: { plan: "FREE" } });
  if (!checkout || !feeFree) throw new Error("Run `npm run db:seed` first.");

  const passwordHash = await bcrypt.hash("fliplocker-demo", 10);
  const seller = await db.user.upsert({
    where: { email: "demo.seller@fliplocker.app" },
    update: {},
    create: { email: "demo.seller@fliplocker.app", name: "Marcus Vega", role: "SELLER", passwordHash, emailVerified: new Date() },
  });
  const buyer = await db.user.upsert({
    where: { email: "demo.buyer@fliplocker.app" },
    update: {},
    create: { email: "demo.buyer@fliplocker.app", name: "Priya Anand", role: "BUYER", passwordHash, emailVerified: new Date() },
  });

  await db.deal.deleteMany({ where: { shortCode: { startsWith: "DEMO-" } } });

  for (let i = 0; i < ROSTER.length; i++) {
    const [slug, player, team, year, grade, cert, priceCents, statLine, status] = ROSTER[i];
    const q = computeQuote({ salePriceCents: priceCents, feeConfig: feeFree, checkout, taxRateBps: 0 });
    const paid = !["DECLINED"].includes(status);
    const frontKey = copyMedia(slug, "");
    const rearKey = copyMedia(slug, "-back");

    const deal = await db.deal.create({
      data: {
        shortCode: code(i),
        sellerId: seller.id,
        buyerEmail: buyer.email,
        buyerId: buyer.id,
        inviteToken: `demo-invite-${slug}-${i}`,
        status,
        sport: "Baseball",
        cardYear: year,
        playerName: `${player}, ${team}`,
        gradingCompany: "PSA",
        grade,
        certNumber: cert,
        description: statLine,
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
        flagReason: status === "FLAGGED" ? "Corner wear not visible in the listing photos." : null,
        media: {
          create: [
            ...(frontKey ? [{ kind: "FRONT_PHOTO" as const, storageKey: frontKey, contentType: "image/jpeg" }] : []),
            ...(rearKey ? [{ kind: "REAR_PHOTO" as const, storageKey: rearKey, contentType: "image/jpeg" }] : []),
          ],
        },
      },
    });

    await db.dealEvent.createMany({ data: eventsFor(status).map((e) => ({ dealId: deal.id, ...e })) });

    if (paid) {
      await db.payment.create({
        data: {
          dealId: deal.id, provider: "PAYPAL_SIM", paypalOrderId: `DEMO-ORD-${slug}`,
          captureId: `DEMO-CAP-${slug}`, state: status === "FLAGGED" ? "REFUNDED" : "CAPTURED",
          grossCents: q.buyerTotalCents, platformFeeCents: q.feeTotalCents, sellerNetCents: q.sellerPayoutCents,
          disbursedAt: status === "COMPLETE" ? new Date() : null,
          refundId: status === "FLAGGED" ? `DEMO-REF-${slug}` : null,
        },
      });
    }

    if (["IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED", "AWAITING_SELLER_SHIPMENT"].includes(status)) {
      await db.shipment.create({ data: { dealId: deal.id, leg: "TO_HUB", carrier: "USPS", service: "USPS Ground Advantage", trackingNumber: `9400100000${1000000000 + i}`, status: status === "AWAITING_SELLER_SHIPMENT" ? "LABEL_CREATED" : "DELIVERED", provider: "SIM" } });
    }
    if (["IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status)) {
      await db.shipment.create({ data: { dealId: deal.id, leg: "TO_BUYER", carrier: "USPS", service: "USPS Priority + Signature", signatureRequired: true, trackingNumber: `9400100000${2000000000 + i}`, status: status === "IN_TRANSIT_TO_BUYER" ? "IN_TRANSIT" : "DELIVERED", signedBy: ["DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"].includes(status) ? "Demo Recipient" : null, provider: "SIM" } });
    }

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
