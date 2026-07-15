import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { consumeAuthToken, createSession, getCurrentUser } from "@/lib/auth";

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await consumeAuthToken(token, "EMAIL_VERIFY");

  if (row) {
    await db.user.update({ where: { id: row.userId }, data: { emailVerified: new Date() } });
    // The link came from the user's inbox, safe to sign them in.
    const current = await getCurrentUser();
    if (!current || current.id === row.userId) {
      if (!current) await createSession(row.userId);
      redirect("/dashboard?documented=1");
    }
    redirect("/login?documented=1");
  }

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-bold">Link expired</h1>
      <p className="text-sm text-ink-500">
        That confirmation link is invalid or has already been used.
      </p>
      <Link className="font-semibold text-brand-700 hover:underline text-sm" href="/resend-verification">
        Send a new confirmation link
      </Link>
    </div>
  );
}
