import type { DealEvent, DealStatus } from "@prisma/client";
import {
  FilePlus2,
  Mail,
  UserCheck,
  Handshake,
  CreditCard,
  PackageCheck,
  Tag,
  Truck,
  Building2,
  BadgeCheck,
  Package,
  PenLine,
  PartyPopper,
  Ban,
  RotateCcw,
  AlertTriangle,
  CircleDot,
  FileSignature,
  type LucideIcon,
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/deals";
import { formatCents } from "@/lib/fees";

/* ---------- Status chip ---------- */

type ChipTone = "neutral" | "info" | "progress" | "success" | "warn" | "danger" | "done";

const TONE_STYLES: Record<ChipTone, string> = {
  neutral: "bg-ink-100 text-ink-600 border-ink-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  progress: "bg-brand-50 text-brand-700 border-brand-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  done: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const STATUS_TONES: Record<DealStatus, ChipTone> = {
  DRAFT: "neutral",
  CREATED: "neutral",
  BUYER_NOTIFIED: "info",
  ACCEPTED: "info",
  PAID: "progress",
  AWAITING_SELLER_SHIPMENT: "progress",
  IN_TRANSIT_TO_HUB: "progress",
  RECEIVED_AT_HUB: "progress",
  VERIFIED: "success",
  REPACKED: "progress",
  IN_TRANSIT_TO_BUYER: "progress",
  DELIVERED_SIGNED: "success",
  FUNDS_RELEASED: "done",
  COMPLETE: "done",
  DECLINED: "danger",
  CANCELLED: "neutral",
  REFUNDED: "warn",
  FLAGGED: "warn",
};

export function StatusChip({ status }: { status: DealStatus }) {
  const tone = STATUS_TONES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${TONE_STYLES[tone]}`}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
        {tone === "progress" ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
        ) : null}
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ---------- Timeline ---------- */

const EVENT_ICONS: Record<string, LucideIcon> = {
  DEAL_CREATED: FilePlus2,
  BUYER_NOTIFIED: Mail,
  INVITE_CLAIMED: UserCheck,
  ACCEPTED: Handshake,
  CHECKOUT_ORDER_CREATED: CreditCard,
  PAYMENT_CAPTURED: PackageCheck,
  AWAITING_SELLER_SHIPMENT: Package,
  TOS_ACCEPTED: FileSignature,
  LEG1_LABEL_CREATED: Tag,
  LABEL_REGENERATED: Tag,
  LEG1_IN_TRANSIT: Truck,
  RECEIVED_AT_HUB: Building2,
  VERIFIED: BadgeCheck,
  REPACKED: Package,
  LEG2_IN_TRANSIT: Truck,
  DELIVERED_SIGNED: PenLine,
  FUNDS_RELEASED: PartyPopper,
  COMPLETE: PartyPopper,
  DECLINED: Ban,
  CANCELLED: Ban,
  REFUNDED: RotateCcw,
  FLAGGED: AlertTriangle,
  ISSUE_REPORTED: AlertTriangle,
  CHECKOUT_CANCELLED: RotateCcw,
};

export function Timeline({ events }: { events: DealEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-ink-400">No activity yet.</p>;
  return (
    <ol className="relative space-y-0">
      {events.map((e, i) => {
        const Icon = EVENT_ICONS[e.type] ?? CircleDot;
        const isLast = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-gradient-to-b from-brand-200 to-brand-100"
                aria-hidden
              />
            ) : null}
            <span
              aria-hidden
              className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                isLast
                  ? "border-brand-300 bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow"
                  : "border-brand-100 bg-brand-50 text-brand-600"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 pt-1">
              <p className={`text-sm leading-snug ${isLast ? "font-semibold text-ink-950" : "font-medium text-ink-700"}`}>
                {e.message}
              </p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">
                {new Date(e.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                <span className="mx-1.5 text-ink-300">·</span>
                {e.actor}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Cost breakdown ---------- */

export interface BreakdownLine {
  label: string;
  cents: number;
  hint?: string;
  emphasize?: boolean;
}

export function CostBreakdown({
  lines,
  totalLabel,
  totalCents,
}: {
  lines: BreakdownLine[];
  totalLabel: string;
  totalCents: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft">
      <div className="divide-y divide-ink-100">
        {lines
          .filter((l) => l.cents !== 0 || l.emphasize)
          .map((l) => (
            <div key={l.label} className="flex items-baseline justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <span className={`text-sm ${l.emphasize ? "font-semibold text-ink-900" : "text-ink-600"}`}>
                  {l.label}
                </span>
                {l.hint ? <p className="mt-0.5 text-xs leading-snug text-ink-400">{l.hint}</p> : null}
              </div>
              <span className="font-mono text-sm font-medium tabular-nums text-ink-900">
                {formatCents(l.cents)}
              </span>
            </div>
          ))}
      </div>
      <div className="flex items-baseline justify-between bg-gradient-to-r from-brand-50 to-brand-50/40 px-5 py-4">
        <span className="text-sm font-bold text-brand-900">{totalLabel}</span>
        <span
          className="text-xl font-bold tabular-nums text-brand-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatCents(totalCents)}
        </span>
      </div>
    </div>
  );
}
