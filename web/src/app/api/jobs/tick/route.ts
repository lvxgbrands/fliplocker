import { NextRequest, NextResponse } from "next/server";
import { runDueTimers } from "@/lib/timers";

// Scheduled timer processor. Point a cron (Vercel Cron, GitHub Actions, etc.)
// at this endpoint every few minutes. Protected by CRON_SECRET when set.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const result = await runDueTimers();
  return NextResponse.json({ ok: true, ...result });
}

// Convenience GET for the same (also secret-guarded) so a simple cron URL works.
export async function GET(req: NextRequest) {
  return POST(req);
}
