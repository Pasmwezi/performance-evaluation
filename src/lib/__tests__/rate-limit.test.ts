import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit } from "../rate-limit";

describe("Rate Limiter (Sliding Window)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests under the limit", () => {
    const key = "test-key-1";
    const windowMs = 60 * 1000; // 1 minute
    const limit = 3;

    // First attempt
    const res1 = checkRateLimit(key, limit, windowMs);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    // Second attempt
    const res2 = checkRateLimit(key, limit, windowMs);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    // Third attempt
    const res3 = checkRateLimit(key, limit, windowMs);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should block requests exceeding the limit", () => {
    const key = "test-key-2";
    const windowMs = 60 * 1000;
    const limit = 2;

    // Use up the limit
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    // Third attempt should fail
    const res = checkRateLimit(key, limit, windowMs);
    expect(res.success).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it("should reset/allow requests after the window expires", () => {
    const key = "test-key-3";
    const windowMs = 60 * 1000;
    const limit = 2;

    // Use up the limit at t=0
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    // Verify blocked at t=30s
    vi.advanceTimersByTime(30000);
    const blockedRes = checkRateLimit(key, limit, windowMs);
    expect(blockedRes.success).toBe(false);

    // Advance past the 1-minute window
    vi.advanceTimersByTime(31000); // Total t = 61s

    // Now it should be allowed again
    const allowedRes = checkRateLimit(key, limit, windowMs);
    expect(allowedRes.success).toBe(true);
    expect(allowedRes.remaining).toBe(1); // 1 remaining because 1 just used
  });
});
