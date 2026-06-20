"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="app-card p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-base font-bold text-white shadow-sm">
              PE
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Create your account</h1>
              <p className="text-sm text-slate-500">Start tracking procurement performance.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</label>
              <input id="name" type="text" required className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none" placeholder="John Doe" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email address</label>
              <input id="email" type="email" required className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none" placeholder="you@example.com" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <input id="password" type="password" required className="block w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none" placeholder="Password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                {error}
              </div>
            )}

            <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:from-teal-800 hover:to-cyan-800 hover:shadow-lg hover:shadow-cyan-700/20 active:translate-y-0">
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-700 transition-colors hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
