import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Centralised SEO / AEO / GEO helpers.
//   SEO  — canonical URLs, unique titles/descriptions, Open Graph + Twitter.
//   AEO  — concise, quotable answer blocks + FAQPage structured data.
//   GEO  — Organization/WebSite entities, clear internal linking, llms.txt.
// Production canonical is fixed to the live domain so it never depends on the
// per-environment APP_URL (which is localhost in development).
// ---------------------------------------------------------------------------

export const SITE = {
  name: "FlipLocker",
  url: (process.env.SITE_URL || "https://fliplocker.app").replace(/\/$/, ""),
  domain: "fliplocker.app",
  tagline: "The safe way to close the card deal you made on social.",
  description:
    "FlipLocker is an invitation-only documentation and logistics platform for peer-to-peer graded trading-card deals. Buyer payments are held by our payment processor while every card is documented at our hub and delivered with an insured signature.",
  twitter: "@fliplocker",
  founded: "2025",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Override the OG/Twitter image path (defaults to the route's generated OG image). */
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
  /** Article-only metadata. */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

/**
 * Build a complete, unique Metadata object for a marketing page. Title is
 * templated to "<title> — FlipLocker" via the root layout's title.template,
 * so pass the bare page title here.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex,
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(path);
  const images = image ? [{ url: image }] : undefined; // undefined → inherit route opengraph-image
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url: canonical,
      siteName: SITE.name,
      title,
      description,
      ...(images ? { images } : {}),
      ...(type === "article"
        ? { publishedTime, modifiedTime, authors }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE.twitter,
      ...(images ? { images } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD builders. Each returns a plain object rendered by <JsonLd/>.
// ---------------------------------------------------------------------------

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/brand/fliplocker-logo.svg"),
    description: SITE.description,
    foundingDate: SITE.founded,
    sameAs: [
      "https://instagram.com/fliplocker",
      "https://x.com/fliplocker",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@fliplocker.app",
      url: absoluteUrl("/contact"),
      availableLanguage: ["English"],
    },
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/insights?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqPageLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function articleLd(a: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(a.path) },
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    author: { "@type": "Organization", name: a.authorName, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/fliplocker-logo.svg") },
    },
    image: a.image ? absoluteUrl(a.image) : absoluteUrl("/og" + a.path),
  };
}

/** Product with a set of Offers — used on the pricing page. */
export function productLd(offers: { name: string; price: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "FlipLocker documented card-deal protection",
    description:
      "Documentation, insured logistics, and held payment for peer-to-peer graded trading-card deals.",
    brand: { "@type": "Brand", name: SITE.name },
    url: absoluteUrl("/pricing"),
    offers: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: "USD",
      description: o.description,
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing"),
    })),
  };
}

export function serviceLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "US",
    url: absoluteUrl(path),
  };
}
