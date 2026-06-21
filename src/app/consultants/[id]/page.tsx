import { requireProtectedBSession } from "@/lib/protected-access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { toProtectedFileUrl } from "@/lib/protected-files";

export default async function ConsultantDetailPage({ params }: PageProps<"/consultants/[id]">) {
  const { id } = await params;
  const session = await requireProtectedBSession();

  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: { evaluations: { orderBy: { createdAt: 'desc' } } }
  });

  if (!consultant) {
    return <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Consultant not found</div>;
  }

  const totalEvals = consultant.evaluations.length;
  const avgScore = totalEvals > 0 
    ? Math.round(consultant.evaluations.reduce((sum, e) => sum + (e.totalPoints || 0), 0) / totalEvals) 
    : null;
  const isUnderperforming = avgScore !== null && avgScore < 60;

  return (
    <div className="space-y-6">
      <Link href="/consultants" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back to Consultants
      </Link>

      <div className="app-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold ${isUnderperforming ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
              {consultant.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">{consultant.name}</h1>
              <p className="text-sm text-slate-500">{consultant.address || "No address on file"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {avgScore !== null && (
              <div className="text-center">
                <p className={`text-3xl font-bold ${isUnderperforming ? 'text-rose-400' : 'text-emerald-400'}`}>{avgScore}</p>
                <p className="text-xs text-slate-500">Avg Score</p>
              </div>
            )}
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${isUnderperforming ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {isUnderperforming ? 'Underperforming' : 'Good Standing'}
            </span>
          </div>
        </div>
        {avgScore !== null && (
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className={`h-2 rounded-full score-bar-animated ${isUnderperforming ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${avgScore}%` }} />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-950 mb-4">Evaluation History <span className="text-slate-500 text-sm font-normal">({totalEvals})</span></h2>
        <div className="space-y-3">
          {consultant.evaluations.map((evaluation) => (
            <div key={evaluation.id} className="app-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 font-medium text-sm">Contract {evaluation.contractNumber}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500 text-sm">Project {evaluation.projectNumber}</span>
                </div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${(evaluation.totalPoints || 0) < 60 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {evaluation.totalPoints}/100
                </span>
              </div>
              {evaluation.descriptionOfWork && (
                <p className="text-sm text-slate-500 mb-2">{evaluation.descriptionOfWork}</p>
              )}
              <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Evaluated: {evaluation.createdAt.toLocaleDateString()}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/consultants/${consultant.id}/evaluations/${evaluation.id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 font-semibold text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-50">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    View evaluation
                  </Link>
                  {evaluation.originalPdfUrl && (
                    <a href={toProtectedFileUrl(evaluation.originalPdfUrl)} download className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 font-semibold text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 16.5V3" /></svg>
                      Download form
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
                <div className={`h-1 rounded-full ${(evaluation.totalPoints || 0) < 60 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${evaluation.totalPoints || 0}%` }} />
              </div>
            </div>
          ))}
          {consultant.evaluations.length === 0 && (
            <div className="app-card p-8 text-center text-slate-500">
              No evaluations recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}









