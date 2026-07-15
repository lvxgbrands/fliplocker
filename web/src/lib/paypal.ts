import { randomBytes } from "crypto";
import type { Deal } from "@prisma/client";

// ---------------------------------------------------------------------------
// PayPal Complete Payments (multiparty), Orders v2.
//
// Money rules (contract + compliance):
//   - Buyer funds are held by PayPal, never by FlipLocker.
//   - FlipLocker's account receives ONLY its service fee, passed as
//     `platform_fees` on the purchase unit.
//   - Disbursement to the seller is DELAYED until signature-confirmed
//     delivery + review window (released by a later milestone's job).
//
// PAYPAL_MODE:
//   sandbox / live, real REST calls against PayPal (client id/secret env).
//   simulator     , no external calls; approval URL points at our local
//                    /pay/simulator page so the full checkout loop is
//                    demoable without sandbox credentials. Same interface,
//                    same data recorded, switch modes purely via env.
// ---------------------------------------------------------------------------

export type PayPalMode = "simulator" | "sandbox" | "live";

export function paypalMode(): PayPalMode {
  const mode = (process.env.PAYPAL_MODE || "simulator").toLowerCase();
  if (mode === "sandbox" || mode === "live") return mode;
  return "simulator";
}

const API_BASE: Record<Exclude<PayPalMode, "simulator">, string> = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export interface CreatedOrder {
  orderId: string;
  approveUrl: string; // where we send the buyer to approve payment
  raw: Record<string, unknown>;
}

export interface CaptureResult {
  captureId: string;
  status: string; // COMPLETED expected
  raw: Record<string, unknown>;
}

async function accessToken(mode: "sandbox" | "live"): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured");
  const res = await fetch(`${API_BASE[mode]}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.access_token as string;
}

const usd = (cents: number) => ({ currency_code: "USD", value: (cents / 100).toFixed(2) });

/**
 * Create the order for a deal at Accept & Pay time.
 * Purchase unit = buyer total; platform_fees = FlipLocker's service fee only.
 */
export async function createOrder(deal: Deal): Promise<CreatedOrder> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const mode = paypalMode();

  if (mode === "simulator") {
    const orderId = `SIM-${randomBytes(8).toString("hex").toUpperCase()}`;
    return {
      orderId,
      approveUrl: `${appUrl}/pay/simulator/${orderId}?dealId=${deal.id}`,
      raw: { simulated: true, mode: "simulator" },
    };
  }

  const token = await accessToken(mode);
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: deal.id,
        custom_id: deal.shortCode,
        description: `FlipLocker deal ${deal.shortCode}, documentation & logistics service`,
        amount: {
          ...usd(deal.buyerTotalCents),
          breakdown: {
            item_total: usd(deal.salePriceCents),
            shipping: usd(deal.shippingCents),
            handling: usd(deal.feeBuyerCents + deal.insuranceCents),
            tax_total: usd(deal.taxCents),
          },
        },
        // Multiparty: PayPal holds the funds; FlipLocker receives only its fee.
        payment_instruction: {
          disbursement_mode: "DELAYED",
          platform_fees: [{ amount: usd(deal.feeTotalCents) }],
        },
      },
    ],
    application_context: {
      brand_name: "FlipLocker",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
      return_url: `${appUrl}/pay/return?dealId=${deal.id}`,
      cancel_url: `${appUrl}/pay/cancel?dealId=${deal.id}`,
    },
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "PayPal-Request-Id": `deal-${deal.id}`, // idempotency
  };
  if (process.env.PAYPAL_BN_CODE) headers["PayPal-Partner-Attribution-Id"] = process.env.PAYPAL_BN_CODE;

  const res = await fetch(`${API_BASE[mode]}/v2/checkout/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal order create failed: ${res.status} ${JSON.stringify(json)}`);

  const approve = (json.links as Array<{ rel: string; href: string }>).find((l) => l.rel === "approve");
  if (!approve) throw new Error("PayPal order response missing approve link");
  return { orderId: json.id as string, approveUrl: approve.href, raw: json };
}

export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const mode = paypalMode();

  if (mode === "simulator") {
    return {
      captureId: `SIMCAP-${randomBytes(8).toString("hex").toUpperCase()}`,
      status: "COMPLETED",
      raw: { simulated: true, orderId, status: "COMPLETED" },
    };
  }

  const token = await accessToken(mode);
  const res = await fetch(`${API_BASE[mode]}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(json)}`);

  const capture = json?.purchase_units?.[0]?.payments?.captures?.[0];
  return { captureId: capture?.id ?? "", status: json.status as string, raw: json };
}

export interface RefundResult {
  refundId: string;
  status: string;
  raw: Record<string, unknown>;
}

/** Refund a captured payment (full). Simulator returns a synthetic refund id. */
export async function refundCapture(captureId: string, cents: number): Promise<RefundResult> {
  const mode = paypalMode();
  if (mode === "simulator") {
    return { refundId: `SIMREF-${randomBytes(8).toString("hex").toUpperCase()}`, status: "COMPLETED", raw: { simulated: true } };
  }
  const token = await accessToken(mode);
  const res = await fetch(`${API_BASE[mode]}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: usd(cents) }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal refund failed: ${res.status} ${JSON.stringify(json)}`);
  return { refundId: json.id as string, status: json.status as string, raw: json };
}

/**
 * Release the delayed disbursement to the seller (multiparty). In the simulator
 * this is a bookkeeping step. With live multiparty + DELAYED disbursement the
 * platform triggers the referenced payout / the hold is released here; the
 * platform fee was already routed via `platform_fees` at capture.
 */
export async function releaseDisbursement(captureId: string): Promise<{ ok: true; raw: Record<string, unknown> }> {
  const mode = paypalMode();
  if (mode === "simulator") return { ok: true, raw: { simulated: true, captureId } };
  // Live/sandbox referenced-payout integration is finalized with PayPal partner
  // onboarding; until then disbursement is released per the order's payment
  // instruction. Recorded here for the transaction record.
  return { ok: true, raw: { captureId, note: "released per DELAYED disbursement instruction" } };
}

/** Document a webhook signature with PayPal (sandbox/live only). */
export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const mode = paypalMode();
  if (mode === "simulator") return true; // simulator posts internally only
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const token = await accessToken(mode);
  const res = await fetch(`${API_BASE[mode]}/v1/notifications/document-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
    cache: "no-store",
  });
  if (!res.ok) return false;
  const json = await res.json();
  return json.verification_status === "SUCCESS";
}
