import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SuccessNote } from "@/components/form-ui";
import { updateUserAction } from "../actions";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireUser("ADMIN");
  const { saved } = await searchParams;
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  const input = "rounded-lg border border-slate-300 px-2 py-1.5 text-sm bg-white";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Users</h1>
      {saved ? <SuccessNote message="User updated." /> : null}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Verified</th>
              <th className="px-4 py-2 font-medium">Role &amp; plan</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-slate-900">{u.name || "—"}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-2.5">
                  {u.emailVerified ? (
                    <span className="text-teal-600 text-xs">✔ verified</span>
                  ) : (
                    <span className="text-slate-400 text-xs">pending</span>
                  )}
                </td>
                <td className="px-4 py-2.5" colSpan={2}>
                  <form action={updateUserAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} className={input}>
                      {["SELLER", "BUYER", "FACILITATOR", "ADMIN"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <select name="plan" defaultValue={u.plan} className={input}>
                      {["FREE", "PRO"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <button className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
