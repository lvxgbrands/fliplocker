import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCheckoutConfig, getFeeConfig } from "@/lib/config";
import { computeQuote } from "@/lib/fees";

// Live checkout preview for the Create Deal form. Everything comes from the
// config tables, no numbers in code.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const priceCents = Number(req.nextUrl.searchParams.get("priceCents"));
  const checkout = await getCheckoutConfig();
  const feeConfig = await getFeeConfig(user.plan);

  if (!Number.isInteger(priceCents) || priceCents < checkout.minSalePriceCents) {
    return NextResponse.json(
      { error: "below_minimum", minSalePriceCents: checkout.minSalePriceCents },
      { status: 422 }
    );
  }

  try {
    const quote = computeQuote({ salePriceCents: priceCents, feeConfig, checkout, taxRateBps: 0 });
    return NextResponse.json({ quote, plan: user.plan });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
