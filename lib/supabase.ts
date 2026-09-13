import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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