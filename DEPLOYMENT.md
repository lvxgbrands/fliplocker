# FlipLocker — Deployment & Branch Setup

First-time wiring for the `lvxgbrands/fliplocker` repo on Vercel. This is the
"what do I click" guide. For the full env-var runbook and going-live steps, see
[`web/DEPLOY.md`](web/DEPLOY.md).

> **The app lives in `web/`.** The repo root only holds the client's raw uploads
> (logo + card photos). Vercel must build from `web/`, not the repo root — see
> step 3.

---

## 1. GitHub — make `main` the default branch

The default branch is set on the **General** settings page (NOT the "Branches"
page — that one is only for protection rules).

1. Repo → **Settings → General** (top item in the left sidebar).
2. Scroll to the **"Default branch"** section (near the top).
3. Click the **⇄ switch icon** next to the current branch
   (`claude/carddoc-marketplace-platform-g5y5i2`).
4. Choose **`main`** → **Update** → confirm
   **"I understand, update the default branch."**

There's an auto-suggested Pull Request open for `main`. You don't need it —
we push straight to `main` — so you can close it.

---

## 2. Vercel — set the Production Branch to `main`

Vercel does **not** follow the GitHub default automatically; set it explicitly.

1. Vercel → **fliplocker project → Settings → Git**.
2. Scroll past "Connected Git Repository" and "Git Commits" to the
   **Production Branch** section.
3. Change it to **`main`** → **Save**.

Changing the production branch does **not** trigger a build on its own. To make
`main` live: **Deployments** tab → newest `main` deployment → **⋯ → Promote to
Production** (or push any commit to `main`).

---

## 3. Vercel — build from `web/`

Because the Next.js app is in the `web/` subdirectory:

- **Settings → Build & Deployment → Root Directory → `web`**
- Framework preset: **Next.js** · Build: `npm run build` · Install: `npm install`

---

## 4. Vercel — environment variables

**Settings → Environment Variables.** The full annotated list is in
[`web/.env.example`](web/.env.example); the app runs in **simulator mode** for
every external service whose keys are blank, so the only hard requirements are:

| Variable         | Required | Notes                                                        |
| ---------------- | :------: | ------------------------------------------------------------ |
| `DATABASE_URL`   |   ✅     | Postgres connection string (Vercel Postgres / Neon / Supabase). Without it the site deploys but every DB-backed page errors at runtime. |
| `APP_URL`        |   ✅     | The deployed URL, e.g. `https://fliplocker.app`.             |
| `SESSION_SECRET` |   ✅     | A long random string (used to sign sessions).                |

Optional, off by default (blank = simulator): `RESEND_API_KEY` (email),
`PAYPAL_*` (payments), `EASYPOST_API_KEY` (shipping), `TWILIO_*` (SMS), `S3_*`
(media), `CRON_SECRET` (timer job). For an internal demo you can also set
`DEV_MAILBOX=on` and `DEV_CONTROLS=on` — **turn both OFF for anything
client-facing.**

---

## 5. Database — migrate & seed

Provision Postgres, put its connection string in `DATABASE_URL`, then from `web/`:

    npx prisma migrate deploy     # apply all migrations
    npm run db:seed               # base config + FREE/PRO fees + demo accounts
    npm run seed:demo             # OPTIONAL: demo deals across lifecycle states

---

## 6. Verify locally before pushing

Every push to `main` deploys. Keep these green first (from `web/`):

    npm run typecheck
    npm run lint
    npm run check:copy            # compliance language guard — must pass
    npm run test
    npm run build

`check:copy` blocks forbidden user-facing terms (verify/verification,
authenticate, escrow, bank, licensed). Approved framing: **document /
documented / documentation**, **inspection**, **held by our payment processor**.
