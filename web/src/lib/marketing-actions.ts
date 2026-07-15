"use server";

import { subscribeEmail, isValidEmail } from "@/lib/newsletter";
import { sendEmail, genericEmail } from "@/lib/email";

// Server actions for the marketing site: newsletter opt-in + contact form.
// Both follow the outbox/adapter pattern — captured locally in simulator mode,
// sent for real when provider keys are present.

export interface FormState {
  status: "idle" | "success" | "error" | "info";
  message: string;
}

export async function newsletterAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  // Honeypot — bots fill hidden fields; humans don't.
  if (String(formData.get("company") || "").trim()) {
    return { status: "success", message: "You're in. Watch your inbox for FlipLocker updates." };
  }
  const email = String(formData.get("email") || "");
  const source = String(formData.get("source") || "footer");
  const res = await subscribeEmail(email, source);
  if (!res.ok) return { status: "error", message: res.error };
  return res.status === "already"
    ? { status: "info", message: "You're already on the list — thanks for the enthusiasm!" }
    : { status: "success", message: "You're in. Watch your inbox for FlipLocker updates." };
}

export async function contactAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (String(formData.get("company") || "").trim()) {
    return { status: "success", message: "Thanks — your message is on its way. We'll reply within one business day." };
  }
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const topic = String(formData.get("topic") || "General").trim();
  const message = String(formData.get("message") || "").trim();
  const joinList = formData.get("newsletter") === "on";

  if (name.length < 2) return { status: "error", message: "Please enter your name." };
  if (!isValidEmail(email)) return { status: "error", message: "Please enter a valid email address." };
  if (message.length < 10) return { status: "error", message: "Please add a little more detail to your message." };

  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
  const { subject, html } = genericEmail(
    `New contact message — ${topic}`,
    "New contact message",
    [
      `<strong>From:</strong> ${esc(name)} (${esc(email)})`,
      `<strong>Topic:</strong> ${esc(topic)}`,
      `<strong>Message:</strong><br>${esc(message).replace(/\n/g, "<br>")}`,
    ]
  );

  try {
    await sendEmail({ to: "support@fliplocker.app", subject, html });
    if (joinList) await subscribeEmail(email, "contact");
  } catch {
    return { status: "error", message: "We couldn't send that just now. Please try again in a moment." };
  }
  return {
    status: "success",
    message: "Thanks — your message is on its way. We'll reply within one business day.",
  };
}
