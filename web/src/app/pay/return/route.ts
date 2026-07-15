import { NextRequest, NextResponse } from "next/server";
import { captureAndMarkPaid } from "@/lib/checkout";

// PayPal (and the simulator) redirect the buyer here after approval with
// ?token={orderId}. Capture is idempotent — safe if the webhook won the race.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("token");
  const dealIdParam = req.nextUrl.searchParams.get("dealId");
  const base = process.env.APP_URL || req.nextUrl.origin;

  if (!orderId) {
    return NextResponse.redirect(new URL(`/buyer`, base));
  }
  try {
    const { dealId } = await captureAndMarkPaid(orderId);
    return NextResponse.redirect(new URL(`/buyer/deals/${dealId}?paid=1`, base));
  } catch (e) {
    const msg = encodeURIComponent((e as Error).message);
    const fallback = dealIdParam ? `/buyer/deals/${dealIdParam}?error=${msg}` : `/buyer?error=${msg}`;
    return NextResponse.redirect(new URL(fallback, base));
  }
}
