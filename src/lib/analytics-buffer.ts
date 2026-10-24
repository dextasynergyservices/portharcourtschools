import { lt } from "drizzle-orm";
import { db, pageViews } from "@/lib/db";

/**
 * Page views are buffered in memory per server instance and written to Postgres
 * in batches. Writing every view straight to Neon keeps the compute awake around
 * the clock and burns through the free plan's compute hours.
 *
 * Trade-off: views still buffered when an instance shuts down are lost.
 */

const FLUSH_INTERVAL_MS = 15 * 60 * 1000;
const FLUSH_MAX_ROWS = 100;
const RETENTION_DAYS = 365;
const PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type PageViewRow = typeof pageViews.$inferInsert;

let buffer: PageViewRow[] = [];
let oldestBufferedAt = 0;
let flushing: Promise<number> | null = null;
let lastPrunedAt = 0;

/**
 * Queue a page view. Returns true when the buffer is due to be flushed.
 */
export function recordPageView(
  row: Omit<PageViewRow, "id" | "createdAt">,
): boolean {
  const now = Date.now();
  if (buffer.length === 0) oldestBufferedAt = now;

  buffer.push({ ...row, id: crypto.randomUUID(), createdAt: new Date(now) });

  return (
    buffer.length >= FLUSH_MAX_ROWS ||
    now - oldestBufferedAt >= FLUSH_INTERVAL_MS
  );
}

/**
 * Write this instance's buffered page views to Postgres in a single insert.
 * Rows are put back on failure so the next flush can retry them.
 */
export function flushPageViews(): Promise<number> {
  if (flushing) return flushing;
  if (buffer.length === 0) return Promise.resolve(0);

  const rows = buffer;
  buffer = [];
  oldestBufferedAt = 0;

  flushing = db
    .insert(pageViews)
    .values(rows)
    .onConflictDoNothing()
    .then(() => rows.length)
    .catch((error) => {
      // Keep the newest rows within the cap so a long outage can't grow memory unbounded
      buffer = [...rows, ...buffer].slice(-FLUSH_MAX_ROWS * 10);
      oldestBufferedAt = Date.now();
      throw error;
    })
    .finally(() => {
      flushing = null;
    });

  return flushing;
}

/**
 * Delete page views older than the retention window, at most once a day per instance.
 */
export async function pruneOldPageViews(): Promise<void> {
  const now = Date.now();
  if (now - lastPrunedAt < PRUNE_INTERVAL_MS) return;
  lastPrunedAt = now;

  const cutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(pageViews).where(lt(pageViews.createdAt, cutoff));
}
