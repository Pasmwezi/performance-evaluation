import "server-only";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasAdminAccess, hasProtectedBAccess, hasEvaluatorAccess } from "@/lib/protected-policy";

export async function requireProtectedBSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!hasProtectedBAccess(session.user.email, session.user.protectedBAccess, session.user.role)) {
    redirect("/access-denied");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!hasAdminAccess(session.user.email, session.user.role)) {
    redirect("/access-denied");
  }

  return session;
}

export async function requireEvaluatorSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!hasEvaluatorAccess(session.user.role)) {
    redirect("/access-denied");
  }

  return session;
}

export async function requireProtectedBApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      session: null,
      response: new NextResponse("Unauthorized", {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }),
    };
  }

  if (!hasProtectedBAccess(session.user.email, session.user.protectedBAccess, session.user.role)) {
    return {
      session: null,
      response: new NextResponse("Protected B access required", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      }),
    };
  }

  return { session, response: null };
}

export function protectedJson<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  return NextResponse.json(data, { ...init, headers });
}
