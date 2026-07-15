import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/shell";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("FACILITATOR");
  return <PortalShell user={user}>{children}</PortalShell>;
}
