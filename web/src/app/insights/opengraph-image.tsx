import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "FlipLocker Insights — playbooks for safe card deals";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Insights",
    title: "Playbooks for safe peer-to-peer card deals",
    footer: "fliplocker.app/insights",
  });
}
