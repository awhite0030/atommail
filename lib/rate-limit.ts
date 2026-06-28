// In-memory rate limiter for the API routes
// For production at scale, swap with Upstash Redis (works on Vercel Edge)

interface RateLimitEntry {
  remaining: number;
  reset: number;
}

interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, value: RateLimitEntry, ttlMs: number): Promise<void>;
}

class MemoryStore implements RateLimitStore {
  private store = new Map<string, { value: RateLimitEntry; expires: number }>();

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: RateLimitEntry, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
    // Periodic cleanup
    if (this.store.size > 10000) {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (v.expires < now) this.store.delete(k);
      }
    }
  }
}

const memoryStore = new MemoryStore();

const WINDOW_MS = 60_000; // 1 minute

export async function checkRateLimit(ip: string, maxRequests: number = 5): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:inbox:${ip}`;
  const existing = await memoryStore.get(key);

  if (existing && existing.remaining <= 0 && existing.reset > Date.now()) {
    return { success: false, remaining: 0, reset: existing.reset };
  }

  const result = {
    success: true,
    remaining: existing ? Math.max(0, existing.remaining - 1) : maxRequests - 1,
    reset: existing?.reset || Date.now() + WINDOW_MS,
  };

  await memoryStore.set(key, result, WINDOW_MS);
  return result;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (cfConnectingIp) return cfConnectingIp.split(',')[0].trim();
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;

  return 'unknown';
}

// Hash IP for storage (privacy + can compare later)
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (process.env.IP_SALT || 'default-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}
