import type { DealMedia, HubInspection } from "@prisma/client";
import { mediaViewUrl } from "@/lib/storage";

// Shows the hub's inspection evidence (video + two photos + tamper seal) to the
// buyer and seller once verification passes. Media auto-purges after 30 days.
export async function HubEvidence({
  media,
  inspection,
}: {
  media: DealMedia[];
  inspection: HubInspection;
}) {
  const video = media.find((m) => m.kind === "HUB_VIDEO" && !m.purgedAt);
  const photos = media.filter((m) => (m.kind === "HUB_PHOTO_1" || m.kind === "HUB_PHOTO_2") && !m.purgedAt);
  const videoUrl = video ? await mediaViewUrl(video.storageKey) : null;
  const photoUrls = await Promise.all(photos.map((p) => mediaViewUrl(p.storageKey)));
  const purged = media.some((m) => m.kind === "HUB_VIDEO" && m.purgedAt);

  return (
    <section className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-brand-900">✔ Verified &amp; documented at the hub</h2>
        {inspection.tamperSealSerial ? (
          <span className="text-xs text-brand-800 font-mono">seal #{inspection.tamperSealSerial}</span>
        ) : null}
      </div>
      {purged ? (
        <p className="text-sm text-ink-500">Inspection video was purged 30 days after delivery.</p>
      ) : (
        <div className="grid sm:grid-cols-[2fr_1fr] gap-3">
          {videoUrl ? (
            <video controls className="w-full rounded-lg border border-brand-200 bg-black aspect-video">
              <source src={videoUrl} />
            </video>
          ) : null}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
            {photoUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`Hub reference ${i + 1}`} className="w-full rounded-lg border border-brand-200 object-cover aspect-square" />
            ))}
          </div>
        </div>
      )}
      {inspection.notes ? <p className="mt-3 text-xs text-ink-500">Notes: {inspection.notes}</p> : null}
    </section>
  );
}
