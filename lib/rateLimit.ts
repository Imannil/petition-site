type Record = { count: number; resetAt: number };
const store = new Map<string, Record>();

// Clean expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now) store.delete(k);
  }
}, 10 * 60 * 1000);

export function checkRateLimit(
  ip: string,
  prefix: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || rec.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (rec.count >= limit) return { allowed: false };
  rec.count++;
  return { allowed: true };
}

export function getClientIP(req: Request): string {
  const h = new Headers(req.headers);
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
