import { describe, it, expect } from "vitest";
import { computeQuote, formatCents } from "./fees";
import type { CheckoutConfig, FeeConfig } from "@prisma/client";

// Minimal config fixtures (only the fields computeQuote reads).
const checkout: CheckoutConfig = {
  id: "default",
  minSalePriceCents: 16000,
  outboundShippingCents: 950,
  insuranceEnabled: true,
  insuranceCentsPer100: 50,
  taxEnabled: false,
  defaultTaxBps: 0,
  sellerLabelChargeCents: 500,
  hubName: "Hub",
  hubStreet: "1 St",
  hubCity: "Austin",
  hubState: "TX",
  hubZip: "78701",
  shipTimerHours: 72,
  reviewWindowHours: 48,
  mediaPurgeDays: 30,
  updatedAt: new Date(),
};

function fee(overrides: Partial<FeeConfig>): FeeConfig {
  return {
    id: "f",
    plan: "FREE",
    floorCents: 1000,
    percentBps: 400,
    crossoverPriceCents: 25000,
    whoPays: "SPLIT",
    active: true,
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("computeQuote — fee model", () => {
  it("applies the flat floor below the crossover price", () => {
    const q = computeQuote({ salePriceCents: 20000, feeConfig: fee({ whoPays: "BUYER" }), checkout, taxRateBps: 0 });
    expect(q.feeTotalCents).toBe(1000); // $10 floor, below $250 crossover
  });

  it("applies the percentage at/above the crossover price", () => {
    const q = computeQuote({ salePriceCents: 40000, feeConfig: fee({ whoPays: "BUYER" }), checkout, taxRateBps: 0 });
    expect(q.feeTotalCents).toBe(1600); // 4% of $400
  });

  it("uses the percentage exactly at the crossover boundary", () => {
    const q = computeQuote({ salePriceCents: 25000, feeConfig: fee({ whoPays: "BUYER" }), checkout, taxRateBps: 0 });
    expect(q.feeTotalCents).toBe(1000); // 4% of $250 == $10
  });

  it("charges the buyer when whoPays=BUYER", () => {
    const q = computeQuote({ salePriceCents: 40000, feeConfig: fee({ whoPays: "BUYER" }), checkout, taxRateBps: 0 });
    expect(q.feeBuyerCents).toBe(1600);
    expect(q.feeSellerCents).toBe(0);
    expect(q.sellerPayoutCents).toBe(40000);
  });

  it("charges the seller when whoPays=SELLER", () => {
    const q = computeQuote({ salePriceCents: 40000, feeConfig: fee({ whoPays: "SELLER" }), checkout, taxRateBps: 0 });
    expect(q.feeSellerCents).toBe(1600);
    expect(q.feeBuyerCents).toBe(0);
    expect(q.sellerPayoutCents).toBe(40000 - 1600);
  });

  it("splits the fee with the odd cent going to the buyer", () => {
    // fee = 4% of $250.25 would be non-even; use a value making an odd split.
    const q = computeQuote({ salePriceCents: 25025, feeConfig: fee({ whoPays: "SPLIT" }), checkout, taxRateBps: 0 });
    // 4% of 25025 = 1001 cents; split -> buyer ceil(500.5)=501, seller 500
    expect(q.feeTotalCents).toBe(1001);
    expect(q.feeBuyerCents).toBe(501);
    expect(q.feeSellerCents).toBe(500);
    expect(q.feeBuyerCents + q.feeSellerCents).toBe(q.feeTotalCents);
  });
});

describe("computeQuote — lines & totals", () => {
  it("computes insurance per started $100 of sale price", () => {
    const q = computeQuote({ salePriceCents: 45000, feeConfig: fee({}), checkout, taxRateBps: 0 });
    expect(q.insuranceCents).toBe(Math.ceil(45000 / 10000) * 50); // 5 * 50 = 250
  });

  it("buyer total = sale + buyer fee + shipping + insurance + tax", () => {
    const q = computeQuote({ salePriceCents: 45000, feeConfig: fee({ whoPays: "SPLIT" }), checkout, taxRateBps: 0 });
    const expected = 45000 + q.feeBuyerCents + q.shippingCents + q.insuranceCents + q.taxCents;
    expect(q.buyerTotalCents).toBe(expected);
  });

  it("applies tax only to buyer fee + shipping, never to the card amount", () => {
    const q = computeQuote({ salePriceCents: 45000, feeConfig: fee({ whoPays: "BUYER" }), checkout, taxRateBps: 800 });
    const taxable = q.feeBuyerCents + q.shippingCents;
    expect(q.taxCents).toBe(Math.round((taxable * 800) / 10000));
  });

  it("the platform only ever receives the fee total", () => {
    const q = computeQuote({ salePriceCents: 60000, feeConfig: fee({ whoPays: "SPLIT" }), checkout, taxRateBps: 0 });
    expect(q.platformReceivesCents).toBe(q.feeTotalCents);
  });

  it("omits insurance when disabled", () => {
    const q = computeQuote({ salePriceCents: 45000, feeConfig: fee({}), checkout: { ...checkout, insuranceEnabled: false }, taxRateBps: 0 });
    expect(q.insuranceCents).toBe(0);
  });
});

describe("computeQuote — guards", () => {
  it("rejects a price below the configured minimum", () => {
    expect(() => computeQuote({ salePriceCents: 15999, feeConfig: fee({}), checkout, taxRateBps: 0 })).toThrow();
  });
  it("rejects non-positive / non-integer prices", () => {
    expect(() => computeQuote({ salePriceCents: 0, feeConfig: fee({}), checkout, taxRateBps: 0 })).toThrow();
    expect(() => computeQuote({ salePriceCents: 160.5, feeConfig: fee({}), checkout, taxRateBps: 0 })).toThrow();
  });
});

describe("formatCents", () => {
  it("formats USD", () => {
    expect(formatCents(44100)).toBe("$441.00");
    expect(formatCents(950)).toBe("$9.50");
  });
});
