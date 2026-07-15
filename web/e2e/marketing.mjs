// Marketing-site e2e: visits every nav destination, asserts it renders and (for
// content pages) carries a FAQ, checks FAQPage JSON-LD, exercises the newsletter
// server action, and screenshots the mega menu, pricing (monthly + annual), the
// news ticker, and a few key pages.
//
// Also covers the top-ticker/mega-menu/nav redesign:
//   • the dark news ticker is pinned at the very top of the page, above the
//     sticky nav (not under the hero or above the footer), exactly once;
//   • the desktop mega dropdown is a full-bleed (100% width), fully opaque white
//     bar under the nav, with inner content constrained to max-w-6xl;
//   • the top nav is trimmed (About & Contact live only in the footer);
//   • every key page is free of horizontal overflow across mobile/tablet/desktop.
//
// Run against a running server:  node e2e/marketing.mjs   (BASE overridable)
import { chromium } from "playwright";
import fs from "fs";
import os from "os";
import path from "path";

const BASE = process.env.BASE || "http://localhost:3000";
const EXE = "/opt/pw-browsers/chromium";
const SHOTS = process.env.SHOTS || path.join(os.tmpdir(), "marketing-shots") + "/";
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => {
  console.error(`  ✗ ${m}`);
  failures++;
};

// path, must-contain text, whether an accordion FAQ (details/summary) is expected
const PAGES = [
  ["/", "close the card deal", true],
  ["/platform", "one protected deal", true],
  ["/platform/payments-held-by-processor", "held by our payment processor", true],
  ["/platform/hub-documentation", "Hub documentation", true],
  ["/platform/signature-delivery", "signature", true],
  ["/platform/transparency-timeline", "timeline", true],
  ["/platform/tamper-seal", "tamper seal", true],
  ["/platform/media-auto-purge", "purged", true],
  ["/solutions", "Find your playbook", true],
  ["/solutions/social-sellers", "social", true],
  ["/solutions/collectors", "collectors", true],
  ["/solutions/high-value-cards", "high-value", true],
  ["/solutions/first-time-deals", "first", true],
  ["/solutions/breakers", "breakers", true],
  ["/how-it-works", "signed delivery", true],
  ["/pricing", "Single", true],
  ["/insights", "Playbooks", false],
  ["/insights/how-to-sell-graded-cards-safely-on-instagram", "Instagram", true],
  ["/insights/spotting-scams-in-peer-to-peer-card-deals", "scam", true],
  ["/faq", "Getting started", true],
  ["/about", "What we value", true],
  ["/contact", "Talk to FlipLocker", true],
  ["/security", "documentation proves", true],
  ["/terms", "Terms & Conditions", false],
  ["/privacy", "Privacy Policy", false],
  ["/disclaimer", "Disclaimer", false],
];

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

console.log(`\nMarketing e2e against ${BASE}\n`);

// 1) Visit every page.
for (const [path, needle, wantFaq] of PAGES) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const status = res?.status() ?? 0;
  if (status >= 400) { fail(`${path} → HTTP ${status}`); continue; }
  const body = (await page.textContent("body")) || "";
  if (!body.toLowerCase().includes(needle.toLowerCase())) { fail(`${path} missing text "${needle}"`); continue; }
  if (wantFaq) {
    const summaries = await page.locator("details summary").count();
    if (summaries < 1) { fail(`${path} has no FAQ accordion`); continue; }
  }
  ok(`${path} (${status})${wantFaq ? " + FAQ" : ""}`);
}

// 2) FAQPage JSON-LD present on FAQ pages.
for (const p of ["/faq", "/pricing", "/how-it-works", "/security"]) {
  await page.goto(`${BASE}${p}`, { waitUntil: "domcontentloaded" });
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  if (ld.join(" ").includes("FAQPage")) ok(`${p} emits FAQPage JSON-LD`);
  else fail(`${p} missing FAQPage JSON-LD`);
}

// 3) Article JSON-LD on an insights post.
await page.goto(`${BASE}/insights/what-card-documentation-actually-means`, { waitUntil: "domcontentloaded" });
{
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  if (ld.includes('"Article"') && ld.includes("BreadcrumbList")) ok("insights article emits Article + BreadcrumbList JSON-LD");
  else fail("insights article missing Article/BreadcrumbList JSON-LD");
}

