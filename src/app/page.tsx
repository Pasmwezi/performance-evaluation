import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const [contractors, consultants] = await Promise.all([
    prisma.contractor.findMany({ include: { evaluations: true } }),
    prisma.consultant.findMany({ include: { evaluations: true } }),
  ]);

  const mapEntities = (entities: any[], type: "Contractor" | "Consultant") => {
    return entities.map(e => {
      const totalEvals = e.evaluations.length;
      const avgScore = totalEvals > 0 
        ? Math.round(e.evaluations.reduce((sum: number, evalItem: any) => sum + (evalItem.totalPoints || 0), 0) / totalEvals) 
        : null;
      return { ...e, totalEvals, avgScore, type };
    });
  };

  const enrichedContractors = mapEntities(contractors, "Contractor");
  const enrichedConsultants = mapEntities(consultants, "Consultant");
  const allEntities = [...enrichedContractors, ...enrichedConsultants];
  const underperforming = allEntities.filter(e => e.avgScore !== null && e.avgScore < 60);
  const totalEvaluations = contractors.reduce((s, c) => s + c.evaluations.length, 0) + consultants.reduce((s, c) => s + c.evaluations.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">Procurement Dashboard</h1>
          <p className="mt-1 text-slate-500 text-sm">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/contractors" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg>
            Contractors
          </Link>
          <Link href="/consultants" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            Consultants
          </Link>
          <Link href="/contractor/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Contractor Eval
          </Link>
          <Link href="/consultant/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Consultant Eval
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="app-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{contractors.length}</p>
              <p className="text-xs text-slate-500">Contractors</p>
            </div>
          </div>
        </div>
        <div className="app-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{consultants.length}</p>
              <p className="text-xs text-slate-500">Consultants</p>
            </div>
          </div>
        </div>
        <div className="app-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{totalEvaluations}</p>
              <p className="text-xs text-slate-500">Evaluations</p>
            </div>
          </div>
        </div>
        <div className="app-card p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${underperforming.length > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
              {underperforming.length > 0 ? (
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold ${underperforming.length > 0 ? 'text-rose-400' : 'text-slate-950'}`}>{underperforming.length}</p>
              <p className="text-xs text-slate-500">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {underperforming.length > 0 && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
          <h2 className="text-lg font-semibold text-slate-950">Underperforming Watchlist</h2>
          <span className="text-xs text-slate-500 bg-white/70 px-2 py-0.5 rounded-full">Score &lt; 60</span>
        </div>

        {underperforming.length > 0 ? (
          <div className="space-y-3">
            {underperforming.map((entity) => (
              <Link
                key={`${entity.type}-${entity.id}`}
                href={entity.type === "Contractor" ? `/contractors/${entity.id}` : `/consultants/${entity.id}`}
                className="block app-card p-4 card-hover group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <span className="text-rose-400 font-bold text-sm">{entity.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-slate-950 font-medium">{entity.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${entity.type === 'Contractor' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                        {entity.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-rose-400 font-bold text-lg">{entity.avgScore}<span className="text-slate-500 text-sm font-normal">/100</span></p>
                      <p className="text-xs text-slate-500">{entity.totalEvals} eval{entity.totalEvals !== 1 ? 's' : ''}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </div>
                </div>
                {/* Score bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-rose-400 h-1.5 rounded-full score-bar-animated"
                    style={{ width: `${entity.avgScore}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="app-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-emerald-400 font-medium">All clear</p>
            <p className="text-slate-500 text-sm mt-1">No contractors or consultants are currently flagged.</p>
          </div>
        )}
      </div>
    </div>
  );
}



