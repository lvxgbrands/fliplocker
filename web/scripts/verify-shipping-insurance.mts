// End-to-end domain verification for the Shippo + Cabrella adapters. Drives the
// REAL logistics label flow in simulator mode and checks that transit coverage
// is bound + recorded on both legs, plus that the real-mode adapters guard on
// missing credentials. Run: npx tsx scripts/verify-shipping-insurance.mts
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { getCheckoutConfig, getFeeConfig } from "@/lib/config";
import { computeQuote } from "@/lib/fees";
import { newShortCode, newInviteToken } from "@/lib/deals";
import { generateLeg1Label, generateLeg2Label } from "@/lib/logistics";
import { buyLabel } from "@/lib/shipping";
import { quoteInsurancePremiumCents, insureShipment, simulatedInsuranceCents } from "@/lib/insurance";
import type { Prisma } from "@prisma/client";

let passed = 0;
let failed = 0;
function check(label: string, cond: boolean, extra = "") {
  if (cond) {
    passed++;
    console.log(`  ok  ${label}`);
  } else {
    failed++;
    console.error(`FAIL  ${label} ${extra}`);
  }
}

const tag = `shiptest-${Date.now()}`;
const userIds: string[] = [];
let dealId = "";

async function main() {
  const seller = await db.user.create({
    data: { email: `${tag}@example.com`, name: "Ship Seller", passwordHash: await hashPassword("password123"), role: "SELLER", emailVerified: new Date() },
  });
  userIds.push(seller.id);

  const checkout = await getCheckoutConfig();
  const feeConfig = await getFeeConfig("FREE");
  const q = computeQuote({ salePriceCents: 30000, feeConfig, checkout, taxRateBps: 0 });

  const deal = await db.deal.create({
    data: {
      shortCode: newShortCode(),
      sellerId: seller.id,
      buyerEmail: `${tag}-buyer@example.com`,
      inviteToken: newInviteToken(),
      status: "AWAITING_SELLER_SHIPMENT",
      tosAcceptedAt: new Date(),
      paidAt: new Date(),
      sport: "Baseball",
      cardYear: 2011,
      playerName: "Ship Test",
      gradingCompany: "PSA",
      certNumber: "12345678",
      salePriceCents: q.salePriceCents,
      feeTotalCents: q.feeTotalCents,
      feeBuyerCents: q.feeBuyerCents,
      feeSellerCents: q.feeSellerCents,
      shippingCents: q.shippingCents,
      insuranceCents: q.insuranceCents,
      taxCents: q.taxCents,
      buyerTotalCents: q.buyerTotalCents,
      sellerPayoutCents: q.sellerPayoutCents,
      feeConfigSnapshot: q.snapshot as Prisma.InputJsonValue,
    },
  });
  dealId = deal.id;

  // ---- 1. Leg 1 label + coverage ----
  console.log("\n[1] Leg 1 label + insurance (simulator)");
  await generateLeg1Label(dealId);
  const leg1 = await db.shipment.findFirst({ where: { dealId, leg: "TO_HUB" } });
  check("Leg 1 shipment created with a SIM provider label", leg1?.provider === "SIM" && Boolean(leg1?.trackingNumber));
  const ev1 = await db.dealEvent.findMany({ where: { dealId } });
  check("Leg 1 label event logged", ev1.some((e) => e.type === "LEG1_LABEL_CREATED"));
  check("Leg 1 coverage bound + logged (LEG1_INSURED)", ev1.some((e) => e.type === "LEG1_INSURED"));

  // ---- 2. Leg 2 label + coverage ----
  console.log("\n[2] Leg 2 label + insurance (simulator)");
  await db.deal.update({ where: { id: dealId }, data: { status: "REPACKED" } });
  await generateLeg2Label(dealId);
  const leg2 = await db.shipment.findFirst({ where: { dealId, leg: "TO_BUYER" } });
  check("Leg 2 shipment created, signature required", leg2?.signatureRequired === true && Boolean(leg2?.trackingNumber));
  const ev2 = await db.dealEvent.findMany({ where: { dealId } });
  check("Leg 2 coverage bound + logged (LEG2_INSURED)", ev2.some((e) => e.type === "LEG2_INSURED"));
  const afterLeg2 = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  check("deal advanced to IN_TRANSIT_TO_BUYER", afterLeg2.status === "IN_TRANSIT_TO_BUYER");

  // ---- 3. Simulator insurance helpers ----
  console.log("\n[3] simulator insurance helpers");
  check("simulatedInsuranceCents matches the flat formula", simulatedInsuranceCents(30000, 50) === 150);
  const simPremium = await quoteInsurancePremiumCents({ declaredValueCents: 30000, centsPer100: 50 });
  check("quoteInsurancePremiumCents (simulator) returns the formula premium", simPremium === 150, `got ${simPremium}`);
  const simCoverage = await insureShipment({ declaredValueCents: 30000, carrier: "USPS", service: "Ground", trackingNumber: "TEST", leg: "TO_HUB" });
  check("insureShipment (simulator) returns a synthetic SIM certificate", simCoverage.provider === "SIM" && simCoverage.certificateId.startsWith("SIMINS-"));

  // ---- 4. Real-mode adapters guard on missing credentials ----
  console.log("\n[4] real-mode credential guards");
  const prevShip = process.env.SHIPPING_MODE;
  const prevIns = process.env.INSURANCE_MODE;
  delete process.env.SHIPPO_API_KEY;
  delete process.env.CABRELLA_API_KEY;
  process.env.SHIPPING_MODE = "shippo";
  process.env.INSURANCE_MODE = "cabrella";
  let shippoThrew = false;
  try {
    await buyLabel({ shipmentId: "x", service: "USPS Ground Advantage", signatureRequired: false, from: { name: "a", street: "1", city: "b", state: "TX", zip: "75001" }, to: { name: "c", street: "2", city: "d", state: "TX", zip: "78701" } });
  } catch (e) {
    shippoThrew = /SHIPPO_API_KEY/.test((e as Error).message);
  }
  check("buyLabel(shippo) throws without SHIPPO_API_KEY", shippoThrew);
  let cabrellaThrew = false;
  try {
    await quoteInsurancePremiumCents({ declaredValueCents: 30000, centsPer100: 50 });
  } catch (e) {
    cabrellaThrew = /CABRELLA_API_KEY/.test((e as Error).message);
  }
  check("quoteInsurancePremiumCents(cabrella) throws without CABRELLA_API_KEY", cabrellaThrew);
  process.env.SHIPPING_MODE = prevShip;
  process.env.INSURANCE_MODE = prevIns;

  console.log(`\n==== ${passed} passed, ${failed} failed ====`);
}

async function cleanup() {
  await db.shipment.deleteMany({ where: { dealId } });
  await db.dealEvent.deleteMany({ where: { dealId } });
  await db.hubInspection.deleteMany({ where: { dealId } });
  await db.deal.deleteMany({ where: { id: dealId } });
  await db.emailOutbox.deleteMany({ where: { toEmail: { startsWith: tag } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
}

main()
  .catch((e) => {
    console.error(e);
    failed++;
  })
  .finally(async () => {
    await cleanup().catch((e) => console.error("cleanup error", e));
    await db.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  });
