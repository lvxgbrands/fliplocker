import { randomBytes, createHmac } from "crypto";

// ---------------------------------------------------------------------------
// Shipping adapter (EasyPost-style) with a simulator.
//
// SHIPPING_MODE:
//   simulator (default) — no external calls; generates USPS-style tracking
//     numbers and a label URL that renders locally at /labels/{token}. Carrier
//     scans are advanced by the logistics layer / dev controls / job tick.
//   easypost — real EasyPost shipment + label buy (EASYPOST_API_KEY). Tracking
//     comes in via EasyPost webhooks. (Wired for parity; used post-credentials.)
//
// Leg 2 (hub → buyer) ALWAYS requires Signature Confirmation — never waived.
// ---------------------------------------------------------------------------

export type ShippingMode = "simulator" | "easypost";

export function shippingMode(): ShippingMode {
  return (process.env.SHIPPING_MODE || "simulator").toLowerCase() === "easypost"
    ? "easypost"
    : "simulator";
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BoughtLabel {
  provider: "SIM" | "EASYPOST";
  carrier: string;
  service: string;
  trackingNumber: string;
  labelUrl: string;
}

// USPS-style 22-digit tracking number (9400 1... IMpb), Luhn-ish but cosmetic.
function simTrackingNumber(): string {
  let n = "9400100000";
  for (let i = 0; i < 12; i++) n += Math.floor(randomBytes(1)[0] / 25.6).toString();
  return n;
}

// Signed token so a label URL can't be forged; label route verifies it.
export function labelToken(shipmentId: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET || "dev")
    .update(`label:${shipmentId}`)
    .digest("hex")
    .slice(0, 24);
}

export function verifyLabelToken(shipmentId: string, token: string): boolean {
  return labelToken(shipmentId) === token;
}

interface BuyArgs {
  shipmentId: string;
  service: string;
  signatureRequired: boolean;
  from: Address;
  to: Address;
}

export async function buyLabel(args: BuyArgs): Promise<BoughtLabel> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (shippingMode() === "simulator") {
    return {
      provider: "SIM",
      carrier: "USPS",
      service: args.service,
      trackingNumber: simTrackingNumber(),
      labelUrl: `${appUrl}/labels/${args.shipmentId}?t=${labelToken(args.shipmentId)}`,
    };
  }

  // EasyPost path (used once EASYPOST_API_KEY is set).
  const key = process.env.EASYPOST_API_KEY;
  if (!key) throw new Error("EASYPOST_API_KEY not configured");
  const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
  const body = {
    shipment: {
      to_address: toEasyPost(args.to),
      from_address: toEasyPost(args.from),
      parcel: { length: 9, width: 6, height: 2, weight: 6 }, // small slab mailer
      options: args.signatureRequired ? { delivery_confirmation: "SIGNATURE" } : {},
    },
  };
  const res = await fetch("https://api.easypost.com/v2/shipments", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const shipment = await res.json();
  if (!res.ok) throw new Error(`EasyPost shipment failed: ${JSON.stringify(shipment)}`);
  // Buy the lowest rate.
  const buy = await fetch(`https://api.easypost.com/v2/shipments/${shipment.id}/buy`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ rate: shipment.lowestRate?.() ?? shipment.rates?.[0] }),
  });
  const bought = await buy.json();
  if (!buy.ok) throw new Error(`EasyPost buy failed: ${JSON.stringify(bought)}`);
  return {
    provider: "EASYPOST",
    carrier: bought.selected_rate?.carrier ?? "USPS",
    service: bought.selected_rate?.service ?? args.service,
    trackingNumber: bought.tracking_code,
    labelUrl: bought.postage_label?.label_url,
  };
}

function toEasyPost(a: Address) {
  return { name: a.name, street1: a.street, city: a.city, state: a.state, zip: a.zip, country: "US" };
}
