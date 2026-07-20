import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, demoDataEnabled, realAdminConfigured } from "../src/lib/demo";

const db = new PrismaClient();

// Seed values only, every number here is Admin-editable configuration.
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
    hubName: "FlipLocker Documentation Hub",
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
      crossoverPriceCents: 25000, // $250, where 4% overtakes the $10 floor
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

  // Real admin, seeded from secrets. Configuring ADMIN_EMAIL + ADMIN_PASSWORD is
  // the way to have an administrator on a real client launch (no shared password).
  // The env password is the source of truth: it is refreshed on every deploy so
  // rotating the secret takes effect.
  if (realAdminConfigured()) {
    const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
    const name = process.env.ADMIN_NAME?.trim() || "Administrator";
    await db.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash, emailVerified: new Date() },
      create: { email, role: "ADMIN", name, passwordHash, emailVerified: new Date() },
    });
    console.log(`Seeded real admin from env secrets: ${email}`);
  }

  // Demo accounts (sales demo only), shared password: fliplocker-demo. Gated out
  // of a real production, see src/lib/demo.ts. The nine demo deals live in
  // seed-demo.ts, which also tears down this data when demo mode is off.
  if (demoDataEnabled()) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    for (const { email, role, name } of DEMO_ACCOUNTS) {
      await db.user.upsert({
        where: { email },
        update: {},
        create: { email, role, name, passwordHash, emailVerified: new Date() },
      });
    }
    console.log("Seeded checkout config, fee config (FREE/PRO), and demo accounts.");
  } else {
    console.log("Seeded checkout config and fee config (FREE/PRO); demo accounts skipped (SEED_DEMO off).");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
