import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./src/lib/rate-limit";
import { hasAdminAccess, hasProtectedBAccess } from "./src/lib/protected-policy";

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; object-src 'none'; frame-ancestors 'none';"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}

export async function proxy(req: NextRequest) {
  // 1. Rate Limiting for Credentials Login Callback
  if (req.nextUrl.pathname === "/api/auth/callback/credentials") {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitResult = checkRateLimit(`${ip}:login`, 10, 15 * 60 * 1000);
    if (!limitResult.success) {
      const res = new NextResponse(
        JSON.stringify({ success: false, message: "Too many login attempts. Please try again in 15 minutes." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((limitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
      return addSecurityHeaders(res);
    }
    // Allow NextAuth middleware/handler to process the credentials check
    return NextResponse.next();
  }

  // 2. Authentication and Authorization Guard
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const loginUrl = new URL("/login", req.url);

  if (!token) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      const res = new NextResponse("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
      return addSecurityHeaders(res);
    }

    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    const res = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(res);
  }

  if (req.nextUrl.pathname === "/access-denied") {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    return addSecurityHeaders(res);
  }

  if (req.nextUrl.pathname.startsWith("/admin") && !hasAdminAccess(token.email, token.role)) {
    const res = NextResponse.redirect(new URL("/access-denied", req.url));
    return addSecurityHeaders(res);
  }

  if (!hasProtectedBAccess(token.email, Boolean(token.protectedBAccess), token.role)) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      const res = new NextResponse("Protected B access required", { status: 403, headers: { "Cache-Control": "no-store" } });
      return addSecurityHeaders(res);
    }

    const res = NextResponse.redirect(new URL("/access-denied", req.url));
    return addSecurityHeaders(res);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    // Protect routes except static files, images, auth api, registration, etc.
    "/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Explicitly run proxy on the credentials login callback
    "/api/auth/callback/credentials",
  ],
};
