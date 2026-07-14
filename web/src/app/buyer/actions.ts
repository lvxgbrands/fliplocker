"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { acceptDealAndCreateOrder, declineDeal } from "@/lib/checkout";

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