// 4) News ticker: pinned at the very top (above the sticky nav), exactly one,
//    with real, clickable, external headlines.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
{
  const tickers = page.locator(".news-ticker");
  const count = await tickers.count();
  if (count === 1) ok("exactly one news ticker on home (no under-hero/above-footer duplicate)");
  else fail(`expected exactly one news ticker on home, found ${count}`);

  const ticker = tickers.first();
  const tb = await ticker.boundingBox();
  const hb = await page.locator("header").first().boundingBox();
  if (tb && hb && tb.y + tb.height <= hb.y + 2)
    ok(`ticker sits above the nav (ticker.bottom=${Math.round(tb.y + tb.height)} ≤ nav.top=${Math.round(hb.y)})`);
  else fail(`ticker is not pinned above the nav (ticker=${JSON.stringify(tb)}, nav=${JSON.stringify(hb)})`);

  const links = ticker.locator("a[href^='http']");
  const n = await links.count();
  if (n > 0) {
    const href = await links.first().getAttribute("href");
    ok(`news ticker has ${n} clickable external headlines (e.g. ${href?.slice(0, 40)}…)`);
    await ticker.screenshot({ path: `${SHOTS}04-news-ticker.png` });
  } else fail("news ticker has no external links");
}

// 4b) The ticker is also pinned at the top of a MarketingShell page (previously
//     it rendered above the footer there).
await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });
{
  const count = await page.locator(".news-ticker").count();
  const tb = await page.locator(".news-ticker").first().boundingBox();
  const hb = await page.locator("header").first().boundingBox();
  if (count === 1 && tb && hb && tb.y + tb.height <= hb.y + 2)
    ok("shell page (/pricing) has exactly one ticker pinned above the nav");
  else fail(`shell page ticker placement wrong (count=${count}, ticker=${JSON.stringify(tb)}, nav=${JSON.stringify(hb)})`);
}

// 5) Mega menu: opens on hover, is a full-bleed (100% width) opaque white bar
//    under the nav, with inner content constrained to max-w-6xl.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
{
  const trigger = page.locator('nav[aria-label="Primary"] a', { hasText: "Platform" }).first();
  await trigger.hover();
  await page.waitForTimeout(500);
  const panelLink = page.locator('a', { hasText: "Hub documentation" }).first();
  if (await panelLink.isVisible()) ok("mega menu opens on hover with Platform columns");
  else fail("mega menu did not open");

  const meta = await page.evaluate(() => {
    const overview = [...document.querySelectorAll("header a")].find((a) => /overview$/.test(a.textContent.trim()));
    if (!overview) return null;
    // Climb to the full-bleed bar (the direct child of <header>).
    let bar = overview;
    while (bar.parentElement && bar.parentElement.tagName !== "HEADER") bar = bar.parentElement;
    const r = bar.getBoundingClientRect();
    const cs = getComputedStyle(bar);
    const inner = bar.querySelector(".max-w-6xl") || bar.firstElementChild;
    const ir = inner.getBoundingClientRect();
    return {
      vw: document.documentElement.clientWidth,
      barLeft: Math.round(r.left),
      barW: Math.round(r.width),
      bg: cs.backgroundColor,
      backdrop: cs.backdropFilter,
      innerW: Math.round(ir.width),
    };
  });
  if (!meta) fail("could not locate the mega bar");
  else {
    if (meta.barLeft <= 1 && meta.barW >= meta.vw - 2)
      ok(`mega bar is full-bleed (${meta.barW}px ≈ ${meta.vw}px viewport)`);
    else fail(`mega bar is not full-width (left=${meta.barLeft}, w=${meta.barW}, vw=${meta.vw})`);

    const opaqueWhite = meta.bg === "rgb(255, 255, 255)";
    if (opaqueWhite && meta.backdrop === "none")
      ok(`mega bar is opaque white with no backdrop-blur (bg=${meta.bg})`);
    else fail(`mega bar is not opaque white (bg=${meta.bg}, backdrop=${meta.backdrop})`);

    if (meta.innerW <= 1160 && meta.innerW < meta.barW)
      ok(`mega inner content constrained to max-w-6xl (${meta.innerW}px inside a ${meta.barW}px bar)`);
    else fail(`mega inner content not constrained (inner=${meta.innerW}, bar=${meta.barW})`);
  }
  await page.screenshot({ path: `${SHOTS}01-megamenu-open.png` });
}

// 5b) Trimmed top nav — About & Contact live only in the footer now.
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
{
  const labels = (await page.locator('nav[aria-label="Primary"] a').allTextContents()).map((s) => s.trim());
  const trimmed = !labels.includes("About") && !labels.includes("Contact");
  const core = ["Platform", "Solutions", "How it works", "Pricing", "Insights", "FAQ"].every((l) =>
    labels.some((x) => x.startsWith(l))
  );
  if (trimmed && core) ok(`top nav is trimmed (no About/Contact); items: ${labels.join(", ")}`);
  else fail(`top nav mismatch: ${labels.join(", ")}`);

  const footLabels = (await page.locator("footer a").allTextContents()).map((s) => s.trim());
  if (footLabels.includes("About") && footLabels.includes("Contact")) ok("About & Contact still present in the footer nav");
  else fail(`About/Contact missing from footer nav (${footLabels.join(", ")})`);
}

