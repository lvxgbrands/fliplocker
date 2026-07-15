import type { DealEvent, DealStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/deals";
import { formatCents } from "@/lib/fees";

const CHIP_STYLES: Partial<Record<DealStatus, string>> = {
  CREATED: "bg-slate-100 text-slate-700 border-slate-200",
  BUYER_NOTIFIED: "bg-sky-50 text-sky-700 border-sky-200",
  ACCEPTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PAID: "bg-teal-50 text-teal-700 border-teal-200",
  AWAITING_SELLER_SHIPMENT: "bg-teal-50 text-teal-700 border-teal-200",
  DECLINED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  REFUNDED: "bg-amber-50 text-amber-700 border-amber-200",
  FLAGGED: "bg-amber-50 text-amber-800 border-amber-200",
  COMPLETE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusChip({ status }: { status: DealStatus }) {
  const style = CHIP_STYLES[status] ?? "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Timeline({ events }: { events: DealEvent[] }) {
  if (events.length === 0)
    return <p className="text-sm text-slate-500">No activity yet.</p>;
  return (
    <ol className="relative border-s-2 border-teal-100 ml-2 space-y-5">
      {events.map((e, i) => (
        <li key={e.id} className="ms-5">
          <span
            aria-hidden
            className={`absolute -start-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white ${
              i === events.length - 1 ? "bg-teal-500 ring-4 ring-teal-100" : "bg-teal-300"
            }`}
          />
          <p className="text-sm font-medium text-slate-800">{e.message}</p>
          <p className="text-xs text-slate-400">
            {new Date(e.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {" · "}
            {e.actor}
          </p>
        </li>
      ))}
    </ol>
  );
}

export interface BreakdownLine {
  label: string;
  cents: number;
  hint?: string;
  emphasize?: boolean;
}

export function CostBreakdown({ lines, totalLabel, totalCents }: {
  lines: BreakdownLine[];
  totalLabel: string;
  totalCents: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
      {lines
        .filter((l) => l.cents !== 0 || l.emphasize)
        .map((l) => (
          <div key={l.label} className="flex items-baseline justify-between px-4 py-2.5 text-sm">
            <div>
              <span className="text-slate-700">{l.label}</span>
              {l.hint ? <p className="text-xs text-slate-400">{l.hint}</p> : null}
            </div>
            <span className="font-medium tabular-nums">{formatCents(l.cents)}</span>
          </div>
        ))}
      <div className="flex items-baseline justify-between px-4 py-3 text-sm bg-teal-50/60 rounded-b-xl">
        <span className="font-semibold text-teal-900">{totalLabel}</span>
        <span className="font-bold text-lg tabular-nums text-teal-900">{formatCents(totalCents)}</span>
      </div>
    </div>
  );
}
