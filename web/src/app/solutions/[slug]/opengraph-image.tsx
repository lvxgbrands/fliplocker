import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getSolution, SOLUTIONS } from "@/lib/solutions";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export const alt = "FlipLocker solutions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sol = getSolution(slug);
  return renderOgImage({
    eyebrow: sol?.eyebrow ?? "Solutions",
    title: sol?.title ?? "FlipLocker solutions",
  });
}
