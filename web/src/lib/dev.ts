// Dev/staging controls: simulate carrier scans and fast-forward timers that
// would otherwise be driven by real carrier webhooks and elapsed wall-clock.
// Enabled off-production, or explicitly via DEV_CONTROLS=on. Never in prod
// unless deliberately turned on.
export function devControlsEnabled(): boolean {
  if (process.env.DEV_CONTROLS === "on") return true;
  if (process.env.DEV_CONTROLS === "off") return false;
  return process.env.NODE_ENV !== "production";
}
