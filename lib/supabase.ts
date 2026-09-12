import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy Supabase client: created on first use, not at module import.
 * Build-time page-data collection no longer crashes when env vars are
 * absent (preview deployments, local builds); the request itself throws
 * a clear error instead.
 */
let cached: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cached) return cached;

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  cached = createClient(supabaseUrl, supabaseKey);
  return cached;
}

/**
 * Drop-in proxy over the lazy client: `supabase.from(...)` works as before.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as SupabaseClient;

export type Inbox = {
  address: string;
  created_at: number;
  expires_at: number;
  creator_ip_hash?: string;
};

export type Email = {
  id: number;
  recipient: string;
  sender: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: number;
};
