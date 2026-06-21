import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../prisma";

const BASE_URL = "http://localhost:3001";

describe("Live API & HTTP Endpoint Integration Tests", () => {
  const registeredEmails: string[] = [];

  afterAll(async () => {
    // Clean up registered test users
    if (registeredEmails.length > 0) {
      await prisma.user.deleteMany({
        where: {
          email: { in: registeredEmails },
        },
      });
    }
    await prisma.$disconnect();
  });

  it("should redirect to login or show login page when accessing dashboard without auth", async () => {
    const res = await fetch(`${BASE_URL}/`, { redirect: "manual" });
    // Next.js page requests or redirect
    expect([200, 302, 307]).toContain(res.status);
  });

  it("should return 401 when calling contractor api without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/contractor`);
    expect(res.status).toBe(401);
  });

  it("should return 401 when calling consultant api without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/consultant`);
    expect(res.status).toBe(401);
  });

  it("should return 401 when calling extract api without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/extract`, { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("should register a new user successfully and save to database", async () => {
    const testEmail = `test-api-user-${Date.now()}@example.com`;
    const payload = {
      email: testEmail,
      password: "password123",
      name: "API Test User",
    };

    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe(testEmail);
    expect(data.name).toBe("API Test User");
    expect(data.role).toBe("CONTRACTING_OFFICER");

    // Track for cleanup
    registeredEmails.push(testEmail);

    // Verify it exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.name).toBe("API Test User");
  });
});
