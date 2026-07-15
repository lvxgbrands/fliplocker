import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Wordmark } from "@/components/brand";

export const dynamic = "force-dynamic";

function extractLinks(html: string): string[] {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  return [...new Set(hrefs)].filter((h) => h.startsWith("http"));
}

// Staging-only mailbox: shows every transactional email the platform sent.
// With RESEND_API_KEY unset, this is where invitation/alert emails land so
// the full flow is demoable. Disable with DEV_MAILBOX=off in production.
export default async function DevMailboxPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  if (process.env.DEV_MAILBOX === "off") notFound();
  const { open } = await searchParams;

  const [emails, texts] = await Promise.all([
    db.emailOutbox.findMany({ orderBy: { sentAt: "desc" }, take: 50 }),
    db.smsOutbox.findMany({ orderBy: { sentAt: "desc" }, take: 30 }),
  ]);
  const openEmail = open ? emails.find((e) => e.id === open) : null;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Wordmark />
          <span className="text-xs font-bold uppercase tracking-wide rounded bg-amber-100 text-amber-800 px-2 py-1">
            Staging mailbox
          </span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 h-fit">
          {emails.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No emails sent yet.</p>
          ) : (
            emails.map((e) => (
              <Link
                key={e.id}
                href={`/dev/mailbox?open=${e.id}`}
                className={`block px-4 py-3 hover:bg-slate-50 ${open === e.id ? "bg-teal-50/60" : ""}`}
              >
                <p className="text-sm font-semibold text-slate-800 truncate">{e.subject}</p>
                <p className="text-xs text-slate-400 truncate">
                  to {e.toEmail} ·{" "}
                  {new Date(e.sentAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}{" "}
                  · via {e.provider}
                </p>
              </Link>
            ))
          )}
          {texts.length > 0 && (
            <div className="border-t-4 border-slate-100">
              <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                SMS ({texts.length})
              </p>
              {texts.map((t) => (
                <div key={t.id} className="px-4 py-2.5 border-t border-slate-100">
                  <p className="text-xs text-slate-400">to {t.toPhone} · via {t.provider}</p>
                  <p className="text-sm text-slate-700">{t.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {openEmail ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Links in this email:</p>
                <div className="flex flex-wrap gap-2">
                  {extractLinks(openEmail.html).map((href) => (
                    <a
                      key={href}
                      href={href}
                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                    >
                      {new URL(href).pathname.split("/").filter(Boolean)[0] || "open"} →
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <iframe title={openEmail.subject} srcDoc={openEmail.html} className="w-full h-[70vh]" sandbox="" />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white min-h-[400px]">
              <p className="p-8 text-sm text-slate-400">Select an email to preview it.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
