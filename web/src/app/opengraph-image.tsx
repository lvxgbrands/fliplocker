import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "FlipLocker — documented, invitation-only card deals";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Private & invitation-only",
    title: "The safe way to close the card deal you made on social.",
  });
}
