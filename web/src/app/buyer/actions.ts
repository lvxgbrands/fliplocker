"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { acceptDealAndCreateOrder, declineDeal } from "@/lib/checkout";
import { releaseFunds } from "@/lib/settlement";
import { transitionDeal } from "@/lib/deals";
import { sendEmail, genericEmail } from "@/lib/email";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

export async function acceptAndPayAction(formData: FormData) {
  const user = await requireUser();
  const dealId = String(formData.get("dealId") || "");
  let approveUrl: string;
  try {
    approveUrl = await acceptDealAndCreateOrder(dealId, user.id);
  } catch (e) {
    redirect(`/buyer/deals/${dealId}?error=${encodeURIComponent((e as Error).message)}`);
  }
  redirect(approveUrl);
}

export async function declineAction(formData: FormData) {
  const user = await requireUser();
  const dealId = String(formData.get("dealId") || "");
  try {
    await declineDeal(dealId, user.id);
  } catch (e) {
    redirect(`/buyer/deals/${dealId}?error=${encodeURIComponent((e as Error).message)}`);
  }
  redirect(`/buyer/deals/${dealId}?declined=1`);
}

async function ownedDeal(dealId: string, buyerId: string) {
  const deal = await db.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.buyerId !== buyerId) redirect("/buyer");
  return deal;
}

/** Buyer approves within the review window → release funds + complete. */
export async function approveDealAction(formData: FormData) {
  const user = await requireUser();
  const dealId = String(formData.get("dealId") || "");
  const deal = await ownedDeal(dealId, user.id);
  if (deal.status !== "DELIVERED_SIGNED") {
    redirect(`/buyer/deals/${dealId}?error=${encodeURIComponent("This deal can no longer be approved.")}`);
  }
  try {
    await releaseFunds(dealId, "buyer", "Buyer approved the card");
  } catch (e) {
    redirect(`/buyer/deals/${dealId}?error=${encodeURIComponent((e as Error).message)}`);
  }
  redirect(`/buyer/deals/${dealId}?approved=1`);
}

const issueSchema = z.object({ dealId: z.string().min(1), reason: z.string().min(1).max(1000) });

/** Buyer reports an issue within the review window → FLAGGED for admin review. */
export async function reportIssueAction(formData: FormData) {
  const user = await requireUser();
  const parsed = issueSchema.safeParse({
    dealId: formData.get("dealId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) redirect(`/buyer?error=invalid`);
  const { dealId, reason } = parsed.data;
  const deal = await ownedDeal(dealId, user.id);
  if (deal.status !== "DELIVERED_SIGNED") {
    redirect(`/buyer/deals/${dealId}?error=${encodeURIComponent("The review window has closed.")}`);
  }
  await transitionDeal(dealId, "FLAGGED", {
    actor: "buyer",
    type: "ISSUE_REPORTED",
    message: `Buyer reported an issue: ${reason}`,
  });
  await db.deal.update({ where: { id: dealId }, data: { flagReason: reason } });
  const mail = genericEmail(
    `Issue reported, deal ${deal.shortCode}`,
    "An issue was reported on your deal",
    [
      `The buyer reported an issue on deal <strong>${deal.shortCode}</strong> during the review window. FlipLocker will review it.`,
      `Reported reason: ${reason}`,
    ],
    { label: "View deal", url: `${appUrl()}/dashboard` }
  );
  const seller = await db.user.findUnique({ where: { id: deal.sellerId } });
  if (seller) await sendEmail({ to: seller.email, dealId, ...mail });
  redirect(`/buyer/deals/${dealId}?reported=1`);
}
