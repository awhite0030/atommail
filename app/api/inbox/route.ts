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
  const { data } = await supabase.from('admin_settings').select('key, value');
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
    const { data } = await supabase.from('banned_ips').select('ip_hash');
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
    });
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
  const ip = getClientIp(request);

  // Load dynamic limits from DB
  const limits = await getLimits();
  const limitsEnabled = limits['limits_enabled'] !== 'false';
  const globalLimit = parseInt(limits['global_inbox_limit'] || '100');
  const dailyIpLimit = parseInt(limits['daily_ip_limit'] || '20');
  const rateLimitPerMin = parseInt(limits['rate_limit_per_min'] || '5');
  const inboxTtl = parseInt(limits['inbox_ttl_seconds'] || '600') * 1000;

  // 0. Check ban list
  const ipHash = await hashIp(ip);
  if (await isIpBanned(ipHash)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // 1. Rate limit check
  const rateLimit = await checkRateLimit(ip, rateLimitPerMin);
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

  try {
    // 2. Parse body for CAPTCHA token + honeypot
    let body: any = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch {}

    const { captchaToken, website_url } = body;

    // 3. Honeypot check
    if (isHoneypotTriggered(website_url)) {
      return NextResponse.json({
        address: `${generateAddress()}@${DOMAIN}`,
        expiresAt: Date.now() + inboxTtl,
      });
    }

    // 4. Verify CAPTCHA (only for initial creation)
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

    // 5. Check global limit (if enabled)
    if (limitsEnabled) {
      const { count: activeCount } = await supabase
        .from('inboxes')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', Date.now());

      if (activeCount && activeCount > globalLimit) {
        return NextResponse.json(
          { error: 'Service is at capacity. Please try again later.' },
          { status: 503 }
        );
      }
    }

    // 6. Check per-IP daily limit (if enabled)
    if (limitsEnabled) {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const { count: ipCount } = await supabase
        .from('inboxes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_ip_hash', ipHash)
        .gt('created_at', dayAgo);

      if (ipCount && ipCount >= dailyIpLimit) {
        return NextResponse.json(
          { error: 'Daily inbox limit reached. Try again tomorrow.' },
          { status: 429 }
        );
      }
    }

    // 7. Generate unique address
    let local: string;
    let attempts = 0;
    do {
      local = generateAddress();
      const { data } = await supabase
        .from('inboxes')
        .select('address')
        .eq('address', `${local}@${DOMAIN}`)
        .maybeSingle();
      if (!data) break;
      attempts++;
    } while (attempts < 10);

    const fullAddress = `${local}@${DOMAIN}`;
    const now = Date.now();
    const expiresAt = now + inboxTtl;

    // 8. Insert with creator IP hash
    await supabase.from('inboxes').insert({
      address: fullAddress,
      created_at: now,
      expires_at: expiresAt,
      creator_ip_hash: ipHash,
    });

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
    console.error('Error creating inbox:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (process.env.IP_SALT || 'default-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}
