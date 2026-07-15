import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/shell";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <PortalShell user={user}>{children}</PortalShell>;
}
