// Mobile horizontal-overflow scanner. Renders every reachable route at phone
// viewports (360/375/390px) and flags the two real failure modes:
//   1. The document itself scrolls horizontally (page wider than the screen).
//   2. An element visually spills past the right edge with no clipping
//      ancestor (an overflow-x-auto wrapper or overflow-hidden marquee is fine;
//      unclipped content running off the screen is not).
// Run with the dev server up and demo data seeded: node e2e/mobile-overflow-scan.mjs
import { chromium } from "playwright";

const BASE = process.env.APP_URL || "http://localhost:3000";
const WIDTHS = [360, 375, 390];
const PASSWORD = "fliplocker-demo";

const LOGINS = {
  seller: "seller.demo@fliplocker.app",
  buyer: "buyer.demo@fliplocker.app",
  admin: "admin.demo@fliplocker.app",
  hub: "hub.demo@fliplocker.app",
};
// Listing page per role, used to discover every deal-detail link (so all nine
// lifecycle states get scanned, each with a different header pill + content).
const LISTS = { seller: "/seller", buyer: "/buyer", admin: "/admin/deals", hub: "/hub" };
const STATIC = {
  public: ["/", "/pricing", "/how-it-works", "/platform", "/solutions", "/insights", "/faq", "/about", "/contact", "/security", "/terms", "/privacy", "/login", "/register"],
  seller: ["/seller", "/seller/deals/new"],
  buyer: ["/buyer"],
  admin: ["/admin", "/admin/deals", "/admin/config", "/admin/users"],
  hub: ["/hub"],
};

async function report(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const docOver = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw;
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o === "hidden" || o === "auto" || o === "scroll" || o === "clip") return true;
      }
      return false;
    };
    const spill = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right - vw <= 1) continue;
      if (getComputedStyle(el).position === "fixed") continue; // off-canvas drawers
      if (clipped(el)) continue;
      if (spill.some((s) => s.el.contains(el))) continue; // report top-most only
      spill.push({ el, over: Math.round(r.right - vw) });
    }
    return {
      docOver,
      spill: spill.slice(0, 6).map(({ el, over }) => ({
        over,
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 90),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
      })),
    };
  });
}

let bad = 0;
let total = 0;
const browser = await chromium.launch();
for (const width of WIDTHS) {
  for (const [role, routes] of Object.entries(STATIC)) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 } });
    const page = await ctx.newPage();
    let all = [...routes];
    if (role !== "public") {
      await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
      await page.fill('input[name="email"]', LOGINS[role]);
      await page.fill('input[name="password"]', PASSWORD);
      await Promise.all([
        page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }),
        page.click('button[type="submit"]'),
      ]);
      await page.goto(`${BASE}${LISTS[role]}`, { waitUntil: "networkidle" });
      const links = await page.evaluate(() =>
        [...new Set(
          [...document.querySelectorAll('a[href*="/deals/"]')]
            .map((a) => a.getAttribute("href"))
            .filter((h) => /\/deals\/[a-z0-9]+$/.test(h || ""))
        )]
      );
      all = [...all, ...links];
    }
    for (const path of all) {
      total++;
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
      await page.waitForTimeout(200);
      const r = await report(page);
      if (r.docOver > 1 || r.spill.length) {
        bad++;
        console.log(`BAD @${width}px ${role} ${path}  docScroll=+${r.docOver}px`);
        for (const s of r.spill) console.log(`   +${s.over}px <${s.tag}> "${s.text}" [${s.cls.slice(0, 70)}]`);
      }
    }
    await ctx.close();
  }
  console.log(`--- ${width}px done ---`);
}
await browser.close();
console.log(`\n${bad} bad / ${total} page-checks`);
process.exit(bad ? 1 : 0);
