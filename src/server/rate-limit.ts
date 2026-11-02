import "server-only";
import { and, count, eq, gt, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "./db/client";
import { rateLimitHits } from "./db/schema";

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

/**
 * Sliding-window limiter backed by the database, so it holds across
 * serverless instances. Not strictly atomic (count + insert), which is an
 * acceptable over-admit of a few requests under heavy concurrency.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const db = getDb();
  const now = Date.now();
  const windowStart = now - windowMs;

  // Lazy cleanup of expired hits for this key.
  await db
    .delete(rateLimitHits)
    .where(and(eq(rateLimitHits.key, key), lte(rateLimitHits.ts, windowStart)));

  const [{ value: used }] = await db
    .select({ value: count() })
    .from(rateLimitHits)
    .where(and(eq(rateLimitHits.key, key), gt(rateLimitHits.ts, windowStart)));

  if (used >= limit) {
    const oldest = await db
      .select({ ts: rateLimitHits.ts })
      .from(rateLimitHits)
      .where(and(eq(rateLimitHits.key, key), gt(rateLimitHits.ts, windowStart)))
      .orderBy(rateLimitHits.ts)
      .limit(1);
    const resetAt = (oldest[0]?.ts ?? now) + windowMs;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
  }

  await db.insert(rateLimitHits).values({ key, ts: now });
  return { ok: true, remaining: limit - used - 1 };
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export function formatRetry(sec: number): string {
  if (sec < 60) return `${sec} secondi`;
  const min = Math.ceil(sec / 60);
  return min === 1 ? "1 minuto" : `${min} minuti`;
}
