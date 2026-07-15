import { db } from "@/lib/db";

// Transactional SMS. With TWILIO_* set, messages go out via Twilio's REST API.
// Without it (staging/demo), every message is captured in sms_outbox and shown
// alongside emails at /dev/mailbox. Same call site, same flow.

interface SendSmsArgs {
  to: string | null | undefined;
  body: string;
  dealId?: string;
}

export async function sendSms({ to, body, dealId }: SendSmsArgs): Promise<void> {
  if (!to) return; // no phone on file — SMS is best-effort, email is the system of record
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  let provider = "dev-outbox";

  if (sid && token && from) {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    if (!res.ok) throw new Error(`Twilio send failed: ${res.status} ${await res.text()}`);
    provider = "twilio";
  }

  await db.smsOutbox.create({ data: { toPhone: to, body, provider, dealId } });
}
