import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const { data: email } = await supabase
      .from('emails')
      .select('id, recipient, sender, subject, body_text, body_html, received_at')
      .eq('id', id)
      .single();

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json(email);
  } catch (err) {
    console.error('Error fetching email:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
