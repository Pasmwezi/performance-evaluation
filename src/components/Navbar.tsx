"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitial = (session?.user?.name || session?.user?.email || "U")[0].toUpperCase();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-sm transition-transform group-hover:-translate-y-0.5">
                PE
              </div>
              <div className="hidden leading-tight sm:block">
                <span className="block text-base font-bold tracking-tight text-slate-950">PerfEval</span>
                <span className="block text-[11px] font-medium text-slate-500">Procurement QA</span>
              </div>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/contractors" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/70 hover:text-teal-700">
                Contractors
              </Link>
              <Link href="/consultants" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/70 hover:text-teal-700">
                Consultants
              </Link>
              {session?.user?.adminAccess && (
                <Link href="/admin/users" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/70 hover:text-teal-700">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">
                    {userInitial}
                  </div>
                  <span className="max-w-44 truncate text-sm font-medium text-slate-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-secondary">
                Sign in
              </Link>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 md:hidden"
            aria-label="Toggle navigation"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-slate-200/70 bg-white/70 px-4 py-3 shadow-sm md:hidden">
          <Link href="/contractors" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-teal-700" onClick={() => setMobileOpen(false)}>Contractors</Link>
          <Link href="/consultants" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-teal-700" onClick={() => setMobileOpen(false)}>Consultants</Link>
          {session?.user?.adminAccess && (
            <Link href="/admin/users" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-teal-700" onClick={() => setMobileOpen(false)}>Admin</Link>
          )}
          {session && (
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600">
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}



