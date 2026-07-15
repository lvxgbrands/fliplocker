import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Seed values only — every number here is Admin-editable configuration.
// Fee numbers are NOT final; these mirror the client's current calculator
// (Free 4% / $10 floor, Pro 2% / $5 floor) and can be changed without code.

async function main() {
  const checkoutSettings = {
    minSalePriceCents: 16000, // $160 minimum sale price
    outboundShippingCents: 950, // $9.50 flat outbound shipping & signature
    insuranceEnabled: true,
    insuranceCentsPer100: 50, // $0.50 per $100 of sale price (carrier pass-through)
    taxEnabled: false, // per Client tax policy; per-state rows in tax_rates
    defaultTaxBps: 0,
    sellerLabelChargeCents: 500, // $5.00 Leg 1 label charge billed to seller (placeholder)
    // Hub ship-to address (placeholder until Client provides at kickoff).
    hubName: "FlipLocker Verification Hub",
    hubStreet: "2200 Card Vault Way, Suite 10",
    hubCity: "Austin",
    hubState: "TX",
    hubZip: "78701",
    shipTimerHours: 72,
    reviewWindowHours: 48,
    mediaPurgeDays: 30,
  };
  await db.checkoutConfig.upsert({
    where: { id: "default" },
    update: checkoutSettings,
    create: { id: "default", ...checkoutSettings },
  });

  await db.feeConfig.upsert({
    where: { plan: "FREE" },
    update: {},
    create: {
      plan: "FREE",
      floorCents: 1000, // $10 flat below crossover
      percentBps: 400, // 4% at/above crossover
      crossoverPriceCents: 25000, // $250 — where 4% overtakes the $10 floor
      whoPays: "SPLIT",
    },
  });

  await db.feeConfig.upsert({
    where: { plan: "PRO" },
    update: {},
    create: {
      plan: "PRO",
      floorCents: 500, // $5 flat below crossover
      percentBps: 200, // 2% at/above crossover
      crossoverPriceCents: 25000,
      whoPays: "SPLIT",
    },
  });

  // Demo accounts (staging only) — password: fliplocker-demo
  const passwordHash = await bcrypt.hash("fliplocker-demo", 10);
  for (const [email, role, name] of [
    ["seller.demo@fliplocker.app", "SELLER", "Dana Seller"],
    ["buyer.demo@fliplocker.app", "BUYER", "Blake Buyer"],
    ["admin.demo@fliplocker.app", "ADMIN", "Avery Admin"],
    ["hub.demo@fliplocker.app", "FACILITATOR", "Harper Hub"],
  ] as const) {
    await db.user.upsert({
      where: { email },
      update: {},
      create: { email, role, name, passwordHash, emailVerified: new Date() },
    });
  }

  console.log("Seeded checkout config, fee config (FREE/PRO), and demo accounts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
