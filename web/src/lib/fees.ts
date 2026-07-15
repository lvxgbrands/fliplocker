import type { CheckoutConfig, FeeConfig } from "@prisma/client";

// ---------------------------------------------------------------------------
// Fee engine.
//
// The service fee is a function of the SALE PRICE ONLY. The card's comp or
// market value is never collected, stored, or used anywhere in this codebase.
//
// Model (per plan tier, rows in fee_config):
//   sale price <  crossoverPriceCents  ->  fee = floorCents (flat)
//   sale price >= crossoverPriceCents  ->  fee = salePrice * percentBps / 10000
// Who pays the fee (buyer / seller / split) is also configuration.
// ---------------------------------------------------------------------------

export interface QuoteInput {
  salePriceCents: number;
  feeConfig: FeeConfig;
  checkout: CheckoutConfig;
  taxRateBps: number; // resolved for the delivery state by getTaxRateBps()
}

export interface Quote {
  salePriceCents: number;
  feeTotalCents: number;
  feeBuyerCents: number;
  feeSellerCents: number;
  shippingCents: number;
  insuranceCents: number;
  taxCents: number;
  buyerTotalCents: number; // sale + buyer fee share + shipping + insurance + tax
  sellerPayoutCents: number; // sale - seller fee share
  platformReceivesCents: number; // fee total only, never the purchase funds
  snapshot: Record<string, unknown>; // config used, stored on the deal record
}

export function computeQuote({ salePriceCents, feeConfig, checkout, taxRateBps }: QuoteInput): Quote {
  if (!Number.isInteger(salePriceCents) || salePriceCents <= 0) {
    throw new Error("Sale price must be a positive whole number of cents.");
  }
  if (salePriceCents < checkout.minSalePriceCents) {
    throw new Error(
      `Sale price must be at least ${formatCents(checkout.minSalePriceCents)}.`
    );
  }

  const feeTotalCents =
    salePriceCents < feeConfig.crossoverPriceCents
      ? feeConfig.floorCents
      : Math.round((salePriceCents * feeConfig.percentBps) / 10000);

  let feeBuyerCents = 0;
  let feeSellerCents = 0;
  switch (feeConfig.whoPays) {
    case "BUYER":
      feeBuyerCents = feeTotalCents;
      break;
    case "SELLER":
      feeSellerCents = feeTotalCents;
      break;
    case "SPLIT":
      feeBuyerCents = Math.ceil(feeTotalCents / 2);
      feeSellerCents = feeTotalCents - feeBuyerCents;
      break;
  }

  const shippingCents = checkout.outboundShippingCents;

  // Pass-through of the carrier's declared-value coverage, per started $100.
  const insuranceCents = checkout.insuranceEnabled
    ? Math.ceil(salePriceCents / 10000) * checkout.insuranceCentsPer100
    : 0;

  // Tax policy is the Client's (CPA-directed). When enabled, tax applies to the
  // platform's service lines only, never to the peer-to-peer card amount.
  const taxableCents = feeBuyerCents + shippingCents;
  const taxCents = taxRateBps > 0 ? Math.round((taxableCents * taxRateBps) / 10000) : 0;

  const buyerTotalCents =
    salePriceCents + feeBuyerCents + shippingCents + insuranceCents + taxCents;
  const sellerPayoutCents = salePriceCents - feeSellerCents;

  return {
    salePriceCents,
    feeTotalCents,
    feeBuyerCents,
    feeSellerCents,
    shippingCents,
    insuranceCents,
    taxCents,
    buyerTotalCents,
    sellerPayoutCents,
    platformReceivesCents: feeTotalCents,
    snapshot: {
      plan: feeConfig.plan,
      floorCents: feeConfig.floorCents,
      percentBps: feeConfig.percentBps,
      crossoverPriceCents: feeConfig.crossoverPriceCents,
      whoPays: feeConfig.whoPays,
      minSalePriceCents: checkout.minSalePriceCents,
      outboundShippingCents: checkout.outboundShippingCents,
      insuranceEnabled: checkout.insuranceEnabled,
      insuranceCentsPer100: checkout.insuranceCentsPer100,
      taxRateBps,
      quotedAt: new Date().toISOString(),
    },
  };
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
