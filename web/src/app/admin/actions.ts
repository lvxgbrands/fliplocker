"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logDealEvent, transitionDeal } from "@/lib/deals";
import { refundDeal, releaseFunds } from "@/lib/settlement";
import { generateLeg1Label } from "@/lib/logistics";

const dollars = z.coerce.number().min(0);
const toCents = (v: number) => Math.round(v * 100);

// ---------- Fee config ----------

const feeSchema = z.object({
  plan: z.enum(["FREE", "PRO"]),
  floorDollars: dollars,
  percent: z.coerce.number().min(0).max(100),
  crossoverDollars: dollars,
  whoPays: z.enum(["BUYER", "SELLER", "SPLIT"]),
});

export async function updateFeeConfigAction(formData: FormData) {
  await requireUser("ADMIN");
  const parsed = feeSchema.safeParse({
    plan: formData.get("plan"),
    floorDollars: formData.get("floorDollars"),
    percent: formData.get("percent"),
    crossoverDollars: formData.get("crossoverDollars"),
    whoPays: formData.get("whoPays"),
  });
  if (!parsed.success) redirect(`/admin/config?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const d = parsed.data;
  await db.feeConfig.update({
    where: { plan: d.plan },
    data: {
      floorCents: toCents(d.floorDollars),
      percentBps: Math.round(d.percent * 100),
      crossoverPriceCents: toCents(d.crossoverDollars),
      whoPays: d.whoPays,
    },
  });
  revalidatePath("/admin/config");
  redirect("/admin/config?saved=fee");
}

// ---------- Checkout config ----------

const checkoutSchema = z.object({
  minDollars: dollars,
  shippingDollars: dollars,
  insuranceEnabled: z.coerce.boolean(),
  insurancePer100Dollars: dollars,
  labelChargeDollars: dollars,
  taxEnabled: z.coerce.boolean(),
  defaultTaxPercent: z.coerce.number().min(0).max(100),
  hubName: z.string().min(1),
  hubStreet: z.string().min(1),
  hubCity: z.string().min(1),
  hubState: z.string().min(1).max(2),
  hubZip: z.string().min(1),
  shipTimerHours: z.coerce.number().int().min(1),
  reviewWindowHours: z.coerce.number().int().min(1),
});

export async function updateCheckoutConfigAction(formData: FormData) {
  await requireUser("ADMIN");
  const parsed = checkoutSchema.safeParse({
    minDollars: formData.get("minDollars"),
    shippingDollars: formData.get("shippingDollars"),
    insuranceEnabled: formData.get("insuranceEnabled") === "on",
    insurancePer100Dollars: formData.get("insurancePer100Dollars"),
    labelChargeDollars: formData.get("labelChargeDollars"),
    taxEnabled: formData.get("taxEnabled") === "on",
    defaultTaxPercent: formData.get("defaultTaxPercent"),
    hubName: formData.get("hubName"),
    hubStreet: formData.get("hubStreet"),
    hubCity: formData.get("hubCity"),
    hubState: formData.get("hubState"),
    hubZip: formData.get("hubZip"),
    shipTimerHours: formData.get("shipTimerHours"),
    reviewWindowHours: formData.get("reviewWindowHours"),
  });
  if (!parsed.success) redirect(`/admin/config?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const d = parsed.data;
  await db.checkoutConfig.update({
    where: { id: "default" },
    data: {
      minSalePriceCents: toCents(d.minDollars),
      outboundShippingCents: toCents(d.shippingDollars),
      insuranceEnabled: d.insuranceEnabled,
      insuranceCentsPer100: toCents(d.insurancePer100Dollars),
      sellerLabelChargeCents: toCents(d.labelChargeDollars),
      taxEnabled: d.taxEnabled,
      defaultTaxBps: Math.round(d.defaultTaxPercent * 100),
      hubName: d.hubName,
      hubStreet: d.hubStreet,
      hubCity: d.hubCity,
      hubState: d.hubState.toUpperCase(),
      hubZip: d.hubZip,
      shipTimerHours: d.shipTimerHours,
      reviewWindowHours: d.reviewWindowHours,
    },
  });
  revalidatePath("/admin/config");
  redirect("/admin/config?saved=checkout");
}

export async function upsertTaxRateAction(formData: FormData) {
  await requireUser("ADMIN");
  const state = String(formData.get("state") || "").toUpperCase().slice(0, 2);
  const percent = Number(formData.get("percent"));
  if (!state || !Number.isFinite(percent)) redirect("/admin/config?error=Invalid+tax+rate");
  await db.taxRate.upsert({
    where: { configId_state: { configId: "default", state } },
    update: { rateBps: Math.round(percent * 100), active: true },
    create: { configId: "default", state, rateBps: Math.round(percent * 100) },
  });
  revalidatePath("/admin/config");
  redirect("/admin/config?saved=tax");
}

// ---------- Users ----------

export async function updateUserAction(formData: FormData) {
  await requireUser("ADMIN");
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "");
  const plan = String(formData.get("plan") || "");
  const roles = ["SELLER", "BUYER", "FACILITATOR", "ADMIN"];
  const plans = ["FREE", "PRO"];
  if (!roles.includes(role) || !plans.includes(plan)) redirect("/admin/users?error=Invalid");
  await db.user.update({
    where: { id: userId },
    data: { role: role as "SELLER" | "BUYER" | "FACILITATOR" | "ADMIN", plan: plan as "FREE" | "PRO" },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

// ---------- Deal overrides ----------

export async function adminCancelDealAction(formData: FormData) {
  await requireUser("ADMIN");
  const dealId = String(formData.get("dealId") || "");
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  const capturedRefundable = ["PAID", "AWAITING_SELLER_SHIPMENT", "IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED", "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FLAGGED"];
  if (capturedRefundable.includes(deal.status)) {
    await refundDeal(dealId, { actor: "admin", reason: "Deal cancelled by an administrator.", toStatus: "REFUNDED" });
  } else {
    await transitionDeal(dealId, "CANCELLED", { actor: "admin", type: "ADMIN_CANCELLED", message: "Deal cancelled by an administrator." });
  }
  revalidatePath(`/admin/deals/${dealId}`);
  redirect(`/admin/deals/${dealId}?done=cancelled`);
}

export async function adminResolveFlaggedAction(formData: FormData) {
  await requireUser("ADMIN");
  const dealId = String(formData.get("dealId") || "");
  const resolution = String(formData.get("resolution") || "");
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (deal.status !== "FLAGGED") redirect(`/admin/deals/${dealId}?error=Not+flagged`);

  if (resolution === "refund") {
    await refundDeal(dealId, { actor: "admin", reason: "Flagged deal resolved with a buyer refund.", toStatus: "REFUNDED" });
  } else if (resolution === "release") {
    // Only valid if the card was already delivered.
    await logDealEvent(dealId, { actor: "admin", type: "FLAG_RESOLVED", message: "Administrator resolved the flag in the seller's favor." });
    // Move back to DELIVERED_SIGNED is not allowed by the guard; release requires it,
    // so for flagged-after-delivery we release directly via settlement bypass note.
    redirect(`/admin/deals/${dealId}?error=${encodeURIComponent("Release-on-flag requires a delivered deal; use manual review.")}`);
  }
  revalidatePath(`/admin/deals/${dealId}`);
  redirect(`/admin/deals/${dealId}?done=resolved`);
}

export async function adminRegenerateLabelAction(formData: FormData) {
  await requireUser("ADMIN");
  const dealId = String(formData.get("dealId") || "");
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (!["PAID", "AWAITING_SELLER_SHIPMENT"].includes(deal.status)) {
    redirect(`/admin/deals/${dealId}?error=Label+only+at+ship+stage`);
  }
  // Clear any existing Leg 1 label and regenerate.
  await db.shipment.deleteMany({ where: { dealId, leg: "TO_HUB" } });
  if (!deal.tosAcceptedAt) await db.deal.update({ where: { id: dealId }, data: { tosAcceptedAt: new Date() } });
  await generateLeg1Label(dealId);
  await logDealEvent(dealId, { actor: "admin", type: "LABEL_REGENERATED", message: "Administrator regenerated the Leg 1 label." });
  revalidatePath(`/admin/deals/${dealId}`);
  redirect(`/admin/deals/${dealId}?done=label`);
}

export async function adminForceCompleteAction(formData: FormData) {
  await requireUser("ADMIN");
  const dealId = String(formData.get("dealId") || "");
  const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (deal.status !== "DELIVERED_SIGNED") redirect(`/admin/deals/${dealId}?error=Not+deliverable`);
  await releaseFunds(dealId, "admin", "Administrator released funds after review");
  redirect(`/admin/deals/${dealId}?done=released`);
}
