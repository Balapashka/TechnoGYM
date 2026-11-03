/**
 * Fixed-window rate limiter kept in process memory.
 *
 * Enough for a single-instance deployment (one Docker container): it stops
 * password guessing on /api/auth/login and form spam on the public endpoints.
 * Behind several instances, swap the store for Redis.
 */

type Bucket = { count: number; resetAt: number };

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function createRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, Bucket>();

  return function hit(
    key: string,
    limit: number,
    windowMs: number,
  ): RateLimitResult {
    const t = now();
    // Opportunistic cleanup so the map cannot grow without bound.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt <= t) buckets.delete(k);
    }

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= t) {
      buckets.set(key, { count: 1, resetAt: t + windowMs });
      return { ok: true };
    }
    if (bucket.count >= limit) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - t) / 1000)),
      };
    }
    bucket.count += 1;
    return { ok: true };
  };
}

/** Shared limiter for the route handlers. */
export const rateLimit = createRateLimiter();

/**
 * Best-effort client address. Behind a reverse proxy (nginx, Caddy) the first
 * `X-Forwarded-For` entry is the visitor; without one every request shares the
 * "unknown" bucket, which still caps a flood.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Standard 429 body + Retry-After header. */
export function tooManyRequests(retryAfterSec: number): Response {
  return Response.json(
    { error: "Слишком много запросов. Попробуйте немного позже." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

/**
 * Apply a limit for `scope` + client IP. Returns a 429 response when the caller
 * is over the limit, or null to continue.
 */
export function limitRequest(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): Response | null {
  const res = rateLimit(`${scope}:${clientIp(request)}`, limit, windowMs);
  return res.ok ? null : tooManyRequests(res.retryAfterSec);
}
