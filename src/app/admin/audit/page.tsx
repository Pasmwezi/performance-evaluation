import { requireAdminSession } from "@/lib/protected-access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface AuditPageProps {
  searchParams: Promise<{
    page?: string;
    email?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

function formatDate(date: Date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function AuditLogPage({ searchParams }: AuditPageProps) {
  await requireAdminSession();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const email = params.email || "";
  const action = params.action || "";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";

  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (email) {
    where.userEmail = { contains: email, mode: "insensitive" };
  }
  if (action) {
    where.action = action;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt.lte = endOfDay;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const distinctActions = [
    "LOGIN",
    "LOGIN_FAILED",
    "REGISTER",
    "CREATE_EVALUATION",
    "UPDATE_USER_ACCESS",
    "UPLOAD_FILE",
    "DOWNLOAD_FILE",
    "EXTRACT_PDF",
    "PASSWORD_RESET",
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Security Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Immutable trace of security events, administrative updates, and evaluation creations.</p>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="app-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">User Email</label>
            <input
              type="text"
              name="email"
              defaultValue={email}
              placeholder="Filter by email"
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Action</label>
            <select
              name="action"
              defaultValue={action}
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            >
              <option value="">All Actions</option>
              {distinctActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date From</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date To</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 h-10 py-0">Filter</button>
            <Link
              href="/admin/audit"
              className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Clear
            </Link>
          </div>
        </div>
      </form>

      {/* Logs Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No audit log entries found matching filters.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          log.action.includes("FAILED")
                            ? "bg-rose-50 text-rose-700"
                            : log.action.startsWith("UPDATE") || log.action.includes("RESET")
                            ? "bg-amber-50 text-amber-700"
                            : "bg-teal-50 text-teal-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-950">{log.userEmail}</div>
                      <div className="text-xs text-slate-400">ID: {log.userId}</div>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-md break-all">
                      <div className="text-slate-600">
                        {log.entityType && (
                          <span className="font-semibold text-slate-800">
                            {log.entityType}[{log.entityId}]:{" "}
                          </span>
                        )}
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {log.ipAddress || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
            <div className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/audit?page=${page - 1}&email=${email}&action=${action}&dateFrom=${dateFrom}&dateTo=${dateTo}`}
                className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors ${
                  page <= 1 ? "pointer-events-none opacity-50 bg-slate-100" : "bg-white hover:bg-slate-50"
                }`}
              >
                Previous
              </Link>
              <span className="px-3 text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/admin/audit?page=${page + 1}&email=${email}&action=${action}&dateFrom=${dateFrom}&dateTo=${dateTo}`}
                className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors ${
                  page >= totalPages ? "pointer-events-none opacity-50 bg-slate-100" : "bg-white hover:bg-slate-50"
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
