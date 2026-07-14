You are starting the build of FlipLocker, a transaction-verification platform for peer-to-peer graded trading-card deals negotiated off-platform (domain: fliplocker.app). This repo currently holds the project docs. Your job is to begin the actual application build, targeting the first contractual milestone: the View Demo, due July 21, 2026.

FIRST, read these committed docs for full context before writing any code:
- README.md — what FlipLocker is, the deal flow, and the core rules
- docs/APPENDIX-A-FUNCTIONALITY.md — the client-facing scope (contract Appendix A)
- docs/BUILD-LIST.md — the engineering plan: proposed stack, data model, deal state machine, week-by-week checklist
- docs/COMPLIANCE-NOTES.md — hard constraints on terminology and money handling

THIS SESSION'S GOAL — the View Demo milestone. By July 21 we must demonstrate the core transaction loop end-to-end on staging. Acceptance criteria:
1. A seller registers, logs in, and creates a deal: card details (sport, year, player, grading company, certificate/serial number), front and rear photos, sale price, and buyer email.
2. Creating the deal sends a buyer invitation email.
3. The buyer claims the invite, reviews the deal (photos, details, itemized checkout), and clicks Accept & Pay.
4. Payment runs through PayPal marketplace (multiparty) checkout in SANDBOX — buyer funds are held by PayPal, not by FlipLocker; FlipLocker takes only its service fee.
5. The seller receives a "payment received — ship now" alert, and the deal shows a live status timeline.

Scope this session to Weeks 1-2 of BUILD-LIST.md (foundation -> buyer flow -> payments). Do NOT build the hub verification, shipping labels, fund release, admin dashboard, or subscriptions yet.

LOCKED TECHNICAL DECISIONS (do not re-litigate):
- Stack: Next.js + TypeScript, Prisma + PostgreSQL, S3-compatible media storage with presigned uploads, auth with email verification, transactional email via Resend or SendGrid, hosting on Vercel. Roles: SELLER, BUYER, FACILITATOR, ADMIN.
- Payments: PayPal Complete Payments / multiparty, in SANDBOX for the demo. Funds are held by PayPal and released to the seller later; the platform receives only its fee. Live approval is a parallel track — build against sandbox.
- Fee engine must be fully config-driven and plan-aware (Free vs Pro tiers). Exact fee numbers are NOT final, so do NOT hardcode them. Model fees as a config table: a flat floor below a crossover price, a percentage above it, with configurable who-pays (buyer / seller / split), a configurable minimum price, and separate configurable insurance and tax line settings. Fee is a function of sale price ONLY — never store or use the card's comp/market value.
- User-facing copy must never use the words "escrow," "authenticate," "licensed," or "bank." Use "inspection," "documentation," "verified," and "held by our payment processor."
- No public marketplace: deals are private and invitation-only. No browsing, search, or listing grids anywhere.
- Brand: FlipLocker, teal/green identity, clean modern mobile-friendly UI.

WORKING PROCESS:
- Create and work on a build branch named claude/fliplocker-build-view-demo. Commit as you go. Leave the existing docs intact.
- Stand up a staging environment and seed data so the flow is demoable end-to-end.
- Actually launch the app and walk the seller -> buyer -> sandbox-payment -> seller-alert path yourself before calling anything done. The milestone is a live demo, not just passing tests.
- Begin by confirming the stack against BUILD-LIST.md, scaffolding the app, standing up the schema and auth, then building the seller Create Deal flow first.

Start by reading the four docs above, then propose a short build plan for hitting the five acceptance criteria by July 21.
