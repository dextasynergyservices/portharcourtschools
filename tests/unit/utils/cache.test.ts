import { describe, expect, it, vi } from "vitest";
import { getOrSetCache, invalidateCache } from "@/lib/cache";

describe("Two-Tier Cache Utility", () => {
  it("fetches and caches result on initial cache miss", async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1, name: "Test School" });
    const key = `test_key_${Date.now()}`;
    const tags = ["test-schools"];

    const result1 = await getOrSetCache(key, tags, fetcher, 60);
    expect(result1).toEqual({ id: 1, name: "Test School" });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call should return cached value without hitting fetcher again
    const result2 = await getOrSetCache(key, tags, fetcher, 60);
    expect(result2).toEqual({ id: 1, name: "Test School" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("invalidates cache immediately when invalidateCache is called with matching tag", async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      callCount += 1;
      return { count: callCount };
    });

    const key = `inv_key_${Date.now()}`;
    const tag = "schools-inv-test";

    const initial = await getOrSetCache(key, [tag], fetcher, 60);
    expect(initial).toEqual({ count: 1 });

    // Call invalidateCache
    await invalidateCache([tag]);

    // Next fetch should re-trigger fetcher because cache entry was purged
    const refreshed = await getOrSetCache(key, [tag], fetcher, 60);
    expect(refreshed).toEqual({ count: 2 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not invalidate keys with unrelated tags", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "active" });
    const key = `unrelated_key_${Date.now()}`;
    const tag = "tag-alpha";

    await getOrSetCache(key, [tag], fetcher, 60);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Invalidate a different tag
    await invalidateCache(["tag-beta"]);

    // Key should still be cached
    await getOrSetCache(key, [tag], fetcher, 60);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
