import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/seo";

// Allow crawling of the public marketing site; keep the app/portal + API private.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/seller",
          "/buyer",
          "/hub",
          "/dashboard",
          "/dev/",
          "/pay/",
          "/labels/",
          "/login",
          "/register",
          "/invite/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
