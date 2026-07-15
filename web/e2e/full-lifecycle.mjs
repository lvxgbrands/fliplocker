// Full-lifecycle walkthrough:
// seller register/verify/create -> buyer claim/pay -> seller ToS+label ->
// carrier -> hub check-in + inspection (video+photos+seal) -> repack/Leg2 ->
// delivered/signed -> buyer approve -> funds released/complete -> admin config.
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3000";
const SHOTS = "/tmp/claude-0/-home-user-CardDoc/38a044e7-bf00-51a7-9140-00d321784f23/scratchpad/e2e-shots2/";
fs.mkdirSync(SHOTS, { recursive: true });
const EXE = "/opt/pw-browsers/chromium";

const SELLER = { name: "Dana Rivera", email: "dana2@example.com", pass: "demo-pass-1234" };
const BUYER = { name: "Blake Chen", email: "blake2@example.com", pass: "demo-pass-5678" };
const HUB = { email: "hub.demo@fliplocker.app", pass: "fliplocker-demo" };
const ADMIN = { email: "admin.demo@fliplocker.app", pass: "fliplocker-demo" };

let step = 0;
const shot = async (page, name) => {
  step++;
  await page.screenshot({ path: `${SHOTS}${String(step).padStart(2, "0")}-${name}.png` });
  console.log(`  📸 ${String(step).padStart(2, "0")}-${name}`);
};
const fail = (m) => { console.error(`❌ FAIL: ${m}`); process.exit(1); };
const has = async (page, ...t) => { const b = await page.textContent("body"); for (const s of t) if (!b.includes(s)) fail(`missing "${s}" at ${page.url()}`); };

