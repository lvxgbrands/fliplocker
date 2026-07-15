import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getPillar, PILLARS } from "@/lib/platform";

export function generateStaticParams() {
  return PILLARS.map((p) => ({ slug: p.slug }));
}

export const alt = "FlipLocker platform";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pillar = getPillar(slug);
  return renderOgImage({
    eyebrow: pillar?.eyebrow ?? "Platform",
    title: pillar?.title ?? "The FlipLocker platform",
  });
}
