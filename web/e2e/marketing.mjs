// Marketing-site e2e: visits every nav destination, asserts it renders and (for
// content pages) carries a FAQ, checks FAQPage JSON-LD, exercises the newsletter
// server action, and screenshots the mega menu, pricing (monthly + annual), the
// news ticker, and a few key pages.
//
// Run against a running server:  node e2e/marketing.mjs   (BASE overridable)
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE || "http://localhost:3000";
const EXE = "/opt/pw-browsers/chromium";
const SHOTS =
  process.env.SHOTS ||
  "/tmp/claude-0/-home-user-fliplocker/dcf158c7-a6c0-52a9-b167-2e26fd0d0a7a/scratchpad/marketing-shots/";
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

// 4) News ticker: real, clickable, external headlines.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
{
  const ticker = page.locator(".news-ticker").first();
  if (await ticker.count()) {
    const links = ticker.locator("a[href^='http']");
    const n = await links.count();
    if (n > 0) {
      const href = await links.first().getAttribute("href");
      ok(`news ticker has ${n} clickable external headlines (e.g. ${href?.slice(0, 40)}…)`);
      await ticker.screenshot({ path: `${SHOTS}04-news-ticker.png` });
    } else fail("news ticker has no external links");
  } else fail("news ticker not found on home");
}

// 5) Mega menu open on hover (desktop). Trigger is a Link that also navigates.
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
{
  const trigger = page.locator('nav[aria-label="Primary"] a', { hasText: "Platform" }).first();
  await trigger.hover();
  await page.waitForTimeout(500);
  const panelLink = page.locator('a', { hasText: "Hub documentation" }).first();
  if (await panelLink.isVisible()) ok("mega menu opens on hover with Platform columns");
  else fail("mega menu did not open");
  await page.screenshot({ path: `${SHOTS}01-megamenu-open.png` });
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

// 9) Mobile drawer.
{
  const m = await ctx.newPage();
  await m.setViewportSize({ width: 390, height: 800 });
  await m.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await m.locator('button[aria-label="Open menu"]').click();
  await m.waitForTimeout(300);
  const drawerLink = m.locator('nav[aria-label="Mobile"]');
  if (await drawerLink.isVisible()) ok("mobile drawer opens");
  else fail("mobile drawer did not open");
  await m.screenshot({ path: `${SHOTS}09-mobile-drawer.png` });
  await m.close();
}

await browser.close();

console.log(`\n${failures === 0 ? "✅ ALL MARKETING E2E CHECKS PASSED" : `❌ ${failures} FAILURE(S)`}`);
console.log(`Screenshots: ${SHOTS}\n`);
process.exit(failures === 0 ? 0 : 1);
