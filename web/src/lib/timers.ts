import { db } from "@/lib/db";
import { releaseFunds, refundDeal } from "@/lib/settlement";
import { mediaViewKeyDelete } from "@/lib/storage";

// Time-driven transitions. Run by the scheduled job (/api/jobs/tick) and by the
// dev fast-forward control. `forceDealId` expires the given deal's active timer
// immediately (staging demo) instead of waiting for the wall-clock deadline.
interface RunArgs {
  forceDealId?: string;
  now?: Date;
}

export interface TimerRunResult {
  shipTimeouts: number;
  reviewAutoCompletes: number;
  mediaPurged: number;
}

export async function runDueTimers({ forceDealId, now = new Date() }: RunArgs = {}): Promise<TimerRunResult> {
  const result: TimerRunResult = { shipTimeouts: 0, reviewAutoCompletes: 0, mediaPurged: 0 };

  // 1. 72-hour ship timeout: paid but never scanned to the carrier -> refund + cancel.
  const shipOverdue = await db.deal.findMany({
    where: forceDealId
      ? { id: forceDealId, status: "AWAITING_SELLER_SHIPMENT" }
      : { status: "AWAITING_SELLER_SHIPMENT", shipDeadlineAt: { lt: now } },
  });
  for (const deal of shipOverdue) {
    await refundDeal(deal.id, {
      actor: "system",
      reason: "The 72-hour ship window passed with no carrier scan, so the deal auto-cancelled.",
      toStatus: "CANCELLED",
    });
    result.shipTimeouts++;
  }

  // 2. 48-hour review window: delivered & signed, no issue reported -> auto-complete + release.
  const reviewDue = await db.deal.findMany({
    where: forceDealId
      ? { id: forceDealId, status: "DELIVERED_SIGNED" }
      : { status: "DELIVERED_SIGNED", reviewDeadlineAt: { lt: now } },
  });
  for (const deal of reviewDue) {
    await releaseFunds(deal.id, "system", "The 48-hour buyer review window closed with no issue reported");
    result.reviewAutoCompletes++;
  }

  // 3. Media purge: hub video/photos past their purge date.
  const toPurge = await db.dealMedia.findMany({
    where: forceDealId
      ? { dealId: forceDealId, purgeAfter: { not: null }, purgedAt: null }
      : { purgeAfter: { lt: now }, purgedAt: null },
  });
  for (const media of toPurge) {
    await mediaViewKeyDelete(media.storageKey).catch(() => undefined);
    await db.dealMedia.update({ where: { id: media.id }, data: { purgedAt: new Date() } });
    result.mediaPurged++;
  }

  return result;
}
