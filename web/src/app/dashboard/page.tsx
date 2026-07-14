import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/shell";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "SELLER") redirect("/seller");
  if (user.role === "BUYER") redirect("/buyer");

  // FACILITATOR and ADMIN portals arrive in Weeks 3–4.
  return (
    <PortalShell user={user} title="Dashboard">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        The {user.role === "ADMIN" ? "admin" : "hub facilitator"} portal ships in a later
        milestone. This build covers the seller and buyer transaction loop.
      </div>
    </PortalShell>
  );
}
