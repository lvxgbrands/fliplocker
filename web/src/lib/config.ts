import { db } from "@/lib/db";
import type { CheckoutConfig, FeeConfig, PlanTier } from "@prisma/client";

// All checkout numbers live in the database (Admin-editable), never in code.
// Seed values are inserted by prisma/seed.ts and can be changed at any time.

export async function getCheckoutConfig(): Promise<CheckoutConfig> {
  const config = await db.checkoutConfig.findUnique({ where: { id: "default" } });
  if (!config) {
    throw new Error(
      "CheckoutConfig missing — run `npm run db:seed` to install the default configuration."
    );
  }
  return config;
}

export async function getFeeConfig(plan: PlanTier): Promise<FeeConfig> {
  const config = await db.feeConfig.findUnique({ where: { plan } });
  if (!config || !config.active) {
    throw new Error(`FeeConfig for plan ${plan} missing or inactive — run \`npm run db:seed\`.`);
  }
  return config;
}

export async function getTaxRateBps(state: string | null): Promise<number> {
  const config = await getCheckoutConfig();
  if (!config.taxEnabled) return 0;
  if (state) {
    const row = await db.taxRate.findUnique({
      where: { configId_state: { configId: config.id, state: state.toUpperCase() } },
    });
    if (row?.active) return row.rateBps;
  }
  return config.defaultTaxBps;
}
