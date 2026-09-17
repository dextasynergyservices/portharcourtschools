import { redis } from "./redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

// In-memory sliding-window fallback store (IP -> array of timestamp ms)
const memoryBuckets = new Map<string, number[]>();

// Cleanup stale memory rate limit entries every 5 minutes
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(
    () => {
      const now = Date.now();
      for (const [key, timestamps] of memoryBuckets.entries()) {
        const active = timestamps.filter((t) => t > now - 15 * 60 * 1000);
        if (active.length === 0) {
          memoryBuckets.delete(key);
        } else {
          memoryBuckets.set(key, active);
        }
      }
    },
    5 * 60 * 1000,
  );

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Extract reliable client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    if (parts[0]) return parts[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Dual-tier sliding window rate limiter:
 * 1. Uses Upstash Redis if configured and healthy.
 * 2. Transparently falls back to in-memory window if Redis is not configured
 *    or has reached its free-tier daily command limit.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const resetUnix = Math.ceil((now + windowMs) / 1000);

  // 1. Try Upstash Redis if available
  if (redis) {
    try {
      const redisKey = `ratelimit:${identifier}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        reset: resetUnix,
      };
    } catch {
      // Redis error or command quota hit — fall back to in-memory sliding window
    }
  }

  // 2. In-Memory Sliding Window Fallback
  const windowStart = now - windowMs;
  const currentTimestamps = memoryBuckets.get(identifier) || [];
  const validTimestamps = currentTimestamps.filter((t) => t > windowStart);

  if (validTimestamps.length >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: resetUnix,
    };
  }

  validTimestamps.push(now);
  memoryBuckets.set(identifier, validTimestamps);

  return {
    success: true,
    remaining: limit - validTimestamps.length,
    reset: resetUnix,
  };
}

/**
 * Rate limit login attempts to prevent password brute-forcing (5 per 15 minutes)
 */
export async function checkLoginRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  return checkRateLimit(`login:${ip}`, 5, 15 * 60);
}

/**
 * Rate limit contact form submissions to prevent spam (5 per 10 minutes)
 */
export async function checkContactRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  return checkRateLimit(`contact:${ip}`, 5, 10 * 60);
}

/**
 * Rate limit event registrations to prevent bots flooding seats (10 per 10 minutes)
 */
export async function checkRegistrationRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  return checkRateLimit(`registration:${ip}`, 10, 10 * 60);
}

/**
 * Rate limit award / summit nominations (5 per 10 minutes)
 */
export async function checkNominationRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  return checkRateLimit(`nomination:${ip}`, 5, 10 * 60);
}
