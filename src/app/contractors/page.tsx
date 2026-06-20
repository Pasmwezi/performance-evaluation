import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ContractorsPage() {
  const session = await getServerSession(authOptions);
  if (!session) { redirect("/login"); }

  const contractors = await prisma.contractor.findMany({
    include: { evaluations: true },
    orderBy: { name: "asc" }
  });

  const enrichedContractors = contractors.map(c => {
    const totalEvals = c.evaluations.length;
    const avgScore = totalEvals > 0 
      ? Math.round(c.evaluations.reduce((sum, e) => sum + (e.totalPoints || 0), 0) / totalEvals) 
      : null;
    return { ...c, totalEvals, avgScore, isUnderperforming: avgScore !== null && avgScore < 60 };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Contractors</h1>
          <p className="mt-1 text-sm text-slate-500">Performance history across all tracked contractors.</p>
        </div>
        <Link href="/contractor/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Evaluation
        </Link>
      </div>

      <div className="space-y-3">
        {enrichedContractors.map((contractor) => (
          <Link key={contractor.id} href={`/contractors/${contractor.id}`} className="block app-card p-4 card-hover group">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${contractor.isUnderperforming ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                  <span className={`font-bold text-sm ${contractor.isUnderperforming ? 'text-rose-400' : 'text-emerald-400'}`}>{contractor.name[0]}</span>
                </div>
                <div>
                  <p className="text-slate-950 font-medium">{contractor.name}</p>
                  <p className="text-xs text-slate-500">{contractor.address || "No address provided"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  {contractor.avgScore !== null ? (
                    <>
                      <p className={`font-bold text-lg ${contractor.isUnderperforming ? 'text-rose-400' : 'text-emerald-400'}`}>{contractor.avgScore}<span className="text-slate-500 text-sm font-normal">/100</span></p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${contractor.isUnderperforming ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {contractor.isUnderperforming ? 'Underperforming' : 'Good Standing'}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">No evaluations</span>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-slate-500">{contractor.totalEvals}</p>
                  <p className="text-xs text-slate-500">evals</p>
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </div>
            </div>
            {contractor.avgScore !== null && (
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
                <div className={`h-1 rounded-full ${contractor.isUnderperforming ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${contractor.avgScore}%` }} />
              </div>
            )}
          </Link>
        ))}
        {enrichedContractors.length === 0 && (
          <div className="app-card p-8 text-center">
            <p className="text-slate-500">No contractors found. Create one by submitting an evaluation.</p>
          </div>
        )}
      </div>
    </div>
  );
}



