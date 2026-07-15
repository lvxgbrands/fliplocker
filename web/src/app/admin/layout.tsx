import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/shell";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/config", label: "Fees & config" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("ADMIN");
  return (
    <PortalShell user={user}>
      <nav className="flex gap-1 mb-6 border-b border-slate-200">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 border-b-2 border-transparent hover:border-teal-500 -mb-px"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </PortalShell>
  );
}