async function svgImage(page, path, label, hue) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="hsl(${hue},45%,92%)"/><rect x="40" y="40" width="520" height="720" rx="24" fill="hsl(${hue},50%,72%)" stroke="hsl(${hue},45%,35%)" stroke-width="10"/><circle cx="300" cy="300" r="120" fill="hsl(${hue},55%,55%)"/><text x="300" y="640" font-family="Arial" font-size="46" font-weight="bold" text-anchor="middle" fill="#1e293b">${label}</text></svg>`;
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.locator("svg").screenshot({ path });
}
async function login(page, who) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', who.email);
  await page.fill('input[name="password"]', who.pass);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const seller = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const sp = await seller.newPage();

// Demo media
await svgImage(sp, `${SHOTS}front.png`, "BAKER — FRONT", 170);
await svgImage(sp, `${SHOTS}rear.png`, "BAKER — REAR", 200);
await svgImage(sp, `${SHOTS}hub1.png`, "HUB REF 1", 150);
await svgImage(sp, `${SHOTS}hub2.png`, "HUB REF 2", 260);

// Record a short real webm for the hub inspection video.
const vidCtx = await browser.newContext({ recordVideo: { dir: SHOTS, size: { width: 320, height: 240 } } });
const vpage = await vidCtx.newPage();
await vpage.goto(`${BASE}/`);
await vpage.waitForTimeout(1200);
await vpage.close();
await vidCtx.close();
const webm = fs.readdirSync(SHOTS).find((f) => f.endsWith(".webm"));
const videoPath = `${SHOTS}${webm}`;
console.log(`✔ demo media ready (video: ${webm})`);

// 1. Seller register + verify
await sp.goto(`${BASE}/register`);
await sp.fill('input[name="name"]', SELLER.name);
await sp.fill('input[name="email"]', SELLER.email);
await sp.fill('input[name="password"]', SELLER.pass);
await sp.click('button:has-text("Create account")');
await sp.waitForURL("**/seller**");
await sp.goto(`${BASE}/dev/mailbox`);
await sp.click("text=Verify your FlipLocker email");
const verify = await sp.locator('a[href*="/verify-email/"]').first().getAttribute("href");
await sp.goto(verify);
await sp.waitForURL("**/seller**");
await has(sp, "Email verified");
console.log("✔ seller registered + verified");

// 2. Create deal
await sp.click("text=Create your first deal");
await sp.waitForURL("**/seller/deals/new");
await sp.selectOption('select[name="sport"]', "Baseball");
await sp.fill('input[name="cardYear"]', "1909");
await sp.fill('input[name="playerName"]', "Frank Baker");
await sp.selectOption('select[name="gradingCompany"]', "PSA");
await sp.fill('input[name="certNumber"]', "38227911");
  await sp.fill('input[name="grade"]', "PSA 3");
await sp.fill('input[name="salePrice"]', "385");
await sp.fill('input[name="buyerEmail"]', BUYER.email);
const sf = sp.locator('input[type="file"]');
await sf.nth(0).setInputFiles("/home/user/CardDoc/web/public/cards/baker-front.png");
await sf.nth(1).setInputFiles("/home/user/CardDoc/web/public/cards/baker-back.png");
await sp.waitForTimeout(500);
await sp.click('button:has-text("Create deal & invite buyer")');
await sp.waitForURL((u) => u.search.includes("created=1"), { timeout: 30000 });
const sellerDealUrl = sp.url().split("?")[0];
console.log("✔ deal created");

// 3. Buyer claims + pays
await sp.goto(`${BASE}/dev/mailbox`);
await sp.locator("a", { hasText: "You're invited" }).first().click();
const inviteLink = await sp.locator('a[href*="/invite/"]').first().getAttribute("href");
const buyer = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const bp = await buyer.newPage();
await bp.goto(inviteLink);
await bp.fill('input[name="name"]', BUYER.name);
await bp.fill('input[name="password"]', BUYER.pass);
await bp.click('button:has-text("Create account")');
await bp.waitForURL("**/buyer/deals/**");
await bp.click('button:has-text("Accept & Pay with PayPal")');
await bp.waitForURL("**/pay/simulator/**");
await bp.click('a:has-text("Pay $")');
await bp.waitForURL((u) => u.search.includes("paid=1"), { timeout: 30000 });
await has(bp, "Payment confirmed");
console.log("✔ buyer claimed + paid (funds held by processor)");

// 4. Seller: accept ToS + generate Leg 1 label
await sp.goto(sellerDealUrl);
await has(sp, "ship now");
await sp.check('input[name="tos"]');
await sp.click('button:has-text("Accept & generate shipping label")');
await sp.waitForURL((u) => u.search.includes("labeled=1"), { timeout: 30000 });
await has(sp, "Label generated", "Leg 1", "Ship by");
await shot(sp, "seller-label-generated");
console.log("✔ ToS accepted + Leg 1 label generated");

// 5. Carrier: accepted -> in transit -> arrived at hub (dev controls)
await sp.click('button:has-text("Carrier accepted")');
await sp.waitForSelector('button:has-text("Arrived at hub")', { timeout: 30000 });
await sp.click('button:has-text("Arrived at hub")');
await sp.waitForSelector('text=Received at hub', { timeout: 30000 });
console.log("✔ carrier -> received at hub");

// 6. Facilitator: check in + inspection
const hub = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const hp = await hub.newPage();
await login(hp, HUB);
await hp.goto(`${BASE}/hub`);
await has(hp, "Awaiting inspection");
await shot(hp, "hub-queue");
await hp.locator('a[href*="/hub/deals/"]').first().click();
await hp.waitForURL("**/hub/deals/**");
const hf = hp.locator('input[type="file"]');
await hf.nth(0).setInputFiles(videoPath);   // video
await hf.nth(1).setInputFiles(`${SHOTS}hub1.png`);
await hf.nth(2).setInputFiles(`${SHOTS}hub2.png`);
await hp.fill('input[name="tamperSealSerial"]', "TS-778812");
await hp.fill('textarea[name="notes"]', "Matches listing; cert active in registry.");
await shot(hp, "hub-inspection-form");
await hp.click('button:has-text("Pass — verified")');
await hp.waitForSelector('button:has-text("Repack & ship to buyer")', { timeout: 30000 });
await has(hp, "Verified");
await shot(hp, "hub-verified");
await hp.click('button:has-text("Repack & ship to buyer")');
await hp.waitForURL((u) => u.pathname === "/hub" && u.search.includes("shipped="), { timeout: 30000 });
console.log("✔ hub inspection PASS -> repack -> Leg 2 shipped (signature)");

// 7. Delivered & signed (dev control on buyer page) -> buyer approve
await bp.goto(bp.url().split("?")[0]);
await bp.click('button:has-text("Delivered & signed")');
await bp.waitForSelector('button:has-text("Approve & release payment")', { timeout: 30000 });
await has(bp, "review your card", "48 hours");
await shot(bp, "buyer-review-window");
await bp.click('button:has-text("Approve & release payment")');
await bp.waitForURL((u) => u.search.includes("approved=1"), { timeout: 30000 });
await has(bp, "Complete", "deal is complete");
await shot(bp, "buyer-complete");
console.log("✔ delivered/signed -> buyer approved -> funds released -> COMPLETE");

// 8. Verify hub evidence video present on the completed deal
await has(bp, "Verified & documented at the hub");
if (!(await bp.locator("video").count())) fail("hub inspection video not shown to buyer");
console.log("✔ hub evidence (video + photos + seal) visible to buyer");

// 9. Admin: overview + edit a fee (config-driven, no code change)
const admin = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const ap = await admin.newPage();
await login(ap, ADMIN);
await ap.goto(`${BASE}/admin`);
await has(ap, "Fees collected", "Processed volume");
await shot(ap, "admin-overview");
await ap.goto(`${BASE}/admin/config`);
await shot(ap, "admin-config");
// Change PRO percent to 1.5% and confirm it persists.
const proForm = ap.locator('form:has(input[value="PRO"])');
await proForm.locator('input[name="percent"]').fill("1.5");
await proForm.locator('button:has-text("Save PRO")').click();
await ap.waitForURL((u) => u.search.includes("saved=fee"), { timeout: 20000 });
const proVal = await ap.locator('form:has(input[value="PRO"]) input[name="percent"]').inputValue();
if (proVal !== "1.5") fail(`fee config did not persist (got ${proVal})`);
console.log("✔ admin edited fee config with no code change (PRO % -> 1.5)");

// Reset PRO back to 2% so seeds stay consistent
await proForm.locator('input[name="percent"]').fill("2");
await proForm.locator('button:has-text("Save PRO")').click();
await ap.waitForURL((u) => u.search.includes("saved=fee"));

await browser.close();
console.log("\n🎉 FULL DEAL LIFECYCLE + ADMIN CONFIG WALKED END-TO-END");
