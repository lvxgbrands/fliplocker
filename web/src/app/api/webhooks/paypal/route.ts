import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { captureAndMarkPaid } from "@/lib/checkout";
import { db } from "@/lib/db";

// PayPal webhook receiver. In sandbox/live the signature is documented with
// PayPal before anything is processed. captureAndMarkPaid is idempotent, so
// the browser return-URL path and this webhook can race safely.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const documented = await verifyWebhookSignature(req.headers, rawBody);
  if (!documented) {
    return NextResponse.json({ error: "signature documentation failed" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const type: string = event.event_type || "";

  if (type === "CHECKOUT.ORDER.APPROVED") {
    const orderId = event.resource?.id;
    if (orderId) await captureAndMarkPaid(orderId).catch(() => undefined);
  } else if (type === "PAYMENT.CAPTURE.COMPLETED") {
    // supplementary_data carries the order id on capture events
    const orderId =
      event.resource?.supplementary_data?.related_ids?.order_id ??
      event.resource?.id;
    if (orderId) {
      const payment = await db.payment.findUnique({ where: { paypalOrderId: orderId } });
      if (payment && payment.state !== "CAPTURED") {
        await captureAndMarkPaid(orderId).catch(() => undefined);
      }
    }
  }

  return NextResponse.json({ received: true });
}
