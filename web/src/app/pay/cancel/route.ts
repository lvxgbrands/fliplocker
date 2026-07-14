import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transitionDeal, logDealEvent } from "@/lib/deals";

// Buyer backed out of checkout: void the open order and put the deal back to
// BUYER_NOTIFIED so Accept & Pay can be retried.
export async function GET(req: NextRequest) {
  const dealId = req.nextUrl.searchParams.get("dealId");
  const orderId = req.nextUrl.searchParams.get("token");
  const base = process.env.APP_URL || req.nextUrl.origin;
  if (!dealId) return NextResponse.redirect(new URL("/buyer", base));

  const deal = await db.deal.findUnique({ where: { id: dealId } });
  if (deal?.status === "ACCEPTED") {
    if (orderId) {
      await db.payment.updateMany({
        where: { paypalOrderId: orderId, state: "CREATED" },
        data: { state: "VOIDED" },
      });
    }
    await transitionDeal(dealId, "BUYER_NOTIFIED", {
      actor: "buyer",
      type: "CHECKOUT_CANCELLED",
      message: "Buyer cancelled checkout before paying. The deal is still open to accept.",
    });
  } else if (deal) {
    await logDealEvent(dealId, {
      actor: "buyer",
      type: "CHECKOUT_CANCELLED",
      message: "Checkout window closed without payment.",
    });
  }

  return NextResponse.redirect(new URL(`/buyer/deals/${dealId}?cancelled=1`, base));
}
