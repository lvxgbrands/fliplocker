import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/seo";
import { STATIC_MARKETING_ROUTES } from "@/lib/nav";
import { ARTICLES } from "@/lib/insights";

// XML sitemap for all indexable marketing routes + Insights articles.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_MARKETING_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/pricing" || path === "/how-it-works" ? 0.9 : 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: absoluteUrl(`/insights/${a.slug}`),
    lastModified: new Date(a.updated || a.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries];
}

export const baseUrl = SITE.url;
