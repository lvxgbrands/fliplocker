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

// slug, player, team, grade, cert, priceCents, statLine, status
const ROSTER: [string, string, string, string, string, number, string, DealStatus][] = [
  ["johnson", "Walter Johnson", "Washington", "PSA 1", "21076544", 245000,
    "The Big Train — 417 W, 2.17 ERA, 3,509 K, first HOF class of 1936.", "COMPLETE"],
  ["collins", "Eddie Collins", "Philadelphia Athletics", "PSA 2", "60043187", 52500,
    "3,315 career hits, .333 average, 1914 AL MVP, HOF 1939.", "COMPLETE"],
  ["evers", "Johnny Evers", "Chicago Cubs", "PSA 3", "44810226", 43000,
    "1914 NL MVP, of Tinker-to-Evers-to-Chance fame, HOF 1946.", "DELIVERED_SIGNED"],
  ["baker", "Frank 'Home Run' Baker", "Philadelphia Athletics", "PSA 3", "38227911", 38500,
    "4x AL home-run leader 1911-14, .307 career average, HOF 1955.", "IN_TRANSIT_TO_BUYER"],
  ["bender", "Chief Bender", "Philadelphia Athletics", "PSA 3", "55190438", 36000,
    "212 wins, .625 win pct, 3 World Series titles, HOF 1953.", "AWAITING_SELLER_SHIPMENT"],
  ["huggins", "Miller Huggins", "St. Louis", "PSA 3", "29385660", 29000,
    "Led the Yankees to 6 pennants and 3 titles as manager, HOF 1964.", "RECEIVED_AT_HUB"],
  ["chase", "Hal Chase", "New York Highlanders", "PSA 3", "71062945", 21000,
    "Premier defensive first baseman of the deadball era, .291 career.", "FLAGGED"],
  ["seymour", "Cy Seymour", "Cincinnati", "PSA 3", "83415072", 16500,
    "1905 NL batting champion at .377 — outhit Honus Wagner that year.", "DECLINED"],
];

const CODE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const code = (i: number) => `DEMO-${String(i).padStart(2, "0")}${CODE[i % CODE.length]}${CODE[(i * 7) % CODE.length]}`;

function copyMedia(slug: string, face: "front" | "rear"): string | null {
  const srcName = face === "front" ? `${slug}-front.png` : `${slug}-back.png`;
  const src = path.join(CARDS_DIR, srcName);
  if (!fs.existsSync(src)) return null;
  const key = `deal-photos/demo/${slug}-${face}.png`;
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
    const [slug, player, team, grade, cert, priceCents, statLine, status] = ROSTER[i];
    const q = computeQuote({ salePriceCents: priceCents, feeConfig: feeFree, checkout, taxRateBps: 0 });
    const paid = !["DECLINED"].includes(status);
    const frontKey = copyMedia(slug, "front");
    const rearKey = copyMedia(slug, "rear");

    const deal = await db.deal.create({
      data: {
        shortCode: code(i),
        sellerId: seller.id,
        buyerEmail: buyer.email,
        buyerId: buyer.id,
        inviteToken: `demo-invite-${slug}-${i}`,
        status,
        sport: "Baseball",
        cardYear: 1909,
        playerName: `${player} (T206), ${team}`,
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
            ...(frontKey ? [{ kind: "FRONT_PHOTO" as const, storageKey: frontKey, contentType: "image/png" }] : []),
            ...(rearKey ? [{ kind: "REAR_PHOTO" as const, storageKey: rearKey, contentType: "image/png" }] : []),
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
