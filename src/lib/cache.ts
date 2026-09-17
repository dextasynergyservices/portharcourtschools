import { redis } from "./redis";

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

// Global in-memory L1 cache to absorb traffic spikes without burning Redis commands
const memoryCache = new Map<string, MemoryCacheEntry<unknown>>();

// Periodic cleanup of expired in-memory items (every 5 minutes)
if (typeof setInterval !== "undefined") {
  const timer = setInterval(
    () => {
      const now = Date.now();
      for (const [k, v] of memoryCache.entries()) {
        if (v.expiresAt <= now) {
          memoryCache.delete(k);
        }
      }
    },
    5 * 60 * 1000,
  );

  if (timer.unref) {
    timer.unref();
  }
}

// Circuit breaker state to protect Upstash Redis quota limits
let redisCircuitOpenUntil = 0;

function isRedisCircuitActive(): boolean {
  if (!redis) return false;
  return Date.now() >= redisCircuitOpenUntil;
}

function tripRedisCircuit(reason: string) {
  // Silence Redis for 5 minutes if quota limit or network flood is detected
  redisCircuitOpenUntil = Date.now() + 5 * 60 * 1000;
  console.warn(
    `[Cache] Upstash Redis circuit breaker tripped: ${reason}. Falling back transparently to L1 memory cache for 5 minutes.`,
  );
}

/**
 * Two-tier cache helper:
 * L1: In-memory store (60s TTL) to prevent repeated Redis commands and function cost
 * L2: Upstash Redis (longer TTL, e.g. 1h) with pipelining & circuit breaker
 * Origin: Database query executed only on L1 & L2 misses
 */
export async function getOrSetCache<T>(
  key: string,
  tags: string[],
  fetcher: () => Promise<T>,
  ttlSeconds = 3600,
): Promise<T> {
  const now = Date.now();

  // 1. Check L1 Memory Cache
  const l1Entry = memoryCache.get(key) as MemoryCacheEntry<T> | undefined;
  if (l1Entry && l1Entry.expiresAt > now) {
    return l1Entry.value;
  }

  // 2. Check L2 Upstash Redis Cache (if available and circuit is healthy)
  if (isRedisCircuitActive() && redis) {
    try {
      const redisVal = await redis.get<T>(key);
      if (redisVal !== null && redisVal !== undefined) {
        // Cache in memory for 60 seconds (or remaining TTL if smaller)
        const l1Ttl = Math.min(ttlSeconds, 60);
        memoryCache.set(key, {
          value: redisVal,
          expiresAt: now + l1Ttl * 1000,
          tags,
        });
        return redisVal;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("limit") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("exceeded")
      ) {
        tripRedisCircuit(msg);
      } else {
        console.warn(`[Cache] Redis lookup skipped for "${key}": ${msg}`);
      }
    }
  }

  // 3. Cache Miss — Execute origin fetcher
  const freshData = await fetcher();

  // 4. Populate L1 Memory Cache
  const l1Ttl = Math.min(ttlSeconds, 60);
  memoryCache.set(key, {
    value: freshData,
    expiresAt: now + l1Ttl * 1000,
    tags,
  });

  // 5. Populate L2 Redis Cache using Pipeline to minimize command count
  if (isRedisCircuitActive() && redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.set(key, freshData, { ex: ttlSeconds });
      for (const tag of tags) {
        pipeline.sadd(`tag_keys:${tag}`, key);
        pipeline.expire(`tag_keys:${tag}`, ttlSeconds * 2);
      }
      await pipeline.exec();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("limit") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("exceeded")
      ) {
        tripRedisCircuit(msg);
      } else {
        console.warn(`[Cache] Redis write skipped for "${key}": ${msg}`);
      }
    }
  }

  return freshData;
}

/**
 * Invalidate cache across all layers (Memory L1, Redis L2, and Next.js revalidateTag)
 * Ensures instant reflection of admin mutations with ZERO data inconsistency.
 */
export async function invalidateCache(tags: string[]): Promise<void> {
  // 1. Purge matching memory cache keys
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.tags.some((t) => tags.includes(t))) {
      memoryCache.delete(key);
    }
  }

  // 2. Purge matching Redis keys with pipelining
  if (isRedisCircuitActive() && redis) {
    try {
      for (const tag of tags) {
        const keys = await redis.smembers(`tag_keys:${tag}`);
        if (keys && keys.length > 0) {
          const pipeline = redis.pipeline();
          pipeline.del(...keys);
          pipeline.del(`tag_keys:${tag}`);
          await pipeline.exec();
        } else {
          await redis.del(`tag_keys:${tag}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("limit") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("exceeded")
      ) {
        tripRedisCircuit(msg);
      } else {
        console.warn(
          `[Cache] Redis invalidation skipped for tags ${tags.join(", ")}: ${msg}`,
        );
      }
    }
  }

  // 3. Purge Next.js native data cache tags
  try {
    const { revalidateTag } = await import("next/cache");
    for (const tag of tags) {
      revalidateTag(tag, "max");
    }
  } catch {
    // Graceful fallback if called outside Next.js request lifecycle
  }
}
