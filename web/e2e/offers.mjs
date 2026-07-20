// End-to-end walkthrough for open offer links:
//   seller posts an offer -> buyer reserves & pays (sandbox simulator) ->
//   offer is claimed (Sold) -> anonymous visitor joins a waitlist.
// Run with the app on http://localhost:3000 and the demo data seeded:
//   npx next start -p 3000   (then)   node e2e/offers.mjs
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR || "/tmp/offer-e2e-shots/";
fs.mkdirSync(SHOTS, { recursive: true });

const DEMO_PASS = "fliplocker-demo";
const SELLER = { email: "seller.demo@fliplocker.app", pass: DEMO_PASS };
const BUYER = { email: "buyer.demo@fliplocker.app", pass: DEMO_PASS };

let step = 0;
async function shot(page, name) {
  step += 1;
  await page.screenshot({ path: `${SHOTS}${String(step).padStart(2, "0")}-${name}.png`, fullPage: false });
  console.log(`  shot ${String(step).padStart(2, "0")}-${name}`);
}
function ok(label, cond) {
  console.log(`${cond ? "  ok  " : "FAIL  "}${label}`);
  if (!cond) process.exitCode = 1;
}
async function login(page, who) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', who.email);
  await page.fill('input[name="password"]', who.pass);
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });

try {
  // ---- Seller posts an open offer ----
  const sctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const sp = await sctx.newPage();
  await login(sp, SELLER);
  await sp.goto(`${BASE}/seller/offers`);
  ok("seller offers list loads", await sp.locator("text=Open offers").first().isVisible());
  await shot(sp, "seller-offers-list");

  await sp.goto(`${BASE}/seller/offers/new`);
  await sp.fill('input[name="cardYear"]', "1999");
  await sp.fill('input[name="playerName"]', "E2E Test Player");
  await sp.fill('input[name="certNumber"]', "E2E-000123");
  await sp.fill('input[name="salePrice"]', "275");
  await sp.waitForTimeout(300); // let the live quote fetch
  await shot(sp, "seller-offer-form");
  await sp.locator('button[type="submit"]').filter({ hasText: /Post open offer/ }).click();
  await sp.waitForURL((u) => u.search.includes("created="), { timeout: 30000 });
  const link = await sp.locator("input[readonly]").first().inputValue();
  ok("new offer produced a share link", /\/offer\//.test(link));
  await shot(sp, "seller-offer-created");
  console.log(`  offer link: ${link}`);

  // ---- Anonymous view of that offer ----
  const actx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ap = await actx.newPage();
  await ap.goto(link);
  ok("anon sees the card", await ap.locator("text=E2E Test Player").first().isVisible());
  ok("anon prompted to sign in to buy", await ap.locator("text=Sign in to buy").first().isVisible());
  await shot(ap, "public-offer-anon");

  // ---- Buyer reserves & pays ----
  const bctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const bp = await bctx.newPage();
  await login(bp, BUYER);
  await bp.goto(link);
  const reserveBtn = bp.locator("button", { hasText: /Reserve & pay/ });
  ok("buyer sees Reserve & pay", await reserveBtn.first().isVisible());
  await shot(bp, "public-offer-buyer");
  await reserveBtn.first().click();
  await bp.waitForURL((u) => u.pathname.startsWith("/pay/simulator"), { timeout: 30000 });
  await shot(bp, "pay-simulator");
  await bp.locator("a", { hasText: /^Pay / }).first().click();
  await bp.waitForURL((u) => u.pathname.startsWith("/buyer/deals") && u.search.includes("paid=1"), { timeout: 30000 });
  ok("buyer landed on the paid deal", bp.url().includes("paid=1"));
  await shot(bp, "buyer-deal-paid");

  // ---- Offer now reads as Sold ----
  await ap.goto(link);
  ok("offer now shows Sold", await ap.locator("text=Sold.").first().isVisible());
  await shot(ap, "public-offer-sold");

  // ---- Waitlist join on the reserved demo offer ----
  await ap.goto(`${BASE}/offer/demo-offer-reserved`);
  ok("reserved demo offer shows Reserved", await ap.locator("text=Reserved.").first().isVisible());
  await ap.fill('input[name="email"]', "waitlist-e2e@example.com");
  await ap.locator("button", { hasText: /Join the waitlist/ }).first().click();
  await ap.waitForURL((u) => u.search.includes("msg=waitlisted"), { timeout: 20000 });
  const wlConfirmed = await ap
    .getByText(/on the waitlist/i)
    .first()
    .waitFor({ state: "visible", timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  ok("waitlist join confirmed", wlConfirmed);
  await shot(ap, "waitlist-joined");

  console.log("\nDONE");
} finally {
  await browser.close();
}
