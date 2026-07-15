import Link from "next/link";
import type { User } from "@prisma/client";
import { Wordmark } from "@/components/brand";
import { logoutAction } from "@/app/(auth)/actions";

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
  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Wordmark href={home} />
          <nav className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline text-slate-500">
              {user.name || user.email}
              <span className="ml-2 rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 text-xs font-medium">
                {user.role.toLowerCase()}
              </span>
            </span>
            <form action={logoutAction}>
              <button className="text-slate-500 hover:text-slate-900" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" className="max-w-5xl mx-auto px-4 py-8">
        {title ? <h1 className="text-2xl font-bold mb-6">{title}</h1> : null}
        {children}
      </main>
      <footer className="max-w-5xl mx-auto px-4 py-8 text-xs text-slate-400">
        FlipLocker — private, invitation-only deals. Buyer payments are held securely by our
        payment processor until verification and delivery are complete.
      </footer>
    </div>
  );
}

export function VerifyEmailBanner({ user }: { user: User }) {
  if (user.emailVerified) return null;
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-4">
      <span>
        Please verify your email address — check your inbox for the verification link.
      </span>
      <Link href="/resend-verification" className="font-semibold underline whitespace-nowrap">
        Resend link
      </Link>
    </div>
  );
}
