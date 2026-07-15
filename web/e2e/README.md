# End-to-end demo walkthroughs

Browser-driven scripts that exercise the real app (not mocks) and were used to
verify each milestone. They drive Chromium via Playwright against a running
server, taking screenshots at each step and asserting on the rendered pages.

- `view-demo.mjs` — the 7/21 View Demo path: seller register → verify → create
  deal → buyer claim → review → Accept & Pay (sandbox simulator) → seller alert.
- `full-lifecycle.mjs` — the complete deal lifecycle: everything above plus ToS
  gate → Leg 1 label → carrier → hub check-in + inspection (video + photos +
  tamper seal) → repack → Leg 2 (signature) → delivered/signed → buyer approve →
  funds released → COMPLETE, then an admin fee-config edit.

## Run

```bash
# 1. Start the app with dev controls (carrier/timer simulation) enabled:
DEV_CONTROLS=on npm run build && DEV_CONTROLS=on npm start
# 2. (fresh data) reset + seed the DB, then:
npm i -D playwright        # not a project dependency; installs Chromium driver
node e2e/full-lifecycle.mjs
```

Screenshots are written next to the script (`shots/`, `shots2/`). These scripts
are intentionally out of the CI unit-test path — they need a live server and a
browser. CI runs lint, typecheck, the compliance copy check, unit tests, and a
production build.
