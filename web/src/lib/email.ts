import { Resend } from "resend";
import { db } from "@/lib/db";

// Transactional email. With RESEND_API_KEY set, mail goes out via Resend.
// Without it (local/staging demo), every message is captured in the
// email_outbox table and viewable at /dev/mailbox — same templates, same flow.

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "FlipLocker <deals@fliplocker.app>";
  let provider = "dev-outbox";

  if (apiKey) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(`Resend send failed: ${error.message}`);
    provider = "resend";
  }

  // Always keep a copy for the transaction record / dev mailbox.
  await db.emailOutbox.create({ data: { toEmail: to, subject, html, provider } });
}

// ---------------------------------------------------------------------------
// Templates — teal/green FlipLocker brand, table-based for email clients.
// Copy rules: the forbidden terms in scripts/check-copy.mjs must never appear;
// funds language is always "held securely by our payment processor".
// ---------------------------------------------------------------------------

const BRAND = {
  teal: "#0d9488",
  tealDark: "#0f766e",
  ink: "#134e4a",
  bg: "#f0fdfa",
};

function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto"><tr><td style="border-radius:10px;background:${BRAND.teal}">
         <a href="${cta.url}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">${cta.label}</a>
       </td></tr></table>
       <p style="font-size:12px;color:#6b7280;text-align:center;word-break:break-all">Or paste this link into your browser:<br>${cta.url}</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:${BRAND.bg}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #ccfbf1">
        <tr><td style="background:${BRAND.tealDark};padding:20px 32px">
          <span style="font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:.3px">🔒 FlipLocker</span>
        </td></tr>
        <tr><td style="padding:32px;font-family:Arial,sans-serif;color:#111827">
          <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND.ink}">${title}</h1>
          ${bodyHtml}
          ${button}
        </td></tr>
        <tr><td style="padding:18px 32px;background:#f9fafb;border-top:1px solid #f3f4f6">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280">
            FlipLocker — verified &amp; documented card deals, invitation-only.
            Buyer payments are held securely by our payment processor until verification and delivery are complete.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export function verifyEmailTemplate(url: string) {
  return {
    subject: "Verify your FlipLocker email",
    html: layout(
      "Confirm your email address",
      `<p style="font-size:14px;line-height:1.6">Welcome to FlipLocker. Click below to verify your email and activate your account.</p>
       <p style="font-size:13px;color:#6b7280">This link expires in 24 hours.</p>`,
      { label: "Verify email", url }
    ),
  };
}

export function passwordResetTemplate(url: string) {
  return {
    subject: "Reset your FlipLocker password",
    html: layout(
      "Password reset",
      `<p style="font-size:14px;line-height:1.6">We received a request to reset your password. If this wasn't you, ignore this email.</p>
       <p style="font-size:13px;color:#6b7280">This link expires in 2 hours.</p>`,
      { label: "Choose a new password", url }
    ),
  };
}

export function buyerInviteTemplate(args: {
  url: string;
  sellerName: string;
  cardTitle: string;
  salePriceCents: number;
  shortCode: string;
}) {
  return {
    subject: `You're invited to a verified card deal — ${args.cardTitle}`,
    html: layout(
      `${args.sellerName} sent you a deal`,
      `<p style="font-size:14px;line-height:1.6">
         <strong>${args.sellerName}</strong> created deal <strong>${args.shortCode}</strong> on FlipLocker for:
       </p>
       <div style="border:1px solid #ccfbf1;background:${BRAND.bg};border-radius:10px;padding:16px;margin:12px 0">
         <p style="margin:0;font-size:15px;font-weight:bold;color:${BRAND.ink}">${args.cardTitle}</p>
         <p style="margin:6px 0 0;font-size:14px">Agreed price: <strong>${money(args.salePriceCents)}</strong></p>
       </div>
       <p style="font-size:14px;line-height:1.6">Review the card photos and full cost breakdown, then accept or decline.
       Your payment is held securely by our payment processor while the card is verified and documented at the FlipLocker hub — it isn't released to the seller until delivery is complete.</p>`,
      { label: "Review this deal", url: args.url }
    ),
  };
}

export function paymentReceivedSellerTemplate(args: {
  url: string;
  cardTitle: string;
  shortCode: string;
  sellerPayoutCents: number;
}) {
  return {
    subject: `Payment received — ship now (deal ${args.shortCode})`,
    html: layout(
      "Payment received — time to ship 📦",
      `<p style="font-size:14px;line-height:1.6">The buyer's payment for <strong>${args.cardTitle}</strong> (deal <strong>${args.shortCode}</strong>) has cleared and is held securely by our payment processor.</p>
       <p style="font-size:14px;line-height:1.6">Your payout of <strong>${money(args.sellerPayoutCents)}</strong> is released after the card is verified at the hub and delivery is signed for.</p>
       <p style="font-size:14px;line-height:1.6"><strong>Next step:</strong> your prepaid Leg&nbsp;1 shipping label to the FlipLocker hub is being prepared. A 72-hour ship window applies once the label is issued.</p>`,
      { label: "Open your deal", url: args.url }
    ),
  };
}

export function buyerReceiptTemplate(args: {
  url: string;
  cardTitle: string;
  shortCode: string;
  buyerTotalCents: number;
}) {
  return {
    subject: `Payment confirmed — deal ${args.shortCode}`,
    html: layout(
      "Payment confirmed ✔",
      `<p style="font-size:14px;line-height:1.6">Your payment of <strong>${money(args.buyerTotalCents)}</strong> for <strong>${args.cardTitle}</strong> is confirmed and held securely by our payment processor.</p>
       <p style="font-size:14px;line-height:1.6">The seller has been alerted to ship the card to the FlipLocker hub, where it will be verified and documented on video before it heads your way with signature delivery. Follow every step on your deal timeline.</p>`,
      { label: "Track your deal", url: args.url }
    ),
  };
}

export function dealDeclinedSellerTemplate(args: { url: string; cardTitle: string; shortCode: string }) {
  return {
    subject: `Deal ${args.shortCode} was declined`,
    html: layout(
      "The buyer declined this deal",
      `<p style="font-size:14px;line-height:1.6">The buyer declined <strong>${args.cardTitle}</strong> (deal <strong>${args.shortCode}</strong>). No payment was collected. You can create a new deal at any time.</p>`,
      { label: "View deal", url: args.url }
    ),
  };
}
