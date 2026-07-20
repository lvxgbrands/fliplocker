import Link from "next/link";
import { LayoutDashboard, ScrollText, SlidersHorizontal, Users, Tag } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/shell";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/deals", label: "Deals", icon: ScrollText },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/config", label: "Fees & config", icon: SlidersHorizontal },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("ADMIN");
  return (
    <PortalShell user={user}>
      <nav className="mb-7 flex flex-wrap gap-1.5 rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-soft">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="kicker flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <n.icon className="h-4 w-4" strokeWidth={2.2} />
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </PortalShell>
  );
}
