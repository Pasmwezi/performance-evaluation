import { requireAdminSession } from "@/lib/protected-access";
import { prisma } from "@/lib/prisma";
import { updateUserAccess } from "./actions";

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminUsersPage() {
  await requireAdminSession();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      protectedBAccess: true,
      accessJustification: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Admin</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">User Access</h1>
          <p className="mt-1 text-sm text-slate-500">Grant app roles and Protected B access to approved individuals.</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          Admins always have Protected B access
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <form key={user.id} action={updateUserAccess} className="app-card p-4">
            <input type="hidden" name="userId" value={user.id} />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_220px_180px_minmax(220px,1fr)_auto] lg:items-end">
              <div>
                <p className="font-semibold text-slate-950">{user.name || "Unnamed user"}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-400">Created {formatDate(user.createdAt)} / Updated {formatDate(user.updatedAt)}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Group</label>
                <select name="role" defaultValue={user.role} className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-950 focus:border-teal-600 focus:outline-none">
                  <option value="CONTRACTING_OFFICER">Contracting officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 text-sm font-semibold text-slate-700">
                <input name="protectedBAccess" type="checkbox" defaultChecked={user.protectedBAccess || user.role === "ADMIN"} className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
                Protected B access
              </label>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Need-to-know note</label>
                <input name="accessJustification" defaultValue={user.accessJustification || ""} placeholder="Contract, team, or approval reference" className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none" />
              </div>

              <button type="submit" className="btn-primary h-11">Save</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
