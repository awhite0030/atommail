import PostalMime from 'postal-mime';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    const recipient = message.to;
    const sender = message.from;

    console.log(`Incoming email: from=${sender} to=${recipient}`);

    // Buffer the email stream
    const rawBuffer = await new Response(message.raw).arrayBuffer();

    // Check if inbox exists and is not expired
    const inboxResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/inboxes?address=eq.${encodeURIComponent(recipient)}&select=address,expires_at`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const inboxes = await inboxResponse.json();
    const inbox = inboxes[0];

    if (!inbox) {
      console.log(`No inbox found for ${recipient}, dropping.`);
      return;
    }

    const now = Date.now();
    if (now > inbox.expires_at) {
      console.log(`Inbox ${recipient} expired, dropping.`);
      ctx.waitUntil(
        Promise.all([
          fetch(`${env.SUPABASE_URL}/rest/v1/emails?recipient=eq.${encodeURIComponent(recipient)}`, {
            method: 'DELETE',
            headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }),
          fetch(`${env.SUPABASE_URL}/rest/v1/inboxes?address=eq.${encodeURIComponent(recipient)}`, {
            method: 'DELETE',
            headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }),
        ]).catch(err => console.error('Failed to cleanup expired inbox:', err))
      );
      return;
    }

    // Parse and store email
    ctx.waitUntil(
      (async () => {
        try {
          const parser = new PostalMime();
          const email = await parser.parse(rawBuffer);

          await fetch(`${env.SUPABASE_URL}/rest/v1/emails`, {
            method: 'POST',
            headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              recipient,
              sender,
              subject: email.subject || '(no subject)',
              body_text: email.text || '',
              body_html: email.html || '',
              received_at: now,
            }),
          });

          console.log(`Stored email for ${recipient}: "${email.subject}"`);
        } catch (err) {
          console.error('Failed to parse/store email:', err);
        }
      })()
    );
  },
} satisfies ExportedHandler<Env>;
