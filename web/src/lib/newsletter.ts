import { db } from "@/lib/db";

// Newsletter capture, adapter/simulator pattern (like PayPal, shipping, email).
//   Simulator (default): subscribers are captured in the newsletter_subscribers
//   table. Real mode: also added to a Resend audience when RESEND_API_KEY and
//   RESEND_AUDIENCE_ID are set. A provider hiccup never fails the signup.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type SubscribeResult =
  | { ok: true; status: "subscribed" | "already" }
  | { ok: false; error: string };

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

export async function subscribeEmail(rawEmail: string, source = "footer"): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, error: "Please enter a valid email address." };

  // Real mode, add to a Resend audience when configured.
  let provider = "dev-outbox";
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (apiKey && audienceId) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.contacts.create({ email, audienceId, unsubscribed: false });
      provider = "resend";
    } catch {
      // Capture locally instead of failing the user's signup.
    }
  }

  try {
    const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.status !== "subscribed") {
        await db.newsletterSubscriber.update({
          where: { email },
          data: { status: "subscribed", provider, source },
        });
      }
      return { ok: true, status: "already" };
    }
    await db.newsletterSubscriber.create({ data: { email, source, provider } });
    return { ok: true, status: "subscribed" };
  } catch {
    return { ok: false, error: "Something went wrong on our end. Please try again." };
  }
}
