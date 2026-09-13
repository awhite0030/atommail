import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getClientIp } from '@/lib/rate-limit';

const DOMAIN = 'atommail.cyou';

type InboxCreationResult = {
  status_code: number;
  error_message: string | null;
  address: string | null;
  expires_at: number | null;
  rate_limit: number | null;
  rate_remaining: number | null;
};

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

    const now = Date.now();
    const ipHash = await hashIp(ip);
    const { data: rpcData, error } = await supabase
      .rpc('create_temporary_inbox', { p_ip_hash: ipHash, p_now: now, p_domain: DOMAIN })
      .single();
    const data = rpcData as InboxCreationResult | null;

    if (error) throw new Error(`Could not create inbox: ${error.message}`);
    if (!data) throw new Error('Could not create inbox: empty database response');

    if (data.status_code !== 201 || !data.address || !data.expires_at) {
      return NextResponse.json(
        { error: data.error_message || 'Failed to create inbox' },
        {
          status: data.status_code || 500,
          headers: {
            'X-RateLimit-Limit': String(data.rate_limit || 0),
            'X-RateLimit-Remaining': String(data.rate_remaining || 0),
          },
        }
      );
    }

    console.info('[api/inbox] created', { durationMs: Date.now() - startedAt });

    return NextResponse.json(
      { address: data.address, expiresAt: data.expires_at },
      {
        headers: {
          'X-RateLimit-Limit': String(data.rate_limit),
          'X-RateLimit-Remaining': String(data.rate_remaining),
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
