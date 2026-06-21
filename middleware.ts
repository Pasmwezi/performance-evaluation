import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function parseEmailList(value?: string) {
  return (value || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function isBootstrapAdmin(email?: string | null) {
  return Boolean(email && parseEmailList(process.env.PROTECTED_B_ADMIN_EMAILS).includes(email.toLowerCase()));
}

function isBootstrapProtectedBUser(email?: string | null) {
  return Boolean(email && parseEmailList(process.env.PROTECTED_B_AUTHORIZED_EMAILS).includes(email.toLowerCase()));
}

function hasAdminAccess(email?: string | null, role?: string | null) {
  return role === "ADMIN" || isBootstrapAdmin(email);
}

function hasProtectedBAccess(email?: string | null, role?: string | null, tokenAccess = false) {
  return tokenAccess || role === "ADMIN" || isBootstrapAdmin(email) || isBootstrapProtectedBUser(email);
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const loginUrl = new URL("/login", req.url);

  if (!token) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.nextUrl.pathname === "/access-denied") {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/admin") && !hasAdminAccess(token.email, token.role)) {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  if (!hasProtectedBAccess(token.email, token.role, Boolean(token.protectedBAccess))) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse("Protected B access required", { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
