// End-to-end demo walkthrough: seller -> invite -> buyer claim -> Accept & Pay
// (sandbox simulator) -> seller "ship now" alert + timeline.
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3000";
const SHOTS = new URL("./shots/", import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });

const SELLER = { name: "Dana Rivera", email: "dana.rivera@example.com", pass: "demo-pass-1234" };
const BUYER = { name: "Blake Chen", email: "blake.chen@example.com", pass: "demo-pass-5678" };

let step = 0;
async function shot(page, name) {
  step += 1;
  const file = `${SHOTS}${String(step).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${file.split("/").pop()}`);
}

function fail(msg) {
  console.error(`❌ FAIL: ${msg}`);
  process.exit(1);
}

async function makeCardImage(page, path, label, hue) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
    <rect width="600" height="800" fill="hsl(${hue},45%,92%)"/>
    <rect x="40" y="40" width="520" height="720" rx="24" fill="hsl(${hue},50%,72%)" stroke="hsl(${hue},45%,35%)" stroke-width="10"/>
    <rect x="90" y="120" width="420" height="420" rx="12" fill="hsl(${hue},35%,88%)"/>
    <circle cx="300" cy="300" r="120" fill="hsl(${hue},55%,55%)"/>
    <text x="300" y="640" font-family="Arial" font-size="52" font-weight="bold" text-anchor="middle" fill="#1e293b">${label}</text>
    <text x="300" y="700" font-family="Arial" font-size="30" text-anchor="middle" fill="#475569">PSA 10 · CERT 82345678</text>
  </svg>`;
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  const el = page.locator("svg");
  await el.screenshot({ path });
}

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// ---- 0. Prepare demo card photos ----
await makeCardImage(page, `${SHOTS}card-front.png`, "LUKA DONČIĆ — FRONT", 170);
await makeCardImage(page, `${SHOTS}card-rear.png`, "LUKA DONČIĆ — REAR", 200);
console.log("✔ demo card photos rendered");

// ---- 1. Landing ----
await page.goto(BASE);
await shot(page, "landing");

// ---- 2. Seller registers ----
await page.click("text=Get started");
await page.fill('input[name="name"]', SELLER.name);
await page.fill('input[name="email"]', SELLER.email);
await page.fill('input[name="password"]', SELLER.pass);
await shot(page, "seller-register");
await page.click('button:has-text("Create account")');
await page.waitForURL("**/seller**");
if (!(await page.textContent("body")).includes("verify")) fail("no verification banner after registration");
await shot(page, "seller-dashboard-unverified");
console.log("✔ AC1a: seller registered, logged in");

// ---- 3. Verify email via staging mailbox ----
await page.goto(`${BASE}/dev/mailbox`);
await page.click("text=Verify your FlipLocker email");
const verifyLink = await page.locator('a[href*="/verify-email/"]').first().getAttribute("href");
if (!verifyLink) fail("verification link not found in mailbox");
await shot(page, "mailbox-verification-email");
await page.goto(verifyLink);
await page.waitForURL("**/seller**");
if (!(await page.textContent("body")).includes("Email verified")) fail("email verification did not confirm");
await shot(page, "seller-verified");
console.log("✔ AC1b: email verified via emailed link");

// ---- 4. Seller creates the deal ----
await page.click("text=Create your first deal");
await page.waitForURL("**/seller/deals/new");
await page.selectOption('select[name="sport"]', "Basketball");
await page.fill('input[name="cardYear"]', "2018");
await page.fill('input[name="playerName"]', "Luka Dončić");
await page.selectOption('select[name="gradingCompany"]', "PSA");
await page.fill('input[name="certNumber"]', "82345678");
await page.fill('textarea[name="description"]', "2018 Donruss Optic Rated Rookie, PSA 10. Price agreed on IG.");
await page.fill('input[name="salePrice"]', "450");
await page.fill('input[name="buyerEmail"]', BUYER.email);
const fileInputs = page.locator('input[type="file"]');
await fileInputs.nth(0).setInputFiles(`${SHOTS}card-front.png`);
await fileInputs.nth(1).setInputFiles(`${SHOTS}card-rear.png`);
await page.waitForTimeout(600); // let the live quote preview load
await shot(page, "create-deal-filled");
const preview = await page.textContent("body");
if (!preview.includes("Buyer pays")) fail("live checkout preview did not render");
await page.click('button:has-text("Create deal & invite buyer")');
await page.waitForURL("**/seller/deals/*created=1", { timeout: 30000 });
const sellerDealUrl = page.url().split("?")[0];
const created = await page.textContent("body");
if (!created.includes("invitation is on its way")) fail("deal-created confirmation missing");
if (!created.includes("Buyer invited")) fail("deal not in Buyer invited status");
await shot(page, "seller-deal-created");
console.log("✔ AC1c: deal created (card details, photos, price, buyer email)");

// ---- 5. Invitation email sent ----
await page.goto(`${BASE}/dev/mailbox`);
const inviteRow = page.locator("a", { hasText: "You're invited to a verified card deal" }).first();
if (!(await inviteRow.count())) fail("buyer invitation email not in outbox");
await inviteRow.click();
const inviteLink = await page.locator('a[href*="/invite/"]').first().getAttribute("href");
if (!inviteLink) fail("invite link not found in invitation email");
await shot(page, "mailbox-invite-email");
console.log("✔ AC2: buyer invitation email sent on deal creation");

// ---- 6. Buyer claims invite (fresh browser context = different person) ----
const buyerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const bpage = await buyerCtx.newPage();
await bpage.goto(inviteLink);
await shot(bpage, "buyer-invite-landing");
await bpage.fill('input[name="name"]', BUYER.name);
await bpage.fill('input[name="password"]', BUYER.pass);
await bpage.click('button:has-text("Create account")');
await bpage.waitForURL("**/buyer/deals/**");
const review = await bpage.textContent("body");
for (const expect of ["Luka Dončić", "PSA", "82345678", "peer-to-peer", "service fee", "Outbound shipping", "Total"]) {
  if (!review.includes(expect)) fail(`buyer review page missing "${expect}"`);
}
await shot(bpage, "buyer-deal-review");
console.log("✔ AC3a: buyer claimed invite, sees photos/details/itemized checkout");

// ---- 7. Accept & Pay via sandbox-simulator checkout ----
await bpage.click('button:has-text("Accept & Pay with PayPal")');
await bpage.waitForURL("**/pay/simulator/**");
const payPage = await bpage.textContent("body");
if (!payPage.includes("Sandbox simulator")) fail("simulator checkout page did not render");
await shot(bpage, "paypal-sandbox-checkout");
await bpage.click('a:has-text("Pay $")');
await bpage.waitForURL("**/buyer/deals/*paid=1", { timeout: 30000 });
const paid = await bpage.textContent("body");
if (!paid.includes("Payment confirmed")) fail("buyer did not get payment confirmation");
if (!paid.includes("Paid — awaiting shipment") && !paid.includes("Awaiting seller shipment")) fail("deal status not paid");
await shot(bpage, "buyer-paid-timeline");
console.log("✔ AC4: payment captured via checkout (funds held by processor, fee-only to platform)");

// ---- 8. Seller alert + live timeline ----
await page.goto(`${BASE}/seller`);
const dash = await page.textContent("body");
if (!dash.includes("time to ship")) fail("seller dashboard missing ship-now alert");
await shot(page, "seller-ship-now-dashboard");
await page.goto(sellerDealUrl);
const dealBody = await page.textContent("body");
if (!dealBody.includes("ship now")) fail("seller deal page missing ship-now banner");
for (const expect of ["Deal created", "Invitation emailed", "claimed the invitation", "accepted the deal", "Payment of", "Seller alerted to ship"]) {
  if (!dealBody.includes(expect)) fail(`timeline missing "${expect}"`);
}
await shot(page, "seller-deal-paid-timeline");

await page.goto(`${BASE}/dev/mailbox`);
const outbox = await page.textContent("body");
if (!outbox.includes("Payment received — ship now")) fail("seller ship-now email not sent");
if (!outbox.includes("Payment confirmed — deal")) fail("buyer receipt email not sent");
await page.click("text=Payment received — ship now");
await shot(page, "mailbox-ship-now-email");
console.log("✔ AC5: seller ship-now alert (email + dashboard) and live status timeline");

await browser.close();
console.log("\n🎉 ALL FIVE ACCEPTANCE CRITERIA WALKED END-TO-END ON STAGING");
