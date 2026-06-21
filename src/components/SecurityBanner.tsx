export default function SecurityBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>
            Completed evaluation forms are <strong>Protected B</strong>. Access requires Reliability status, need-to-know, and explicit authorization.
          </span>
        </div>
        <span className="inline-flex w-fit rounded-md border border-amber-300 bg-white/70 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          Protected B
        </span>
      </div>
    </div>
  );
}
