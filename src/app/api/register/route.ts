import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (5 registrations per IP per 15 minutes)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitResult = checkRateLimit(`${ip}:register`, 5, 15 * 60 * 1000);
    if (!limitResult.success) {
      return new Response("Too many registration attempts. Please try again in 15 minutes.", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
        },
      });
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return new Response("Missing email or password", { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 2. Password Strength Validation (min 8 chars, 1 letter, 1 number)
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return new Response(
        "Password must be at least 8 characters long and contain both letters and numbers",
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (exists) {
      // Return a standard 400 error but with sanitized message
      return new Response("Email is already registered", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        role: "CONTRACTING_OFFICER",
        protectedBAccess: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        protectedBAccess: true,
      },
    });

    // 3. Log Audit Event
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "REGISTER",
      entityType: "User",
      entityId: user.id,
      details: { email: user.email, name: user.name },
      ipAddress: ip,
    });

    return Response.json(user);
  } catch (error) {
    console.error("Registration error:", error);
    return new Response("An internal error occurred", { status: 500 });
  }
}

