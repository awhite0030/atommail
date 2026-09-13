import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const DOMAIN = 'atommail.cyou';

// Load limits from DB (cached for 30s)
let limitsCache: { data: Record<string, string>; ts: number } | null = null;

async function getLimits(): Promise<Record<string, string>> {
  const now = Date.now();
  if (limitsCache && now - limitsCache.ts < 30_000) {
    return limitsCache.data;
  }
  const { data, error } = await supabase.from('admin_settings').select('key, value');
  if (error) throw new Error(`Could not load inbox limits: ${error.message}`);
  const map: Record<string, string> = {};
  (data || []).forEach((r: any) => { map[r.key] = r.value; });
  limitsCache = { data: map, ts: now };
  return map;
}

// Check if IP hash is banned (cached 60s)
let banCache: { hashes: Set<string>; ts: number } | null = null;

async function isIpBanned(ipHash: string): Promise<boolean> {
  const now = Date.now();
  if (!banCache || now - banCache.ts > 60_000) {
    const { data, error } = await supabase.from('banned_ips').select('ip_hash');
    if (error) throw new Error(`Could not load banned IPs: ${error.message}`);
    banCache = { hashes: new Set((data || []).map((r: any) => r.ip_hash)), ts: now };
  }
  return banCache.hashes.has(ipHash);
}

// CAPTCHA verification with Cloudflare Turnstile
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification');
    return true;
  }
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification failed:', err);
    return false;
  }
}

function generateAddress(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function isHoneypotTriggered(value: string | null): boolean {
  return !!value && value.length > 0;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const ip = getClientIp(request);

  try {
    // Reject malformed requests and missing CAPTCHA before waiting for
    // Supabase. Previously the browser waited through several database calls
    // and only then received "CAPTCHA token required".
    let body: any = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { captchaToken, website_url } = body;

    // 3. Honeypot check
    if (isHoneypotTriggered(website_url)) {
      return NextResponse.json({
        address: `${generateAddress()}@${DOMAIN}`,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
    }

    // Verify CAPTCHA before database access so rejection is immediate.
    const isInitialCreation = !body.hasExistingAddress;
    if (process.env.TURNSTILE_SECRET_KEY && isInitialCreation) {
      if (!captchaToken) {
        return NextResponse.json({ error: 'CAPTCHA token required' }, { status: 400 });
      }
      const valid = await verifyTurnstile(captchaToken, ip);
      if (!valid) {
        return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 403 });
      }
    }

    const [limits, ipHash] = await Promise.all([getLimits(), hashIp(ip)]);
    const limitsEnabled = limits['limits_enabled'] !== 'false';
    const globalLimit = parseInt(limits['global_inbox_limit'] || '100', 10);
    const dailyIpLimit = parseInt(limits['daily_ip_limit'] || '20', 10);
    const rateLimitPerMin = parseInt(limits['rate_limit_per_min'] || '5', 10);
    const inboxTtl = parseInt(limits['inbox_ttl_seconds'] || '600', 10) * 1000;

    const [banned, rateLimit] = await Promise.all([
      isIpBanned(ipHash),
      checkRateLimit(ip, rateLimitPerMin),
    ]);

    if (banned) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!rateLimit.success && limitsEnabled) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimitPerMin),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const now = Date.now();

    // Count limits concurrently. A database error must never be interpreted
    // as zero, otherwise an outage silently disables abuse controls.
    if (limitsEnabled) {
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const [activeResult, ipResult] = await Promise.all([
        supabase
          .from('inboxes')
          .select('*', { count: 'exact', head: true })
          .gt('expires_at', now),
        supabase
          .from('inboxes')
          .select('*', { count: 'exact', head: true })
          .eq('creator_ip_hash', ipHash)
          .gt('created_at', dayAgo),
      ]);

      if (activeResult.error) throw new Error(`Could not count active inboxes: ${activeResult.error.message}`);
      if (ipResult.error) throw new Error(`Could not count IP inboxes: ${ipResult.error.message}`);

      if ((activeResult.count || 0) >= globalLimit) {
        return NextResponse.json(
          { error: 'Service is at capacity. Please try again later.' },
          { status: 503 }
        );
      }

      if ((ipResult.count || 0) >= dailyIpLimit) {
        return NextResponse.json(
          { error: 'Daily inbox limit reached. Try again tomorrow.' },
          { status: 429 }
        );
      }
    }

    // Let the primary key enforce uniqueness. This removes a sequential read
    // on every normal creation and retries only the extremely rare collision.
    const expiresAt = now + inboxTtl;
    let fullAddress = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = `${generateAddress()}@${DOMAIN}`;
      const { error } = await supabase.from('inboxes').insert({
        address: candidate,
        created_at: now,
        expires_at: expiresAt,
        creator_ip_hash: ipHash,
      });

      if (!error) {
        fullAddress = candidate;
        break;
      }
      if (error.code !== '23505') throw new Error(`Could not create inbox: ${error.message}`);
    }

    if (!fullAddress) throw new Error('Could not allocate a unique inbox address');

    console.info('[api/inbox] created', { durationMs: Date.now() - startedAt });

    return NextResponse.json(
      { address: fullAddress, expiresAt },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimitPerMin),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        }
      }
    );
  } catch (err) {
    console.error('[api/inbox] failed', { durationMs: Date.now() - startedAt, error: String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (process.env.IP_SALT || 'default-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}
