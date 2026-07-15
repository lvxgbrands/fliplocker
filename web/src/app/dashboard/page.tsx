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
  if (user.role === "FACILITATOR") redirect("/hub");
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <PortalShell user={user} title="Dashboard">
      <div className="rounded-xl border border-ink-200 bg-white p-8 text-center text-ink-500">
        Welcome to FlipLocker.
      </div>
    </PortalShell>
  );
}
