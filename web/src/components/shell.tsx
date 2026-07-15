import Link from "next/link";
import type { User } from "@prisma/client";
import { Wordmark } from "@/components/brand";
import { logoutAction } from "@/app/(auth)/actions";

const ROLE_LABELS: Record<string, string> = {
  SELLER: "Seller",
  BUYER: "Buyer",
  FACILITATOR: "Hub",
  ADMIN: "Admin",
};

export function PortalShell({
  user,
  children,
  title,
}: {
  user: User;
  title?: string;
  children: React.ReactNode;
}) {
  const home =
    user.role === "BUYER"
      ? "/buyer"
      : user.role === "SELLER"
        ? "/seller"
        : user.role === "FACILITATOR"
          ? "/hub"
          : user.role === "ADMIN"
            ? "/admin"
            : "/dashboard";
  const initials = (user.name || user.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-ink-200/60 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between gap-4 px-4">
          <Wordmark href={home} />
          <nav className="flex items-center gap-3 text-sm">
            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-[11px] font-bold text-white shadow-soft">
                {initials}
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-semibold text-ink-900">
                  {user.name || user.email}
                </span>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-brand-600">
                  {ROLE_LABELS[user.role] ?? user.role.toLowerCase()}
                </span>
              </span>
            </span>
            <span className="hidden h-6 w-px bg-ink-200 sm:block" aria-hidden />
            <form action={logoutAction}>
              <button
                className="rounded-lg px-3 py-2 font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-10 rise">
        {title ? <h1 className="mb-6 text-2xl font-bold">{title}</h1> : null}
        {children}
      </main>
      <footer className="mx-auto max-w-5xl px-4 py-10">
        <div className="border-t border-ink-200/60 pt-6 text-xs leading-relaxed text-ink-400">
          FlipLocker — private, invitation-only deals. Buyer payments are held securely by our
          payment processor until documentation and delivery are complete.
        </div>
      </footer>
    </div>
  );
}

export function VerifyEmailBanner({ user }: { user: User }) {
  if (user.emailVerified) return null;
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span>Please confirm your email address — check your inbox for the confirmation link.</span>
      <Link href="/resend-verification" className="whitespace-nowrap font-semibold underline">
        Resend link
      </Link>
    </div>
  );
}
