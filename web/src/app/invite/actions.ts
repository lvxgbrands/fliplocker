"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, getCurrentUser, hashPassword } from "@/lib/auth";
import { logDealEvent } from "@/lib/deals";

async function bindDealToBuyer(dealId: string, userId: string, label: string) {
  await db.deal.update({ where: { id: dealId }, data: { buyerId: userId } });
  await logDealEvent(dealId, {
    actor: "buyer",
    type: "INVITE_CLAIMED",
    message: `Buyer ${label} claimed the invitation and joined the deal.`,
  });
}

/** New buyer: create their account from the invite and bind the deal. */
export async function claimWithNewAccountAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");

  const deal = await db.deal.findUnique({ where: { inviteToken: token } });
  if (!deal || deal.buyerId) redirect(`/invite/${token}`);
  if (name.length < 1) redirect(`/invite/${token}?error=${encodeURIComponent("Name is required")}`);
  if (password.length < 8) {
    redirect(`/invite/${token}?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  const existing = await db.user.findUnique({ where: { email: deal.buyerEmail } });
  if (existing) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  // The invite link was sent to this address — possession verifies the email.
  const user = await db.user.create({
    data: {
      email: deal.buyerEmail,
      name,
      passwordHash: await hashPassword(password),
      role: "BUYER",
      emailVerified: new Date(),
    },
  });
  await bindDealToBuyer(deal.id, user.id, name);
  await createSession(user.id);
  redirect(`/buyer/deals/${deal.id}`);
}

/** Signed-in user whose email matches the invitation claims the deal. */
export async function claimSignedInAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);

  const deal = await db.deal.findUnique({ where: { inviteToken: token } });
  if (!deal) redirect("/dashboard");
  if (deal.buyerId) {
    redirect(deal.buyerId === user.id ? `/buyer/deals/${deal.id}` : "/dashboard");
  }
  if (deal.buyerEmail !== user.email) {
    redirect(`/invite/${token}?error=${encodeURIComponent("This invitation was sent to a different email address.")}`);
  }
  await bindDealToBuyer(deal.id, user.id, user.name || user.email);
  redirect(`/buyer/deals/${deal.id}`);
}
