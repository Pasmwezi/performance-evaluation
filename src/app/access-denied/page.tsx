import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccessDeniedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-2xl items-center">
      <section className="app-card w-full p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Protected B access required</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">This workspace is restricted</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Completed evaluation forms are treated as Protected B. Access is limited to authenticated individuals with Reliability status, need-to-know, and an email listed in <code className="rounded bg-slate-100 px-1 py-0.5">PROTECTED_B_AUTHORIZED_EMAILS</code>.
        </p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Signed in as <span className="font-semibold text-slate-950">{session.user?.email}</span>. Contact the designated security officer or application administrator if this account should be authorized.
        </div>
      </section>
    </div>
  );
}

