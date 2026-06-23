/**
 * In-memory sliding window rate limiter.
 * Tracks timestamps of requests for a given key to allow rate limiting
 * with high accuracy.
 */

type Timestamp = number;

const cache = new Map<string, Timestamp[]>();

// Clean up memory periodically
if (typeof globalThis !== 'undefined') {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of cache.entries()) {
      // Keep only timestamps less than 1 hour old for cleanup
      const active = timestamps.filter((t) => now - t < 60 * 60 * 1000);
      if (active.length === 0) {
        cache.delete(key);
      } else {
        cache.set(key, active);
      }
    }
  }, 5 * 60 * 1000);
  
  // Prevent Node from keeping the process alive because of this timer
  if (interval.unref) {
    interval.unref();
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Checks if the request under `key` exceeds `limit` operations within `windowMs`.
 * 
 * @param key Unique key for rate limiting (e.g., ip + ":" + endpoint)
 * @param limit Maximum number of allowed attempts
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  
  let timestamps = cache.get(key) || [];
  
  // Filter out timestamps outside the current sliding window
  timestamps = timestamps.filter((t) => t > cutoff);
  
  if (timestamps.length >= limit) {
    // Calculate reset time based on the oldest timestamp in the window
    const oldestInWindow = timestamps[0];
    const resetAt = new Date(oldestInWindow + windowMs);
    
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt,
    };
  }
  
  // Record the current attempt
  timestamps.push(now);
  cache.set(key, timestamps);
  
  // Calculate remaining attempts
  const remaining = limit - timestamps.length;
  
  // Reset time is roughly windowMs from the earliest timestamp currently in the window
  const resetAt = new Date((timestamps[0] || now) + windowMs);
  
  return {
    success: true,
    limit,
    remaining,
    resetAt,
  };
}
