import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/shell";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams)) {
    if (typeof v === "string") params.set(k, v);
  }
  const qs = params.size ? `?${params}` : "";
  if (user.role === "SELLER") redirect(`/seller${qs}`);
  if (user.role === "BUYER") redirect(`/buyer${qs}`);

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
