import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scanLeg1Accepted, receiveAtHub, deliverToBuyer } from "@/lib/logistics";

// Shippo track webhook receiver (used once SHIPPING_MODE=shippo). Maps carrier
// tracking events to deal transitions, the real-provider equivalent of the
// staging carrier simulator. Shippo does not HMAC-sign webhooks, so when
// SHIPPO_WEBHOOK_SECRET is set we require it as a shared token (?token= or the
// X-Shippo-Secret header), the pattern Shippo documents for securing the URL.
export async function POST(req: NextRequest) {
  const secret = process.env.SHIPPO_WEBHOOK_SECRET;
  if (secret) {
    const provided = req.nextUrl.searchParams.get("token") || req.headers.get("x-shippo-secret") || "";
    if (provided !== secret) {
      return NextResponse.json({ error: "invalid token" }, { status: 400 });
    }
  }

  const event = await req.json().catch(() => null);
  if (!event) return NextResponse.json({ received: true });

  // Shippo delivers { event: "track_updated", data: { tracking_number, tracking_status: { status } } }.
  const data = event.data ?? event;
  const trackingCode: string | undefined = data?.tracking_number;
  const status: string | undefined = (data?.tracking_status?.status ?? data?.tracking_status)?.toString().toUpperCase();
  if (!trackingCode || !status) return NextResponse.json({ received: true });

  const shipment = await db.shipment.findFirst({
    where: { trackingNumber: trackingCode },
    include: { deal: true },
  });
  if (!shipment) return NextResponse.json({ received: true, matched: false });

  const dealId = shipment.dealId;
  try {
    if (shipment.leg === "TO_HUB") {
      if (status === "TRANSIT" && shipment.deal.status === "AWAITING_SELLER_SHIPMENT") {
        await scanLeg1Accepted(dealId);
      } else if (status === "DELIVERED" && shipment.deal.status === "IN_TRANSIT_TO_HUB") {
        await receiveAtHub(dealId);
      }
    } else if (shipment.leg === "TO_BUYER" && status === "DELIVERED" && shipment.deal.status === "IN_TRANSIT_TO_BUYER") {
      const signedBy: string = data?.tracking_status?.substatus?.text || data?.signed_by || "Signature confirmed";
      await deliverToBuyer(dealId, signedBy);
    }
  } catch {
    // Idempotency / out-of-order events: ignore transitions that no longer apply.
  }

  return NextResponse.json({ received: true });
}