// 6) Pricing monthly + annual toggle.
await page.goto(`${BASE}/pricing`, { waitUntil: "domcontentloaded" });
{
  await page.locator('button[role="radio"]', { hasText: "Annual" }).first().click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${SHOTS}02-pricing-annual.png`, fullPage: true });
  await page.locator('button[role="radio"]', { hasText: "Monthly" }).first().click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${SHOTS}03-pricing-monthly.png`, fullPage: true });
  const body = (await page.textContent("body")) || "";
  if (body.includes("Single") && body.includes("Plus") && body.includes("Pro")) ok("pricing shows all three packages + billing toggle");
  else fail("pricing missing a package");
}

// 7) Newsletter server action (footer on home).
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
{
  const footEmail = page.locator("footer input[type='email']").first();
  await footEmail.fill(`e2e+${Date.now()}@example.com`);
  await page.locator("footer button", { hasText: "Subscribe" }).first().click();
  await page.waitForTimeout(1500);
  const msg = (await page.locator("footer").textContent()) || "";
  if (/You're in|already on the list/i.test(msg)) ok("footer newsletter opt-in works");
  else fail(`footer newsletter did not confirm (got: ${msg.slice(-80)})`);
}

// 8) Key page screenshots.
for (const [p, name] of [
  ["/platform", "05-platform"],
  ["/insights/how-to-sell-graded-cards-safely-on-instagram", "06-insights-article"],
  ["/solutions/social-sellers", "07-solution"],
  ["/", "08-home"],
]) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${SHOTS}${name}.png`, fullPage: true });
}
ok("captured key-page screenshots");

// 9) Mobile drawer — opens after hydration and is trimmed like the top nav.
{
  const m = await ctx.newPage();
  await m.setViewportSize({ width: 390, height: 844 });
  await m.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await m.waitForTimeout(400); // let the client nav hydrate so the button is live
  await m.locator('button[aria-label="Open menu"]').click();
  const drawerNav = m.locator('nav[aria-label="Mobile"]');
  try {
    await drawerNav.waitFor({ state: "visible", timeout: 5000 });
    ok("mobile drawer opens");
    const dl = (await drawerNav.locator("a, button").allTextContents()).map((s) => s.trim());
    if (!dl.includes("About") && !dl.includes("Contact")) ok("mobile drawer nav is trimmed too (no About/Contact)");
    else fail(`mobile drawer still lists About/Contact: ${dl.join(", ")}`);
  } catch {
    fail("mobile drawer did not open");
  }
  await m.screenshot({ path: `${SHOTS}09-mobile-drawer.png` });
  await m.close();
}

// 10) Responsive sweep — no horizontal overflow, and full-page screenshots at
//     mobile (~390px), tablet (~768px), and desktop (1280px). Covers the top
//     ticker, sticky nav/drawer, and (desktop) the full-width mega menu.
{
  const VIEWPORTS = [
    { w: 390, h: 844, name: "mobile" },
    { w: 768, h: 1024, name: "tablet" },
    { w: 1280, h: 900, name: "desktop" },
  ];
  const RESPONSIVE_PAGES = [
    ["/", "home"],
    ["/pricing", "pricing"],
    ["/platform", "platform"],
    ["/solutions", "solutions"],
    ["/insights/how-to-sell-graded-cards-safely-on-instagram", "insights-article"],
    ["/faq", "faq"],
  ];
  for (const vp of VIEWPORTS) {
    const vctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const vpage = await vctx.newPage();
    let clean = true;
    for (const [p, label] of RESPONSIVE_PAGES) {
      await vpage.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
      await vpage.waitForTimeout(200);
      const overflow = await vpage.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (overflow > 1) {
        fail(`${vp.name} ${p} has ${overflow}px horizontal overflow`);
        clean = false;
      }
      await vpage.screenshot({ path: `${SHOTS}vp-${label}-${vp.name}.png`, fullPage: true });
    }
    if (clean) ok(`${vp.name} (${vp.w}px): all key pages free of horizontal overflow`);
    await vctx.close();
  }
}

await browser.close();

console.log(`\n${failures === 0 ? "✅ ALL MARKETING E2E CHECKS PASSED" : `❌ ${failures} FAILURE(S)`}`);
console.log(`Screenshots: ${SHOTS}\n`);
process.exit(failures === 0 ? 0 : 1);
