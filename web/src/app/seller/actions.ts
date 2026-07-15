"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getCheckoutConfig, getFeeConfig } from "@/lib/config";
import { computeQuote } from "@/lib/fees";
import { newShortCode, newInviteToken, logDealEvent, transitionDeal, cardTitle } from "@/lib/deals";
import { sendEmail, buyerInviteTemplate } from "@/lib/email";
import { generateLeg1Label } from "@/lib/logistics";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

const createDealSchema = z.object({
  sport: z.string().min(1, "Sport is required").max(40),
  cardYear: z.coerce.number().int().min(1900, "Enter a valid year").max(new Date().getFullYear() + 1, "Enter a valid year"),
  playerName: z.string().min(1, "Player name is required").max(120),
  gradingCompany: z.string().min(1, "Grading company is required").max(60),
  certNumber: z.string().min(1, "Certificate / serial number is required").max(60),
  description: z.string().max(2000).optional(),
  salePriceDollars: z.coerce.number().positive("Enter the agreed sale price"),
  buyerEmail: z.string().email("Enter the buyer's email"),
  frontPhotoKey: z.string().min(1, "Front photo is required"),
  rearPhotoKey: z.string().min(1, "Rear photo is required"),
  frontPhotoType: z.string().min(1),
  rearPhotoType: z.string().min(1),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

export async function createDealAction(input: CreateDealInput): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.emailVerified) {
    return { error: "Verify your email before creating a deal — check your inbox for the link." };
  }

  const parsed = createDealSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const buyerEmail = data.buyerEmail.trim().toLowerCase();
  if (buyerEmail === user.email) {
    return { error: "The buyer's email must be different from your own." };
  }

  // Uploaded media must belong to this seller's presigned namespace.
  const prefix = `deal-photos/${user.id}/`;
  if (!data.frontPhotoKey.startsWith(prefix) || !data.rearPhotoKey.startsWith(prefix)) {
    return { error: "Photo upload could not be verified — please re-upload." };
  }

  const salePriceCents = Math.round(data.salePriceDollars * 100);
  const checkout = await getCheckoutConfig();
  const feeConfig = await getFeeConfig(user.plan);

  let quote;
  try {
    quote = computeQuote({ salePriceCents, feeConfig, checkout, taxRateBps: 0 });
  } catch (e) {
    return { error: (e as Error).message };
  }

  const deal = await db.deal.create({
    data: {
      shortCode: newShortCode(),
      sellerId: user.id,
      buyerEmail,
      inviteToken: newInviteToken(),
      status: "CREATED",
      sport: data.sport,
      cardYear: data.cardYear,
      playerName: data.playerName,
      gradingCompany: data.gradingCompany,
      certNumber: data.certNumber,
      description: data.description || null,
      salePriceCents: quote.salePriceCents,
      feeTotalCents: quote.feeTotalCents,
      feeBuyerCents: quote.feeBuyerCents,
      feeSellerCents: quote.feeSellerCents,
      shippingCents: quote.shippingCents,
      insuranceCents: quote.insuranceCents,
      taxCents: quote.taxCents,
      buyerTotalCents: quote.buyerTotalCents,
      sellerPayoutCents: quote.sellerPayoutCents,
      feeConfigSnapshot: quote.snapshot as Prisma.InputJsonValue,
      media: {
        create: [
          { kind: "FRONT_PHOTO", storageKey: data.frontPhotoKey, contentType: data.frontPhotoType },
          { kind: "REAR_PHOTO", storageKey: data.rearPhotoKey, contentType: data.rearPhotoType },
        ],
      },
    },
  });

  await logDealEvent(deal.id, {
    actor: "seller",
    type: "DEAL_CREATED",
    message: `Deal created by ${user.name || user.email} — ${cardTitle(deal)}.`,
  });

  const invite = buyerInviteTemplate({
    url: `${appUrl()}/invite/${deal.inviteToken}`,
    sellerName: user.name || user.email,
    cardTitle: cardTitle(deal),
    salePriceCents: deal.salePriceCents,
    shortCode: deal.shortCode,
  });
  await sendEmail({ to: buyerEmail, ...invite });

  await transitionDeal(deal.id, "BUYER_NOTIFIED", {
    actor: "system",
    message: `Invitation emailed to the buyer (${buyerEmail}).`,
  });

  redirect(`/seller/deals/${deal.id}?created=1`);
}

/**
 * Seller accepts the ToS and generates the prepaid Leg 1 label to the hub.
 * A-9: the ToS acknowledgment checkbox is required before a label is generated.
 */
export async function generateLabelAction(formData: FormData) {
  const user = await requireUser("SELLER");
  const dealId = String(formData.get("dealId") || "");
  const tos = formData.get("tos") === "on";

  const deal = await db.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.sellerId !== user.id) redirect("/seller");
  if (!tos) {
    redirect(`/seller/deals/${dealId}?error=${encodeURIComponent("You must accept the Terms of Service before generating a label.")}`);
  }

  if (!deal.tosAcceptedAt) {
    await db.deal.update({ where: { id: dealId }, data: { tosAcceptedAt: new Date() } });
    await logDealEvent(dealId, {
      actor: "seller",
      type: "TOS_ACCEPTED",
      message: "Seller accepted the Terms of Service.",
    });
  }

  try {
    await generateLeg1Label(dealId);
  } catch (e) {
    redirect(`/seller/deals/${dealId}?error=${encodeURIComponent((e as Error).message)}`);
  }
  revalidatePath(`/seller/deals/${dealId}`);
  redirect(`/seller/deals/${dealId}?labeled=1`);
}
