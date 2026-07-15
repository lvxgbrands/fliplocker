"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { devControlsEnabled } from "@/lib/dev";
import { scanLeg1Accepted, receiveAtHub, deliverToBuyer } from "@/lib/logistics";
import { runDueTimers } from "@/lib/timers";

// Simulated carrier scans + timer fast-forward for staging demos. In production
// these transitions come from carrier webhooks and the scheduled timer job.
async function guard() {
  if (!devControlsEnabled()) throw new Error("Dev controls are disabled.");
  await requireUser(); // any signed-in user in a demo environment
}

export async function devScanToHub(formData: FormData) {
  await guard();
  const dealId = String(formData.get("dealId") || "");
  await scanLeg1Accepted(dealId);
  revalidatePath(`/seller/deals/${dealId}`);
  revalidatePath(`/buyer/deals/${dealId}`);
}

export async function devReceiveAtHub(formData: FormData) {
  await guard();
  const dealId = String(formData.get("dealId") || "");
  await receiveAtHub(dealId);
  revalidatePath(`/seller/deals/${dealId}`);
  revalidatePath(`/hub`);
}

export async function devDeliverSigned(formData: FormData) {
  await guard();
  const dealId = String(formData.get("dealId") || "");
  await deliverToBuyer(dealId, "Demo Recipient");
  revalidatePath(`/buyer/deals/${dealId}`);
  revalidatePath(`/seller/deals/${dealId}`);
}

export async function devRunTimers(formData: FormData) {
  await guard();
  const dealId = String(formData.get("dealId") || "");
  // Fast-forward: expire this deal's active timer immediately, then process.
  await runDueTimers({ forceDealId: dealId });
  revalidatePath(`/buyer/deals/${dealId}`);
  revalidatePath(`/seller/deals/${dealId}`);
}
