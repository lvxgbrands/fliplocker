import type { MediaKind, OfferEvent, OfferStatus } from "@prisma/client";
import { ShieldCheck, Video, PenLine, Lock, ImageOff } from "lucide-react";
import { mediaViewUrl } from "@/lib/storage";
import { OFFER_STATUS_LABELS } from "@/lib/offers";
import { SlabFrame } from "@/components/deal-photos";

/* ---------- Status chip ---------- */

type ChipTone = "live" | "info" | "sold" | "neutral";

const TONE_STYLES: Record<ChipTone, string> = {
  live: "bg-brand-50 text-brand-700 border-brand-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  sold: "bg-emerald-50 text-emerald-800 border-emerald-200",
  neutral: "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_TONES: Record<OfferStatus, ChipTone> = {
  OPEN: "live",
  RESERVED: "info",
  CLAIMED: "sold",
  CANCELLED: "neutral",
};

export function OfferStatusChip({ status }: { status: OfferStatus }) {
  const tone = STATUS_TONES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${TONE_STYLES[tone]}`}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
        {tone === "live" ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
        ) : null}
      </span>
      {OFFER_STATUS_LABELS[status]}
    </span>
  );
}

/* ---------- Photos (front / rear) with a graceful placeholder ---------- */

type SlabInfo = { gradingCompany: string; grade: string | null; certNumber: string };

export async function OfferPhotos({
  media,
  offer,
}: {
  media: Pick<OfferMediaShape, "kind" | "storageKey">[];
  offer: SlabInfo;
}) {
  const photos = await Promise.all(
    media
      .filter((m) => m.kind === "FRONT_PHOTO" || m.kind === "REAR_PHOTO")
      .sort((a) => (a.kind === "FRONT_PHOTO" ? -1 : 1))
      .map(async (m) => ({ kind: m.kind, url: await mediaViewUrl(m.storageKey) }))
  );

  if (photos.length === 0) {
    return (
      <div className="max-w-[280px]">
        <SlabFrame deal={offer}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-50 text-ink-300">
            <ImageOff className="h-8 w-8" strokeWidth={1.6} aria-hidden />
            <span className="text-xs font-medium">Photos to follow</span>
          </div>
        </SlabFrame>
      </div>
    );
  }

  return (
    <div className={photos.length > 1 ? "grid grid-cols-2 gap-4" : "max-w-[280px]"}>
      {photos.map((p) => (
        <SlabFrame key={p.kind} deal={offer} face={photos.length > 1 ? (p.kind === "FRONT_PHOTO" ? "Front" : "Rear") : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.url}
            alt={p.kind === "FRONT_PHOTO" ? "Card front" : "Card rear"}
            className="h-full w-full object-cover"
          />
        </SlabFrame>
      ))}
    </div>
  );
}

type OfferMediaShape = { kind: MediaKind; storageKey: string };

/* ---------- Small front thumbnail for list rows ---------- */

export async function OfferThumb({ media }: { media: Pick<OfferMediaShape, "kind" | "storageKey">[] }) {
  const front = media.find((m) => m.kind === "FRONT_PHOTO") ?? media.find((m) => m.kind === "REAR_PHOTO");
  const url = front ? await mediaViewUrl(front.storageKey) : null;
  return (
    <span className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-200 bg-ink-100">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageOff className="h-4 w-4 text-ink-300" strokeWidth={1.6} aria-hidden />
      )}
    </span>
  );
}

/* ---------- Buyer protection explainer (reused on the public trust page) ---------- */

const PROTECTION = [
  {
    icon: Lock,
    title: "Your payment is held safely",
    body: "You pay our payment processor, not the seller. The money is held securely until the card is documented and delivered, then released.",
  },
  {
    icon: Video,
    title: "Documented on video at the hub",
    body: "The card ships to the FlipLocker hub first, where it is documented on video and photographed before it heads to you.",
  },
  {
    icon: PenLine,
    title: "Signature-confirmed delivery",
    body: "Leg two to your door always ships with Signature Confirmation, so a real hand-off is on record.",
  },
  {
    icon: ShieldCheck,
    title: "You approve before funds release",
    body: "After signed delivery you get a review window. Funds only reach the seller once you are satisfied.",
  },
];

export function OfferProtection() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROTECTION.map((p) => (
        <div key={p.title} className="flex gap-3 rounded-2xl border border-ink-200/70 bg-white p-4 shadow-soft">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <p.icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">{p.title}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{p.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Compact public activity list (from offer_events) ---------- */

export function OfferActivity({ events }: { events: Pick<OfferEvent, "id" | "type" | "message" | "createdAt">[] }) {
  if (events.length === 0) return null;
  return (
    <ol className="space-y-2.5">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-2.5 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
          <span className="text-ink-600">
            {e.message}
            <span className="ml-1.5 text-[11px] uppercase tracking-wide text-ink-400">
              {new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
