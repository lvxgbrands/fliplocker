"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { transitionDeal } from "@/lib/deals";
import { generateLeg2Label } from "@/lib/logistics";
import { refundDeal } from "@/lib/settlement";
import { sendEmail, genericEmail } from "@/lib/email";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

/** Check in an inbound package by tracking number — opens the matching deal. */
export async function checkInAction(formData: FormData) {
  await requireUser("FACILITATOR");
  const tracking = String(formData.get("tracking") || "").replace(/\s/g, "");
  if (!tracking) redirect("/hub?error=Enter+a+tracking+number");

  const shipment = await db.shipment.findFirst({
    where: { leg: "TO_HUB", trackingNumber: { contains: tracking } },
    include: { deal: true },
  });
  if (!shipment) redirect(`/hub?error=${encodeURIComponent("No inbound package matches that tracking number.")}`);
  redirect(`/hub/deals/${shipment.deal.id}`);
}

const inspectionSchema = z.object({
  dealId: z.string().min(1),
  tamperSealSerial: z.string().min(1, "Tamper-seal serial is required").max(60),
  notes: z.string().max(1000).optional(),
  result: z.enum(["PASS", "FAIL"]),
  videoKey: z.string().optional(),
  videoType: z.string().optional(),
  photo1Key: z.string().min(1, "Reference photo 1 is required"),
  photo1Type: z.string().min(1),
  photo2Key: z.string().min(1, "Reference photo 2 is required"),
  photo2Type: z.string().min(1),
});

export type InspectionInput = z.infer<typeof inspectionSchema>;

export async function submitInspectionAction(input: InspectionInput): Promise<{ error?: string }> {
  const user = await requireUser("FACILITATOR");
  const parsed = inspectionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const deal = await db.deal.findUnique({ where: { id: data.dealId }, include: { seller: true } });
  if (!deal) return { error: "Deal not found." };
  if (deal.status !== "RECEIVED_AT_HUB") return { error: "This deal is not awaiting inspection." };

  // Media keys must come from this facilitator's hub upload namespace.
  const photoPrefix = `hub-photos/${user.id}/`;
  const videoPrefix = `hub-videos/${user.id}/`;
  if (!data.photo1Key.startsWith(photoPrefix) || !data.photo2Key.startsWith(photoPrefix)) {
    return { error: "Reference photos could not be verified — please re-upload." };
  }
  if (data.videoKey && !data.videoKey.startsWith(videoPrefix)) {
    return { error: "Inspection video could not be verified — please re-upload." };
  }

  // Bind media.
  const mediaRows: { kind: "HUB_PHOTO_1" | "HUB_PHOTO_2" | "HUB_VIDEO"; storageKey: string; contentType: string }[] = [
    { kind: "HUB_PHOTO_1", storageKey: data.photo1Key, contentType: data.photo1Type },
    { kind: "HUB_PHOTO_2", storageKey: data.photo2Key, contentType: data.photo2Type },
  ];
  if (data.videoKey && data.videoType) {
    mediaRows.push({ kind: "HUB_VIDEO", storageKey: data.videoKey, contentType: data.videoType });
  }
  for (const m of mediaRows) {
    await db.dealMedia.upsert({
      where: { dealId_kind: { dealId: deal.id, kind: m.kind } },
      update: { storageKey: m.storageKey, contentType: m.contentType },
      create: { dealId: deal.id, ...m },
    });
  }

  await db.hubInspection.upsert({
    where: { dealId: deal.id },
    update: {
      facilitatorId: user.id,
      tamperSealSerial: data.tamperSealSerial,
      notes: data.notes || null,
      result: data.result,
      completedAt: new Date(),
    },
    create: {
      dealId: deal.id,
      facilitatorId: user.id,
      tamperSealSerial: data.tamperSealSerial,
      notes: data.notes || null,
      result: data.result,
      checkedInAt: new Date(),
      completedAt: new Date(),
    },
  });

  if (data.result === "PASS") {
    await transitionDeal(deal.id, "VERIFIED", {
      actor: "facilitator",
      type: "VERIFIED",
      message: `Card verified and documented at the hub. Tamper-seal serial ${data.tamperSealSerial} logged.`,
    });
    await db.deal.update({ where: { id: deal.id }, data: { verifiedAt: new Date() } });
    for (const to of [deal.seller.email, deal.buyerEmail]) {
      const mail = genericEmail(
        `Verified & documented — deal ${deal.shortCode}`,
        "Card verified &amp; documented ✔",
        [
          `The card for deal <strong>${deal.shortCode}</strong> was inspected at the FlipLocker hub, documented on video and photos, and its tamper seal logged.`,
          `It will now be repacked and shipped to the buyer with signature confirmation.`,
        ],
        { label: "View deal", url: `${appUrl()}/dashboard` }
      );
      await sendEmail({ to, dealId: deal.id, ...mail });
    }
  } else {
    await transitionDeal(deal.id, "FLAGGED", {
      actor: "facilitator",
      type: "FLAGGED",
      message: `Condition mismatch flagged at the hub. ${data.notes ? `Notes: ${data.notes}` : ""}`,
      payload: { tamperSealSerial: data.tamperSealSerial },
    });
    await db.deal.update({ where: { id: deal.id }, data: { flagReason: data.notes || "Condition mismatch at hub" } });
    // Failed verification → automatic buyer refund (A-5).
    await refundDeal(deal.id, {
      actor: "facilitator",
      reason: "The card did not pass hub verification (condition mismatch).",
      toStatus: "REFUNDED",
    });
  }

  revalidatePath(`/hub/deals/${deal.id}`);
  return {};
}

/** Pass path: repack and generate the Leg 2 signature label to the buyer. */
export async function repackAction(formData: FormData) {
  await requireUser("FACILITATOR");
  const dealId = String(formData.get("dealId") || "");
  const deal = await db.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.status !== "VERIFIED") redirect(`/hub/deals/${dealId}?error=Not+ready+to+repack`);

  await transitionDeal(dealId, "REPACKED", {
    actor: "facilitator",
    type: "REPACKED",
    message: "Card repacked for delivery.",
  });
  await generateLeg2Label(dealId);
  revalidatePath(`/hub/deals/${dealId}`);
  redirect(`/hub?shipped=${deal.shortCode}`);
}
