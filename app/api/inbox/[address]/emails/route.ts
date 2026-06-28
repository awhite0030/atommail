import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const addr = decodeURIComponent(address);

    const { data: inbox } = await supabase
      .from('inboxes')
      .select('address, expires_at')
      .eq('address', addr)
      .single();

    if (!inbox) {
      return NextResponse.json({ error: 'Inbox not found or expired' }, { status: 404 });
    }

    const { data: emails } = await supabase
      .from('emails')
      .select('id, sender, subject, received_at')
      .eq('recipient', addr)
      .order('received_at', { ascending: false });

    return NextResponse.json({
      emails: emails || [],
      expiresAt: inbox.expires_at,
      expired: inbox.expires_at < Date.now(),
    });
  } catch (err) {
    console.error('Error fetching emails:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const addr = decodeURIComponent(address);
    await supabase.from('emails').delete().eq('recipient', addr);
    await supabase.from('inboxes').delete().eq('address', addr);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error deleting inbox:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
