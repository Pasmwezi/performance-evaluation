import { requireProtectedBSession } from "@/lib/protected-access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface ReportsPageProps {
  searchParams: Promise<{
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireProtectedBSession();
  const params = await searchParams;

  const type = params.type || "all";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";

  // Date filters
  const dateFilter: any = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) {
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    dateFilter.lte = endOfDay;
  }
  const hasDateFilter = dateFrom || dateTo;
  const where = hasDateFilter ? { createdAt: dateFilter } : {};

  // Fetch data
  const [contractorEvals, consultantEvals] = await Promise.all([
    type === "all" || type === "contractor"
      ? prisma.contractorEvaluation.findMany({
          where,
          include: { contractor: true },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "consultant"
      ? prisma.consultantEvaluation.findMany({
          where,
          include: { consultant: true },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  // Combine and map evaluations
  const allEvals = [
    ...contractorEvals.map((e) => ({
      id: e.id,
      score: e.totalPoints || 0,
      createdAt: e.createdAt,
      type: "Contractor" as const,
      vendorName: e.contractor.name,
    })),
    ...consultantEvals.map((e) => ({
      id: e.id,
      score: e.totalPoints || 0,
      createdAt: e.createdAt,
      type: "Consultant" as const,
      vendorName: e.consultant.name,
    })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Metrics
  const totalCount = allEvals.length;
  const avgScore =
    totalCount > 0
      ? Math.round(allEvals.reduce((sum, e) => sum + e.score, 0) / totalCount)
      : 0;

  const underperformingCount = allEvals.filter((e) => e.score < 60).length;
  const satisfactoryCount = allEvals.filter((e) => e.score >= 60 && e.score < 80).length;
  const excellentCount = allEvals.filter((e) => e.score >= 80).length;

  // Chart 1: Score Distribution Bar Chart (Native SVG)
  const maxBarVal = Math.max(underperformingCount, satisfactoryCount, excellentCount, 1);
  const chartHeight = 160;
  const underHeight = (underperformingCount / maxBarVal) * chartHeight;
  const satHeight = (satisfactoryCount / maxBarVal) * chartHeight;
  const excelHeight = (excellentCount / maxBarVal) * chartHeight;

  // Chart 2: Score Trend Over Time (grouped by month)
  const monthlyData: Record<string, { sum: number; count: number }> = {};
  allEvals.forEach((e) => {
    const month = e.createdAt.toLocaleString("en-US", { year: "numeric", month: "short" });
    if (!monthlyData[month]) {
      monthlyData[month] = { sum: 0, count: 0 };
    }
    monthlyData[month].sum += e.score;
    monthlyData[month].count += 1;
  });

  const trends = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    avg: Math.round(data.sum / data.count),
    count: data.count,
  }));

  // Build export query string
  const exportUrl = `/api/reports/export?type=${type}&dateFrom=${dateFrom}&dateTo=${dateTo}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Procurement QA</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Performance Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Aggregated reporting of contractor & consultant evaluations.</p>
        </div>
        <a
          href={exportUrl}
          className="btn-primary flex items-center justify-center gap-2 h-11"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV Report
        </a>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="app-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Evaluation Type</label>
            <select
              name="type"
              defaultValue={type}
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            >
              <option value="all">All Vendors</option>
              <option value="contractor">Contractors Only</option>
              <option value="consultant">Consultants Only</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date From</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date To</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-950 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-secondary flex-1 h-10 py-0">Apply Filters</button>
            <Link
              href="/reports"
              className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="app-card p-5 bg-gradient-to-br from-teal-50/20 to-teal-50/50">
          <p className="text-sm font-medium text-slate-500">Average Performance Score</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-700">{avgScore}</span>
            <span className="text-sm text-slate-500">/100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Target baseline: 60/100</p>
        </div>

        <div className="app-card p-5">
          <p className="text-sm font-medium text-slate-500">Total Evaluations Tracked</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-950">{totalCount}</span>
            <span className="text-sm text-slate-500">submissions</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Within filtered date range</p>
        </div>

        <div className="app-card p-5 bg-gradient-to-br from-rose-50/20 to-rose-50/50 border-rose-100/50">
          <p className="text-sm font-medium text-slate-500">Underperforming Flags</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600">{underperformingCount}</span>
            <span className="text-sm text-slate-500">vendors</span>
          </div>
          <p className="mt-2 text-xs text-rose-500/80 font-medium">Requires immediate oversight</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 mb-6">Score Distribution</h3>
          <div className="flex justify-center py-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <svg width="400" height="240" viewBox="0 0 400 240" className="overflow-visible">
              {/* Y Axis Gridlines */}
              <line x1="40" y1="20" x2="360" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="360" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="180" x2="360" y2="180" stroke="#f1f5f9" strokeWidth="1" />

              {/* Bars */}
              {/* Underperforming (<60) */}
              <rect
                x="60"
                y={180 - underHeight}
                width="60"
                height={underHeight}
                rx="4"
                fill="url(#rose-grad)"
              />
              <text x="90" y={170 - underHeight} textAnchor="middle" className="text-xs font-bold fill-rose-600">
                {underperformingCount}
              </text>

              {/* Satisfactory (60-79) */}
              <rect
                x="170"
                y={180 - satHeight}
                width="60"
                height={satHeight}
                rx="4"
                fill="url(#amber-grad)"
              />
              <text x="200" y={170 - satHeight} textAnchor="middle" className="text-xs font-bold fill-amber-600">
                {satisfactoryCount}
              </text>

              {/* Excellent (80-100) */}
              <rect
                x="280"
                y={180 - excelHeight}
                width="60"
                height={excelHeight}
                rx="4"
                fill="url(#teal-grad)"
              />
              <text x="310" y={170 - excelHeight} textAnchor="middle" className="text-xs font-bold fill-teal-700">
                {excellentCount}
              </text>

              {/* Baseline Y=180 */}
              <line x1="40" y1="180" x2="360" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* X Labels */}
              <text x="90" y="200" textAnchor="middle" className="text-xs font-semibold fill-slate-500">
                &lt; 60 (Low)
              </text>
              <text x="200" y="200" textAnchor="middle" className="text-xs font-semibold fill-slate-500">
                60 - 79
              </text>
              <text x="310" y="200" textAnchor="middle" className="text-xs font-semibold fill-slate-500">
                80+ (High)
              </text>

              {/* Gradients */}
              <defs>
                <linearGradient id="rose-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fda4af" />
                </linearGradient>
                <linearGradient id="amber-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fde68a" />
                </linearGradient>
                <linearGradient id="teal-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Average Performance Trend */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 mb-6">Score Trend (Monthly)</h3>
          {trends.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
              No trend data available for selected filter.
            </div>
          ) : (
            <div className="flex justify-center py-4 bg-slate-50/50 rounded-xl border border-slate-100 overflow-x-auto">
              <svg width="400" height="240" viewBox="0 0 400 240" className="overflow-visible">
                {/* Gridlines */}
                <line x1="40" y1="30" x2="360" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="100" x2="360" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="170" x2="360" y2="170" stroke="#f1f5f9" strokeWidth="1" />

                {/* X and Y baseline */}
                <line x1="40" y1="170" x2="360" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Trend line points plotting */}
                {(() => {
                  const stepX = trends.length > 1 ? 300 / (trends.length - 1) : 300;
                  const getX = (idx: number) => 40 + idx * stepX;
                  const getY = (val: number) => 170 - (val / 100) * 140; // scales 0-100 to y ranges 170-30

                  let pathD = "";
                  trends.forEach((t, i) => {
                    const prefix = i === 0 ? "M" : "L";
                    pathD += `${prefix} ${getX(i)} ${getY(t.avg)} `;
                  });

                  return (
                    <>
                      {/* Grid labels */}
                      <text x="35" y="34" textAnchor="end" className="text-[10px] font-mono fill-slate-400">100</text>
                      <text x="35" y="104" textAnchor="end" className="text-[10px] font-mono fill-slate-400">50</text>
                      <text x="35" y="174" textAnchor="end" className="text-[10px] font-mono fill-slate-400">0</text>

                      {/* Connection path */}
                      {trends.length > 1 && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#0f766e"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Dots and tooltips */}
                      {trends.map((t, idx) => {
                        const cx = getX(idx);
                        const cy = getY(t.avg);
                        return (
                          <g key={t.month}>
                            <circle
                              cx={cx}
                              cy={cy}
                              r="4.5"
                              fill="#0f766e"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                            <text
                              x={cx}
                              y={cy - 10}
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-teal-900 bg-white"
                            >
                              {t.avg}
                            </text>
                            <text
                              x={cx}
                              y="190"
                              textAnchor="middle"
                              className="text-[9px] font-semibold fill-slate-500"
                            >
                              {t.month}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
