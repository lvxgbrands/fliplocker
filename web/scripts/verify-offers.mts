// End-to-end domain verification for open offer links. Drives the REAL wired
// code paths (reserveOffer -> acceptDealAndCreateOrder -> captureAndMarkPaid's
// claim hook -> refundDeal's reopen hook -> sweep) against the local Postgres.
// Run: npx tsx scripts/verify-offers.mts   (requires DATABASE_URL + a seeded DB)
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import {
  createOffer,
  reserveOffer,
  joinWaitlist,
  sweepOfferReservations,
  cancelOffer,
} from "@/lib/offers-service";
import { acceptDealAndCreateOrder, captureAndMarkPaid } from "@/lib/checkout";
import { refundDeal } from "@/lib/settlement";

let passed = 0;
let failed = 0;
function check(label: string, cond: boolean, extra = "") {
  if (cond) {
    passed++;
    console.log(`  ok  ${label}`);
  } else {
    failed++;
    console.error(`FAIL  ${label} ${extra}`);
  }
}

const tag = `itest-${Date.now()}`;
const createdUserIds: string[] = [];
const createdOfferIds: string[] = [];

async function mkUser(role: "SELLER" | "BUYER", i: number) {
  const u = await db.user.create({
    data: {
      email: `${tag}-${role.toLowerCase()}-${i}@example.com`,
      name: `${role} ${i}`,
      passwordHash: await hashPassword("password123"),
      role,
      emailVerified: new Date(),
    },
  });
  createdUserIds.push(u.id);
  return u;
}

const cardData = {
  sport: "Baseball",
  cardYear: 2011,
  playerName: "Test Player",
  gradingCompany: "PSA",
  grade: "PSA 9",
  certNumber: "12345678",
  description: "integration test card",
  salePriceCents: 30000,
};

