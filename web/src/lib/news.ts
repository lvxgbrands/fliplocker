// News adapter — follows the FlipLocker simulator/real pattern used for PayPal,
// shipping, SMS, and email.
//
//   Simulator mode (default): a curated set of REAL sports-card-market headlines
//   with working source URLs, so the ticker looks and functions correctly out of
//   the box even when the build/preview environment blocks outbound fetches.
//
//   Real mode (NEWS_MODE=live): pulls live headlines from an RSS feed
//   (NEWS_RSS_URL) or a NewsAPI-style endpoint (NEWS_API_KEY). Any failure falls
//   back to the seeded headlines so the UI never breaks.

export interface Headline {
  /** Full headline text. */
  title: string;
  /** Substring of `title` to render in the bright brand-blue highlight color. */
  highlight: string;
  /** Canonical link to the source article. */
  url: string;
  /** Publication name shown as a small source tag. */
  source: string;
}

// Curated, real, dated (July 2026) card-market headlines. URLs point to the
// reporting publications. Highlight = the money/percentage/entity to color.
const SEEDED_HEADLINES: Headline[] = [
  {
    title: "Shohei Ohtani one-of-one rookie sells for $2.5M at auction",
    highlight: "$2.5M",
    url: "https://www.mlb.com/news/shohei-ohtani-rookie-card-sells-for-2-5-million-at-auction",
    source: "MLB.com",
  },
  {
    title: "Ohtani Bowman Chrome Superfractor brokered privately for $3.365M",
    highlight: "$3.365M",
    url: "https://sports.yahoo.com/articles/shohei-ohtani-card-sells-record-021047788.html",
    source: "Yahoo Sports",
  },
  {
    title: "Paul Skenes flagship rookie explodes 154% as bulk-grading target",
    highlight: "154%",
    url: "https://www.beckett.com/news/six-early-2026-mlb-rookies-to-chase/",
    source: "Beckett",
  },
  {
    title: "2026 Topps Series 1 Shohei Ohtani #100 jumps 81%",
    highlight: "81%",
    url: "https://www.beckett.com/news/top-selling-2026-topps-and-bowman-shohei-ohtani-cards/",
    source: "Beckett",
  },
  {
    title: "Chase DeLauter Bowman Chrome auto climbs from $185 to $260",
    highlight: "$260",
    url: "https://sports.yahoo.com/articles/mlb-prospect-call-ups-2026-142132599.html",
    source: "Yahoo Sports",
  },
  {
    title: "Munetaka Murakami Topps base scales from $8 to $22 after first MLB homers",
    highlight: "$22",
    url: "https://www.cardboardconnection.com/rookie-card-values",
    source: "Cardboard Connection",
  },
  {
    title: "PSA grades a record 2.21 million cards in a single month",
    highlight: "2.21 million",
    url: "https://cardlines.com/sports-card-grading-trends-this-month/",
    source: "Cardlines",
  },
  {
    title: "1989 Upper Deck Ken Griffey Jr. remains the hobby's most-submitted rookie",
    highlight: "Ken Griffey Jr.",
    url: "https://displayzoneshop.com/blogs/news/most-submitted-baseball-cards-of-all-time",
    source: "Display Zone",
  },
  {
    title: "Judge and Ohtani headline March 2026's million-dollar card sales",
    highlight: "million-dollar",
    url: "https://athlonsports.com/collectibles/march-2026-million-dollar-card-sales-judge-ohtani",
    source: "Athlon Sports",
  },
  {
    title: "LeBron James and Ohtani rookies combine to sell for nearly $5.5 million",
    highlight: "$5.5 million",
    url: "https://www.sportscollectorsdaily.com/key-le-bron-james-shohei-ohtani-rookie-cards-combine-to-sell-for-nearly-5-5-million/",
    source: "Sports Collectors Daily",
  },
];

/** Pull the first money / percentage / number token to highlight in a live title. */
function deriveHighlight(title: string): string {
  const m = title.match(/\$[\d.,]+[MKmk]?|\d+(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?/);
  if (m) return m[0];
  const words = title.split(/\s+/);
  return words.slice(0, 2).join(" ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

/** Minimal RSS/Atom item extractor — no XML dependency. */
function parseRss(xml: string, sourceName: string, limit: number): Headline[] {
  const out: Headline[] = [];
  const items = xml.split(/<item[\s>]|<entry[\s>]/i).slice(1);
  for (const chunk of items) {
    const titleRaw =
      chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
      chunk.match(/<title[^>]*>(.*?)$/i)?.[1] ??
      "";
    const linkRaw =
      chunk.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ??
      chunk.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ??
      "";
    const title = decodeEntities(titleRaw.replace(/<!\[CDATA\[|\]\]>/g, ""));
    const url = decodeEntities(linkRaw.replace(/<!\[CDATA\[|\]\]>/g, ""));
    if (title && url) {
      out.push({ title, highlight: deriveHighlight(title), url, source: sourceName });
    }
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchLiveHeadlines(limit: number): Promise<Headline[]> {
  const rss = process.env.NEWS_RSS_URL;
  const source = process.env.NEWS_SOURCE_NAME || "Card News";
  if (rss) {
    const res = await fetch(rss, {
      // Revalidate at most every 30 minutes; never block a render on a slow feed.
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`RSS ${res.status}`);
    return parseRss(await res.text(), source, limit);
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (apiKey) {
    const q = encodeURIComponent(process.env.NEWS_QUERY || "sports cards");
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`,
      { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
    const data = (await res.json()) as {
      articles?: { title: string; url: string; source?: { name?: string } }[];
    };
    return (data.articles || [])
      .filter((a) => a.title && a.url)
      .slice(0, limit)
      .map((a) => ({
        title: a.title,
        highlight: deriveHighlight(a.title),
        url: a.url,
        source: a.source?.name || source,
      }));
  }

  return [];
}

export async function getNewsHeadlines(limit = 12): Promise<{
  items: Headline[];
  mode: "live" | "simulator";
}> {
  if (process.env.NEWS_MODE === "live") {
    try {
      const live = await fetchLiveHeadlines(limit);
      if (live.length >= 3) return { items: live, mode: "live" };
    } catch {
      // Fall through to the seeded headlines — the ticker must never break.
    }
  }
  return { items: SEEDED_HEADLINES.slice(0, limit), mode: "simulator" };
}
