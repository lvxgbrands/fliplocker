import { PrismaClient, type DealStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { computeQuote } from "../src/lib/fees";
import { DEMO_EMAILS, DEMO_PASSWORD, demoDataEnabled } from "../src/lib/demo";

// Populates a spread of nine deals across the full lifecycle using the real
// baseball card roster, so the admin dashboard, hub queue, and buyer/seller
// portals look realistic in a live demo. Owned by the standard demo login
// accounts (seller.demo@ / buyer.demo@) so a client signing in as either sees
// their populated portal, and admin.demo@ sees all nine. Idempotent: it wipes
// and recreates only the DEMO- deals, so it is safe to run on every deploy.
const db = new PrismaClient();

// Card art is committed under public/cards and served statically. Demo media
// uses a "demo-public:" storage key that mediaViewUrl resolves to /public,
// so photos render on a read-only serverless filesystem without S3.
function mediaKey(slug: string, face: "" | "-back"): string | null {
  const rel = `cards/${slug}${face}.jpg`;
  if (!fs.existsSync(path.join(process.cwd(), "public", rel))) return null;
  return `demo-public:${rel}`;
}

// slug, player, team, year, grade, cert, priceCents, statLine, status.
// Nine deals across the pipeline; ohtani appears twice (two different cards)
// so all nine lifecycle states are represented with the eight card images.
const ROSTER: [string, string, string, number, string, string, number, string, DealStatus][] = [
  ["griffey", "Ken Griffey Jr.", "Seattle Mariners", 1989, "PSA 8", "24810881", 42500,
    "The Kid: 630 HR, 10x Gold Glove, 1997 AL MVP, HOF 2016 (99.3%).", "COMPLETE"],
  ["ohtani", "Shohei Ohtani", "Los Angeles Dodgers", 2024, "PSA 10", "77120346", 52000,
    "Unanimous 3x MVP; first 50-HR / 50-SB season in MLB history.", "DELIVERED_SIGNED"],
  ["bojackson", "Bo Jackson", "Kansas City Royals", 1989, "PSA 9", "30556214", 18500,
    "Two-sport phenom; 1989 MLB All-Star Game MVP.", "IN_TRANSIT_TO_BUYER"],
  ["ripken", "Cal Ripken Jr.", "Baltimore Orioles", 1989, "PSA 9", "19204773", 16500,
    "The Iron Man: 2,632 consecutive games, 3,184 hits, HOF 2007.", "RECEIVED_AT_HUB"],
  ["murakami", "Munetaka Murakami", "Tokyo (NPB)", 2025, "PSA 9", "88041127", 17500,
    "NPB single-season home-run record holder; among the fastest to 200 HR.", "IN_TRANSIT_TO_HUB"],
  ["griffin", "Konnor Griffin", "Pittsburgh Pirates", 2025, "GEM MT 10", "60050231", 31000,
    "2025 Topps Now rookie; top-of-the-draft phenom prospect.", "AWAITING_SELLER_SHIPMENT"],
  ["misiorowski", "Jacob Misiorowski", "Milwaukee Brewers", 2025, "GEM MT 10", "60050194", 24000,
    "2025 Topps Now rookie; 100+ mph flamethrower.", "PAID"],
  ["valdez", "Esmerlyn Valdez", "Pittsburgh Pirates", 2025, "PSA 8", "60050288", 16000,
    "2025 Topps Now; go-ahead grand slam fuels a doubleheader sweep.", "FLAGGED"],
  ["ohtani", "Shohei Ohtani", "Los Angeles Dodgers", 2023, "PSA 9", "77120912", 34000,
    "2023 flagship; unanimous AL MVP, 44 HR, 1.066 OPS.", "DECLINED"],
];

const CODE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const code = (i: number) => `DEMO-${String(i).padStart(2, "0")}${CODE[i % CODE.length]}${CODE[(i * 7) % CODE.length]}`;

const EVENTS = {
  base: [
    { type: "DEAL_CREATED", actor: "seller", message: "Deal created." },
    { type: "BUYER_NOTIFIED", actor: "system", message: "Invitation emailed to the buyer." },
  ],
  paid: [
    { type: "INVITE_CLAIMED", actor: "buyer", message: "Buyer claimed the invitation." },
    { type: "ACCEPTED", actor: "buyer", message: "Buyer accepted and started checkout." },
    { type: "PAYMENT_CAPTURED", actor: "system", message: "Payment confirmed, held by the payment processor." },
    { type: "AWAITING_SELLER_SHIPMENT", actor: "system", message: "Seller alerted to ship to the hub." },
  ],
  shipped1: [
    { type: "LEG1_LABEL_CREATED", actor: "system", message: "Prepaid Leg 1 label generated." },
    { type: "LEG1_IN_TRANSIT", actor: "system", message: "In transit to the hub." },
  ],
  hub: [{ type: "RECEIVED_AT_HUB", actor: "system", message: "Package received at the hub." }],
  documented: [
    { type: "VERIFIED", actor: "facilitator", message: "Card documented at the hub." },
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
  if (has(["IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"])) e.push(...EVENTS.documented);
  if (has(["DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE"])) e.push(...EVENTS.delivered);
  if (has(["COMPLETE"])) e.push(...EVENTS.released);
  if (status === "FLAGGED") e.push({ type: "FLAGGED", actor: "facilitator", message: "Condition mismatch flagged at the hub." });
  return e;
}

// Removes the demo deals and the shared-password demo accounts. Run when demo
// mode is off so toggling SEED_DEMO=off (or configuring a real admin) on an
// existing database actually clears the demo data rather than leaving it behind.
async function teardown() {
  const { count } = await db.deal.deleteMany({ where: { shortCode: { startsWith: "DEMO-" } } });
  let removedAccounts = 0;
  for (const email of DEMO_EMAILS) {
    try {
      await db.user.delete({ where: { email } });
      removedAccounts++;
    } catch {
      // The account either does not exist or still owns non-demo records; leave
      // it in place rather than failing the build.
    }
  }
  console.log(`Demo mode off: removed ${count} demo deals and ${removedAccounts} demo accounts.`);
}

async function main() {
  if (!demoDataEnabled()) {
    await teardown();
    return;
  }

  const checkout = await db.checkoutConfig.findUnique({ where: { id: "default" } });
  const feeFree = await db.feeConfig.findUnique({ where: { plan: "FREE" } });
  if (!checkout || !feeFree) throw new Error("Run `npm run db:seed` first.");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const seller = await db.user.upsert({
    where: { email: "seller.demo@fliplocker.app" },
    update: {},
    create: { email: "seller.demo@fliplocker.app", name: "Dana Seller", role: "SELLER", passwordHash, emailVerified: new Date() },
  });
  const buyer = await db.user.upsert({
    where: { email: "buyer.demo@fliplocker.app" },
    update: {},
    create: { email: "buyer.demo@fliplocker.app", name: "Blake Buyer", role: "BUYER", passwordHash, emailVerified: new Date() },
  });

  await db.deal.deleteMany({ where: { shortCode: { startsWith: "DEMO-" } } });

  for (let i = 0; i < ROSTER.length; i++) {
    const [slug, player, team, year, grade, cert, priceCents, statLine, status] = ROSTER[i];
    const q = computeQuote({ salePriceCents: priceCents, feeConfig: feeFree, checkout, taxRateBps: 0 });
    const paid = status !== "DECLINED";
    const frontKey = mediaKey(slug, "");
    const rearKey = mediaKey(slug, "-back");

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
          dealId: deal.id, provider: "PAYPAL_SIM", paypalOrderId: `DEMO-ORD-${i}`,
          captureId: `DEMO-CAP-${i}`, state: status === "FLAGGED" ? "REFUNDED" : "CAPTURED",
          grossCents: q.buyerTotalCents, platformFeeCents: q.feeTotalCents, sellerNetCents: q.sellerPayoutCents,
          disbursedAt: status === "COMPLETE" ? new Date() : null,
          refundId: status === "FLAGGED" ? `DEMO-REF-${i}` : null,
        },
      });
    }

    if (["IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE", "FLAGGED", "AWAITING_SELLER_SHIPMENT"].includes(status)) {
      const legStatus = status === "AWAITING_SELLER_SHIPMENT" ? "LABEL_CREATED" : status === "IN_TRANSIT_TO_HUB" ? "IN_TRANSIT" : "DELIVERED";
      await db.shipment.create({ data: { dealId: deal.id, leg: "TO_HUB", carrier: "USPS", service: "USPS Ground Advantage", trackingNumber: `9400100000${1000000000 + i}`, status: legStatus, provider: "SIM" } });
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
  console.log("Demo logins (password fliplocker-demo): seller.demo@fliplocker.app, buyer.demo@fliplocker.app, admin.demo@fliplocker.app");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
