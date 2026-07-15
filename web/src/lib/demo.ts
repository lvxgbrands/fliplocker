// Demo data gating.
//
// The hosted sales demo is populated with four shared-password accounts and
// nine lifecycle deals so a client can sign in and see a fully populated
// product. That data must not exist in a real customer-facing production: the
// accounts share a single, publicly known password. This module decides whether
// the seed scripts create (and retain) that demo data.
//
//   SEED_DEMO=on      force demo data on (the hosted sales demo)
//   SEED_DEMO=off     force demo data off (a real client launch)
//   SEED_DEMO unset   on by default, but automatically off once a real admin is
//                     configured via ADMIN_EMAIL + ADMIN_PASSWORD, so a real
//                     production locks itself down without a second flag.

export const DEMO_PASSWORD = "fliplocker-demo";

export const DEMO_ACCOUNTS = [
  { email: "seller.demo@fliplocker.app", role: "SELLER", name: "Dana Seller" },
  { email: "buyer.demo@fliplocker.app", role: "BUYER", name: "Blake Buyer" },
  { email: "admin.demo@fliplocker.app", role: "ADMIN", name: "Avery Admin" },
  { email: "hub.demo@fliplocker.app", role: "FACILITATOR", name: "Harper Hub" },
] as const;

export const DEMO_EMAILS: string[] = DEMO_ACCOUNTS.map((a) => a.email);

// A real admin is seeded from secrets (never a shared password). Configuring one
// is the signal that this deployment is a real production, not a sales demo.
export function realAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

export function demoDataEnabled(): boolean {
  const flag = process.env.SEED_DEMO?.trim().toLowerCase();
  if (flag === "on" || flag === "true" || flag === "1") return true;
  if (flag === "off" || flag === "false" || flag === "0") return false;
  return !realAdminConfigured();
}
