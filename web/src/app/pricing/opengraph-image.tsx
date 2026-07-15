import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "FlipLocker pricing — Single, Plus & Pro";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Pricing",
    title: "Single, Plus & Pro. One honest per-deal fee.",
  });
}
