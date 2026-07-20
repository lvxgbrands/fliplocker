"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getCheckoutConfig } from "@/lib/config";
import { emailConfigured } from "@/lib/email";
import { createOffer, cancelOffer } from "@/lib/offers-service";

const createOfferSchema = z.object({
  sport: z.string().min(1, "Sport is required").max(40),
  cardYear: z.coerce.number().int().min(1900, "Enter a valid year").max(new Date().getFullYear() + 1, "Enter a valid year"),
  playerName: z.string().min(1, "Player name is required").max(120),
  gradingCompany: z.string().min(1, "Grading company is required").max(60),
  grade: z.string().max(20).optional(),
  certNumber: z.string().min(1, "Certificate / serial number is required").max(60),
  description: z.string().max(2000).optional(),
  salePriceDollars: z.coerce.number().positive("Enter the offer price"),
  // Photos are optional for an offer; when present both faces must be supplied.
  frontPhotoKey: z.string().optional(),
  rearPhotoKey: z.string().optional(),
  frontPhotoType: z.string().optional(),
  rearPhotoType: z.string().optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export async function createOfferAction(input: CreateOfferInput): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.emailVerified && emailConfigured()) {
    return { error: "Confirm your email before posting an offer, check your inbox for the link." };
  }

  const parsed = createOfferSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const salePriceCents = Math.round(data.salePriceDollars * 100);
  const checkout = await getCheckoutConfig();
  if (salePriceCents < checkout.minSalePriceCents) {
    return { error: `Offer price must be at least ${(checkout.minSalePriceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}.` };
  }

  // Build the optional media set. Uploaded keys must belong to this seller's
  // presigned namespace, and both faces are required together.
  const media: { kind: "FRONT_PHOTO" | "REAR_PHOTO"; storageKey: string; contentType: string }[] = [];
  const hasFront = Boolean(data.frontPhotoKey && data.frontPhotoType);
  const hasRear = Boolean(data.rearPhotoKey && data.rearPhotoType);
  if (hasFront !== hasRear) {
    return { error: "Add both a front and a rear photo, or leave both out." };
  }
  if (hasFront && hasRear) {
    const prefix = `offer-photos/${user.id}/`;
    if (!data.frontPhotoKey!.startsWith(prefix) || !data.rearPhotoKey!.startsWith(prefix)) {
      return { error: "Photo upload could not be documented, please re-upload." };
    }
    media.push({ kind: "FRONT_PHOTO", storageKey: data.frontPhotoKey!, contentType: data.frontPhotoType! });
    media.push({ kind: "REAR_PHOTO", storageKey: data.rearPhotoKey!, contentType: data.rearPhotoType! });
  }

  const offer = await createOffer(user, {
    sport: data.sport,
    cardYear: data.cardYear,
    playerName: data.playerName,
    gradingCompany: data.gradingCompany,
    grade: data.grade || null,
    certNumber: data.certNumber,
    description: data.description || null,
    salePriceCents,
    media,
  });

  redirect(`/seller/offers?created=${offer.id}`);
}

export async function cancelOfferAction(formData: FormData) {
  const user = await requireUser();
  const offerId = String(formData.get("offerId") || "");
  const result = await cancelOffer(offerId, user.id);
  if (result.error) {
    redirect(`/seller/offers?error=${encodeURIComponent(result.error)}`);
  }
  redirect(`/seller/offers?cancelled=1`);
}
