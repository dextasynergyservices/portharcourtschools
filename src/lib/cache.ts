import { revalidateTag, unstable_cache } from "next/cache";

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

// Per-instance in-memory L1 cache to absorb traffic spikes
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

/**
 * Two-tier cache helper:
 * L1: In-memory store (60s TTL) per server instance
 * L2: Next.js data cache, shared across instances and invalidated by tag
 * Origin: Database query executed only on L1 & L2 misses
 *
 * Note: values served from L2 are JSON-serialized, so Date fields come back as strings.
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

  // 2. Next.js data cache (runs the fetcher only on a miss)
  const value = await unstable_cache(fetcher, [key], {
    tags,
    revalidate: ttlSeconds,
  })();

  // 3. Populate L1 Memory Cache
  memoryCache.set(key, {
    value,
    expiresAt: now + Math.min(ttlSeconds, 60) * 1000,
    tags,
  });

  return value;
}

/**
 * Invalidate cache across both layers (Memory L1 and Next.js data cache)
 * so admin mutations show up on the next request.
 */
export async function invalidateCache(tags: string[]): Promise<void> {
  // 1. Purge matching memory cache keys
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.tags.some((t) => tags.includes(t))) {
      memoryCache.delete(key);
    }
  }

  // 2. Expire Next.js data cache tags immediately
  try {
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }
  } catch {
    // Graceful fallback if called outside Next.js request lifecycle
  }
}
