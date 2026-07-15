import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getArticle, ARTICLES } from "@/lib/insights";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const alt = "FlipLocker Insights article";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  return renderOgImage({
    eyebrow: a?.category ?? "Insights",
    title: a?.title ?? "FlipLocker Insights",
    footer: "fliplocker.app/insights",
  });
}
