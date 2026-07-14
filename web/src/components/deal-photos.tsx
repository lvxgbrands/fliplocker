import type { DealMedia } from "@prisma/client";
import { mediaViewUrl } from "@/lib/storage";

export async function DealPhotos({ media }: { media: DealMedia[] }) {
  const photos = await Promise.all(
    media
      .filter((m) => m.kind === "FRONT_PHOTO" || m.kind === "REAR_PHOTO")
      .sort((a) => (a.kind === "FRONT_PHOTO" ? -1 : 1))
      .map(async (m) => ({
        kind: m.kind,
        url: await mediaViewUrl(m.storageKey),
      }))
  );
  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((p) => (
        <figure key={p.kind} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.url}
            alt={p.kind === "FRONT_PHOTO" ? "Card front" : "Card rear"}
            className="w-full aspect-[3/4] object-cover"
          />
          <figcaption className="px-3 py-1.5 text-xs text-slate-400">
            {p.kind === "FRONT_PHOTO" ? "Front" : "Rear"}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