async function main() {
  const seller = await mkUser("SELLER", 0);
  const buyers = await Promise.all([1, 2, 3, 4, 5].map((i) => mkUser("BUYER", i)));

  // ---- 1. Concurrency: 5 buyers race to reserve one OPEN offer ----
  console.log("\n[1] first-to-reserve-wins concurrency");
  const offer1 = await createOffer(seller, cardData);
  createdOfferIds.push(offer1.id);
  const outcomes = await Promise.all(buyers.map((b) => reserveOffer(offer1.id, b)));
  const winners = outcomes.filter((o) => o.outcome === "won");
  const held = outcomes.filter((o) => o.outcome === "held-by-other");
  check("exactly one buyer won the reservation", winners.length === 1, `won=${winners.length}`);
  check("the other four are held-by-other", held.length === 4, `held=${held.length}`);
  check("winner received a pending deal id", Boolean(winners[0]?.dealId));
  const o1 = await db.offer.findUniqueOrThrow({ where: { id: offer1.id } });
  check("offer is RESERVED after the race", o1.status === "RESERVED");
  check("offer.pendingDealId points at the winner's deal", o1.pendingDealId === winners[0]?.dealId);

  // ---- 2. Winner pays -> offer atomically CLAIMED via the capture hook ----
  console.log("\n[2] winner pays -> offer claimed");
  const winnerBuyer = buyers[outcomes.findIndex((o) => o.outcome === "won")];
  const winnerDealId = winners[0]!.dealId!;
  const approveUrl = await acceptDealAndCreateOrder(winnerDealId, winnerBuyer.id);
  const orderId = new URL(approveUrl, "http://localhost").pathname.split("/").pop()!;
  await captureAndMarkPaid(orderId);
  const o2 = await db.offer.findUniqueOrThrow({ where: { id: offer1.id } });
  check("offer is CLAIMED after payment", o2.status === "CLAIMED");
  check("offer.claimedDealId is the winner's deal", o2.claimedDealId === winnerDealId);
  const winnerDeal = await db.deal.findUniqueOrThrow({ where: { id: winnerDealId } });
  check("winner deal advanced to AWAITING_SELLER_SHIPMENT", winnerDeal.status === "AWAITING_SELLER_SHIPMENT");
  const soldMail = await db.emailOutbox.findFirst({ where: { toEmail: seller.email }, orderBy: { sentAt: "desc" } });
  check("seller got an 'offer sold' email", Boolean(soldMail && /sold/i.test(soldMail.subject)), soldMail?.subject);

  // ---- 3. A losing buyer now sees it as sold ----
  console.log("\n[3] losing buyer reserve -> sold");
  const loser = buyers[outcomes.findIndex((o) => o.outcome === "held-by-other")];
  const soldTry = await reserveOffer(offer1.id, loser);
  check("second reserve attempt reports 'sold'", soldTry.outcome === "sold", soldTry.outcome);

  // ---- 4. Waitlist join ----
  console.log("\n[4] waitlist join");
  await joinWaitlist(offer1.id, { email: loser.email, name: "Loser", userId: loser.id });
  const wl = await db.offerWaitlist.findUnique({ where: { offerId_email: { offerId: offer1.id, email: loser.email } } });
  check("waitlist row created", Boolean(wl));
  const joinMail = await db.emailOutbox.findFirst({ where: { toEmail: loser.email, subject: { contains: "waitlist" } } });
  check("waitlister got a confirmation email", Boolean(joinMail));

  // ---- 5. Reopen-on-fallthrough: refund the claimed deal ----
  console.log("\n[5] refund claimed deal -> offer re-opens + waitlist notified");
  await refundDeal(winnerDealId, { actor: "admin", reason: "Test refund.", toStatus: "REFUNDED" });
  const o5 = await db.offer.findUniqueOrThrow({ where: { id: offer1.id }, include: { events: true } });
  check("offer re-opened to OPEN", o5.status === "OPEN");
  check("claim pointers cleared", o5.claimedDealId === null && o5.claimedById === null);
  check("a REOPENED offer event was logged", o5.events.some((e) => e.type === "REOPENED"));
  const reopenMail = await db.emailOutbox.findFirst({ where: { toEmail: loser.email, subject: { contains: "Available again" } } });
  check("waitlister got a re-open email", Boolean(reopenMail));

  // ---- 6. Reservation hold sweep ----
  console.log("\n[6] expired hold sweep");
  const offer6 = await createOffer(seller, { ...cardData, certNumber: "99999999" });
  createdOfferIds.push(offer6.id);
  const res6 = await reserveOffer(offer6.id, buyers[0]);
  check("fresh reservation won", res6.outcome === "won");
  // Backdate the hold so it is expired, then sweep.
  await db.offer.update({ where: { id: offer6.id }, data: { reservedUntil: new Date(Date.now() - 60_000) } });
  const swept = await sweepOfferReservations(new Date());
  check("sweep released at least one hold", swept >= 1, `swept=${swept}`);
  const o6 = await db.offer.findUniqueOrThrow({ where: { id: offer6.id } });
  check("offer back to OPEN after sweep", o6.status === "OPEN");
  const pendingDeal = res6.dealId ? await db.deal.findUnique({ where: { id: res6.dealId } }) : null;
  check("pending deal was CANCELLED by the sweep", pendingDeal?.status === "CANCELLED");

  // ---- 7. Seller cancel ----
  console.log("\n[7] seller withdraws an open offer");
  const offer7 = await createOffer(seller, { ...cardData, certNumber: "77777777" });
  createdOfferIds.push(offer7.id);
  const cancelRes = await cancelOffer(offer7.id, seller.id);
  check("cancel reported ok", cancelRes.ok === true);
  const o7 = await db.offer.findUniqueOrThrow({ where: { id: offer7.id } });
  check("offer is CANCELLED", o7.status === "CANCELLED");
  const cancelWrongUser = await cancelOffer(offer1.id, "not-the-seller");
  check("cancel by a non-owner is rejected", cancelWrongUser.ok === false);

  console.log(`\n==== ${passed} passed, ${failed} failed ====`);
}

async function cleanup() {
  // Deals reference users with RESTRICT, so remove offer + deal rows first.
  await db.offer.deleteMany({ where: { id: { in: createdOfferIds } } });
  await db.deal.deleteMany({ where: { sellerId: { in: createdUserIds } } });
  await db.emailOutbox.deleteMany({ where: { toEmail: { startsWith: tag } } });
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } });
}

main()
  .catch((e) => {
    console.error(e);
    failed++;
  })
  .finally(async () => {
    await cleanup().catch((e) => console.error("cleanup error", e));
    await db.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  });
