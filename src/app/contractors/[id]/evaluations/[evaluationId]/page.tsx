import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const formatDate = (date: Date | null) => date ? date.toLocaleDateString() : "Not recorded";
const formatMoney = (value: number | null) => value !== null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value) : "Not recorded";
const show = (value: string | number | null | undefined) => value !== null && value !== undefined && value !== "" ? String(value) : "Not recorded";

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-950">{show(value)}</p>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number | null }) {
  const score = value ?? 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{value ?? "-"}<span className="font-normal text-slate-400">/20</span></span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-gradient-to-r from-teal-700 to-cyan-700" style={{ width: `${Math.min(score * 5, 100)}%` }} />
      </div>
    </div>
  );
}

export default async function ContractorEvaluationPage({ params }: PageProps<"/contractors/[id]/evaluations/[evaluationId]">) {
  const { id, evaluationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) { redirect("/login"); }

  const evaluation = await prisma.contractorEvaluation.findFirst({
    where: { id: evaluationId, contractorId: id },
    include: { contractor: true },
  });

  if (!evaluation) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">Evaluation not found</div>;
  }

  const isUnderperforming = (evaluation.totalPoints || 0) < 60;

  return (
    <div className="space-y-6">
      <Link href={`/contractors/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-teal-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back to {evaluation.contractor.name}
      </Link>

      <div className="app-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Contractor Evaluation</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{evaluation.contractor.name}</h1>
            <p className="mt-2 text-sm text-slate-500">Contract {evaluation.contractNumber} / Project {evaluation.projectNumber}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {evaluation.originalPdfUrl ? (
              <a href={evaluation.originalPdfUrl} download className="btn-secondary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 16.5V3" /></svg>
                Download form
              </a>
            ) : (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400">No uploaded form</span>
            )}
            <div className={`rounded-lg border px-4 py-2 text-right ${isUnderperforming ? "border-rose-200 bg-rose-50 text-rose-600" : "border-teal-200 bg-teal-50 text-teal-700"}`}>
              <p className="text-2xl font-bold">{evaluation.totalPoints ?? 0}<span className="text-sm font-normal">/100</span></p>
              <p className="text-xs font-semibold uppercase tracking-wide">Total score</p>
            </div>
          </div>
        </div>
      </div>

      <section className="app-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Score Breakdown</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <ScoreItem label="Quality of Workmanship" value={evaluation.qualityOfWorkmanship} />
          <ScoreItem label="Time" value={evaluation.time} />
          <ScoreItem label="Project Management" value={evaluation.projectManagement} />
          <ScoreItem label="Contract Management" value={evaluation.contractManagement} />
          <ScoreItem label="Health and Safety" value={evaluation.healthAndSafety} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="app-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">Project Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Client reference" value={evaluation.clientReferenceNumber} />
            <DetailItem label="Superintendent" value={evaluation.superintendent} />
            <DetailItem label="Evaluated" value={formatDate(evaluation.createdAt)} />
            <DetailItem label="Final certificate" value={formatDate(evaluation.finalCertificateDate)} />
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description of work</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{show(evaluation.descriptionOfWork)}</p>
          </div>
        </div>

        <div className="app-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">Contract Information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Award amount" value={formatMoney(evaluation.awardAmount)} />
            <DetailItem label="Final amount" value={formatMoney(evaluation.finalAmount)} />
            <DetailItem label="Award date" value={formatDate(evaluation.awardDate)} />
            <DetailItem label="Completion date" value={formatDate(evaluation.completionDate)} />
            <DetailItem label="Change orders" value={evaluation.changeOrdersCount} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="app-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">Project Manager</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Name" value={evaluation.pmName} />
            <DetailItem label="Email" value={evaluation.pmEmail} />
            <DetailItem label="Telephone" value={evaluation.pmTelephone} />
            <DetailItem label="Cell" value={evaluation.pmCell} />
            <DetailItem label="Fax" value={evaluation.pmFax} />
          </div>
        </div>
        <div className="app-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">Comments</h2>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{show(evaluation.comments)}</p>
        </div>
      </section>
    </div>
  );
}
