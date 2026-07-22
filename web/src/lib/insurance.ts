import { randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// Shipment insurance adapter (Cabrella) with a simulator.
//
// INSURANCE_MODE:
//   simulator (default), no external calls; the declared-value premium is the
//     configured flat pass-through (CheckoutConfig.insuranceCentsPer100) and
//     coverage binding is a synthetic certificate, so the app is fully usable
//     with no insurer set up.
//   cabrella, real Cabrella API V2: a live premium quote and per-shipment
//     coverage binding (CABRELLA_API_KEY). This is the client's chosen
//     shipping-insurance provider. (Wired for parity; used post-credentials.)
//
// Scope note: this covers PER-SHIPMENT TRANSIT insurance (both legs). Coverage
// for inventory physically held AT THE HUB is a separate standing commercial
// policy (Hiscox), procured offline, and is intentionally not an integration.
// ---------------------------------------------------------------------------

export type InsuranceMode = "simulator" | "cabrella";

export function insuranceMode(): InsuranceMode {
  return (process.env.INSURANCE_MODE || "simulator").toLowerCase() === "cabrella" ? "cabrella" : "simulator";
}

/** The flat declared-value premium: configured cost per started $100 of value. */
export function simulatedInsuranceCents(declaredValueCents: number, centsPer100: number): number {
  if (declaredValueCents <= 0 || centsPer100 <= 0) return 0;
  return Math.ceil(declaredValueCents / 10000) * centsPer100;
}

function cabrellaConfig(): { key: string; base: string } {
  const key = process.env.CABRELLA_API_KEY;
  if (!key) throw new Error("CABRELLA_API_KEY not configured");
  return { key, base: process.env.CABRELLA_API_BASE || "https://api.cabrella.com" };
}

const usd = (cents: number) => (cents / 100).toFixed(2);

export interface InsuranceQuoteArgs {
  declaredValueCents: number;
  centsPer100: number; // simulator fallback rate (CheckoutConfig.insuranceCentsPer100)
  carrier?: string;
  service?: string;
}

/**
 * Premium to charge the buyer for declared-value coverage. Simulator returns
 * the configured flat pass-through; Cabrella returns a live quote.
 */
export async function quoteInsurancePremiumCents(args: InsuranceQuoteArgs): Promise<number> {
  if (insuranceMode() === "simulator") {
    return simulatedInsuranceCents(args.declaredValueCents, args.centsPer100);
  }
  const { key, base } = cabrellaConfig();
  const res = await fetch(`${base}/v2/quote`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      declared_value: usd(args.declaredValueCents),
      currency: "USD",
      carrier: args.carrier,
      service: args.service,
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Cabrella quote failed: ${res.status} ${JSON.stringify(json)}`);
  return Math.round(parseFloat(json.premium ?? "0") * 100);
}

export interface InsureArgs {
  declaredValueCents: number;
  carrier: string;
  service: string;
  trackingNumber: string;
  leg: "TO_HUB" | "TO_BUYER";
  reference?: string; // deal short code, for the insurer's record
}

export interface Coverage {
  provider: "SIM" | "CABRELLA";
  certificateId: string;
  premiumCents: number;
}

/**
 * Bind transit coverage for one shipment leg. Simulator returns a synthetic
 * certificate; Cabrella binds a real policy against the tracking number.
 */
export async function insureShipment(args: InsureArgs): Promise<Coverage> {
  if (insuranceMode() === "simulator") {
    return {
      provider: "SIM",
      certificateId: `SIMINS-${randomBytes(6).toString("hex").toUpperCase()}`,
      premiumCents: 0,
    };
  }
  const { key, base } = cabrellaConfig();
  const res = await fetch(`${base}/v2/coverage`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      declared_value: usd(args.declaredValueCents),
      currency: "USD",
      carrier: args.carrier,
      service: args.service,
      tracking_number: args.trackingNumber,
      reference: args.reference,
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Cabrella coverage failed: ${res.status} ${JSON.stringify(json)}`);
  return {
    provider: "CABRELLA",
    certificateId: json.certificate_id ?? json.id ?? "",
    premiumCents: Math.round(parseFloat(json.premium ?? "0") * 100),
  };
}
