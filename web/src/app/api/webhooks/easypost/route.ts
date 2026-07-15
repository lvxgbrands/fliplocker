import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { scanLeg1Accepted, receiveAtHub, deliverToBuyer } from "@/lib/logistics";

// EasyPost tracker webhook receiver (used once SHIPPING_MODE=easypost). Maps
// carrier tracking events to deal transitions, the real-provider equivalent of
// the staging carrier simulator. Signature is documented with EASYPOST_WEBHOOK_SECRET
// when set (HMAC-SHA256 over the raw body, hex, in X-Hmac-Signature).
export async function POST(req: NextRequest) {
  const raw = await req.text();

  const secret = process.env.EASYPOST_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get("x-hmac-signature") || "";
    const expected = "hmac-sha256-hex=" + createHmac("sha256", secret).update(raw, "utf8").digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(raw);
  if (event.description !== "tracker.updated" && event.object !== "Event") {
    return NextResponse.json({ received: true });
  }

  const tracker = event.result ?? event.tracker;
  const trackingCode: string | undefined = tracker?.tracking_code;
  const status: string | undefined = tracker?.status; // pre_transit|in_transit|out_for_delivery|delivered
  if (!trackingCode || !status) return NextResponse.json({ received: true });

  const shipment = await db.shipment.findFirst({
    where: { trackingNumber: trackingCode },
    include: { deal: true },
  });
  if (!shipment) return NextResponse.json({ received: true, matched: false });

  const dealId = shipment.dealId;
  try {
    if (shipment.leg === "TO_HUB") {
      if (status === "in_transit" && shipment.deal.status === "AWAITING_SELLER_SHIPMENT") {
        await scanLeg1Accepted(dealId);
      } else if (status === "delivered" && shipment.deal.status === "IN_TRANSIT_TO_HUB") {
        await receiveAtHub(dealId);
      }
    } else if (shipment.leg === "TO_BUYER" && status === "delivered" && shipment.deal.status === "IN_TRANSIT_TO_BUYER") {
      // EasyPost tracking detail carries a signer when the carrier reports one.
      const signedBy: string = tracker?.signed_by || "Signature confirmed";
      await deliverToBuyer(dealId, signedBy);
    }
  } catch {
    // Idempotency / out-of-order events: ignore transitions that no longer apply.
  }

  return NextResponse.json({ received: true });
}
