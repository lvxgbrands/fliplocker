import { headers } from "next/headers";

// Lightweight in-memory rate limiter. Sufficient for a single instance /
// staging. In multi-instance production, back this with a shared store
// (e.g. Upstash/Redis) — the call sites stay the same.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  }
  b.count++;
  return { ok: true, remaining: limit - b.count, retryAfterMs: 0 };
}

/** Best-effort client IP for keying (proxy-aware). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

/** Convenience for server actions: throws-free guard by IP + label. */
export async function limitByIp(label: string, limit: number, windowMs: number): Promise<boolean> {
  const ip = await clientIp();
  return rateLimit(`${label}:${ip}`, limit, windowMs).ok;
}
