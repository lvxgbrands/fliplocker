import type { Deal, DealMedia } from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { mediaViewUrl } from "@/lib/storage";

type SlabDeal = Pick<Deal, "gradingCompany" | "grade" | "certNumber">;

/**
 * Renders the front/rear listing photos in a graded-slab frame: a plate above
 * the image shows the grader, grade, and cert like a slab label, and the photo
 * sits inside a white bevel. Media access is signed-URL only.
 */
/** Small card-front thumbnail for deal-list rows. Falls back to an empty frame. */
export async function DealThumb({ media }: { media: Pick<DealMedia, "kind" | "storageKey">[] }) {
  const front = media.find((m) => m.kind === "FRONT_PHOTO") ?? media.find((m) => m.kind === "REAR_PHOTO");
  const url = front ? await mediaViewUrl(front.storageKey) : null;
  return (
    <span className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-200 bg-ink-100">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}

export async function DealPhotos({ media, deal }: { media: DealMedia[]; deal?: SlabDeal }) {
  const photos = await Promise.all(
    media
      .filter((m) => m.kind === "FRONT_PHOTO" || m.kind === "REAR_PHOTO")
      .sort((a) => (a.kind === "FRONT_PHOTO" ? -1 : 1))
      .map(async (m) => ({ kind: m.kind, url: await mediaViewUrl(m.storageKey) }))
  );

  return (
    <div className={photos.length > 1 ? "grid grid-cols-2 gap-4" : "max-w-[280px]"}>
      {photos.map((p) => (
        <SlabFrame key={p.kind} deal={deal} face={photos.length > 1 ? (p.kind === "FRONT_PHOTO" ? "Front" : "Rear") : undefined}>
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

/** The graded-slab chrome, reusable for real photos or placeholder art. */
export function SlabFrame({
  children,
  deal,
  face,
}: {
  children: React.ReactNode;
  deal?: SlabDeal;
  face?: string;
}) {
  const gradeLabel = deal
    ? [deal.gradingCompany, deal.grade?.replace(new RegExp(`^${deal.gradingCompany}\\s*`, "i"), "")]
        .filter(Boolean)
        .join(" ")
    : null;
  return (
    <figure className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
      {deal ? (
        <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-gradient-to-r from-navy-900 to-navy-800 px-3 py-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" strokeWidth={2.4} />
            {gradeLabel || deal.gradingCompany}
          </span>
          {deal.certNumber ? (
            <span className="font-mono text-[10px] text-brand-200">#{deal.certNumber}</span>
          ) : null}
        </div>
      ) : null}
      <div className="relative aspect-[3/4] bg-ink-100 p-1.5">
        <div className="h-full w-full overflow-hidden rounded-lg">{children}</div>
      </div>
      {face ? (
        <figcaption className="kicker border-t border-ink-100 px-3 py-1.5 text-[10px] text-ink-400">
          {face}
        </figcaption>
      ) : null}
    </figure>
  );
}
