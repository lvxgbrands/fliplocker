import { randomBytes, createHmac } from "crypto";

// ---------------------------------------------------------------------------
// Shipping adapter (EasyPost-style) with a simulator.
//
// SHIPPING_MODE:
//   simulator (default), no external calls; generates USPS-style tracking
//     numbers and a label URL that renders locally at /labels/{token}. Carrier
//     scans are advanced by the logistics layer / dev controls / job tick.
//   shippo, real Shippo shipment + label buy (SHIPPO_API_KEY). Tracking comes
//     in via Shippo track webhooks. This is the client's chosen shipping stack.
//   easypost, real EasyPost shipment + label buy (EASYPOST_API_KEY). Kept for
//     parity; Tracking comes in via EasyPost webhooks.
//
// Leg 2 (hub → buyer) ALWAYS requires Signature Confirmation, never waived.
// ---------------------------------------------------------------------------

export type ShippingMode = "simulator" | "shippo" | "easypost";

export function shippingMode(): ShippingMode {
  const mode = (process.env.SHIPPING_MODE || "simulator").toLowerCase();
  if (mode === "shippo") return "shippo";
  if (mode === "easypost") return "easypost";
  return "simulator";
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BoughtLabel {
  provider: "SIM" | "SHIPPO" | "EASYPOST";
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

// Signed token so a label URL can't be forged; label route documents it.
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

  const mode = shippingMode();

  if (mode === "simulator") {
    return {
      provider: "SIM",
      carrier: "USPS",
      service: args.service,
      trackingNumber: simTrackingNumber(),
      labelUrl: `${appUrl}/labels/${args.shipmentId}?t=${labelToken(args.shipmentId)}`,
    };
  }

  if (mode === "shippo") {
    // Shippo path (used once SHIPPO_API_KEY is set). Create a shipment to get
    // rates, then buy the best rate as a transaction. Signature Confirmation is
    // requested via the shipment `extra` when required (always for Leg 2).
    const key = process.env.SHIPPO_API_KEY;
    if (!key) throw new Error("SHIPPO_API_KEY not configured");
    const auth = `ShippoToken ${key}`;
    const shipRes = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        address_from: toShippo(args.from),
        address_to: toShippo(args.to),
        parcels: [{ length: "9", width: "6", height: "2", distance_unit: "in", weight: "6", mass_unit: "oz" }],
        extra: args.signatureRequired ? { signature_confirmation: "STANDARD" } : {},
        async: false,
      }),
    });
    const shipment = await shipRes.json();
    if (!shipRes.ok) throw new Error(`Shippo shipment failed: ${shipRes.status} ${JSON.stringify(shipment)}`);
    const rates: ShippoRate[] = shipment.rates ?? [];
    if (!rates.length) throw new Error("Shippo returned no rates for this shipment");
    // Prefer a rate matching the requested service level, else the cheapest.
    const chosen =
      rates.find((r) => r.servicelevel?.name && args.service.includes(r.servicelevel.name)) ??
      [...rates].sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];
    const txRes = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ rate: chosen.object_id, label_file_type: "PDF", async: false }),
    });
    const tx = await txRes.json();
    if (!txRes.ok || tx.status !== "SUCCESS") {
      throw new Error(`Shippo transaction failed: ${txRes.status} ${JSON.stringify(tx)}`);
    }
    return {
      provider: "SHIPPO",
      carrier: chosen.provider ?? "USPS",
      service: chosen.servicelevel?.name ?? args.service,
      trackingNumber: tx.tracking_number,
      labelUrl: tx.label_url,
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

interface ShippoRate {
  object_id: string;
  amount: string;
  provider?: string;
  servicelevel?: { name?: string };
}

function toShippo(a: Address) {
  return { name: a.name, street1: a.street, city: a.city, state: a.state, zip: a.zip, country: "US" };
}
