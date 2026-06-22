import PostalMime from 'postal-mime';

export async function emailHandler(
  message: ForwardableEmailMessage,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const recipient = message.to;
  const sender = message.from;

  console.log(`Incoming email: from=${sender} to=${recipient}`);

  // CRITICAL: Buffer the stream immediately (single-use ReadableStream)
  const rawBuffer = await new Response(message.raw).arrayBuffer();

  // Check if this inbox exists and is not expired
  const inbox = await env.DB.prepare(
    'SELECT address, expires_at FROM inboxes WHERE address = ?'
  ).bind(recipient).first<{ address: string; expires_at: number }>();

  if (!inbox) {
    console.log(`No inbox found for ${recipient}, dropping.`);
    return;
  }

  const now = Date.now();
  if (now > inbox.expires_at) {
    console.log(`Inbox ${recipient} expired, dropping.`);
    ctx.waitUntil(
      env.DB.prepare('DELETE FROM emails WHERE recipient = ?')
        .bind(recipient).run()
        .then(() => env.DB.prepare('DELETE FROM inboxes WHERE address = ?').bind(recipient).run())
        .catch(err => console.error('Failed to cleanup expired inbox:', err))
    );
    return;
  }

  // Parse and store email in background to stay within CPU limits
  ctx.waitUntil(
    (async () => {
      try {
        const parser = new PostalMime();
        const email = await parser.parse(rawBuffer);

        await env.DB.prepare(
          `INSERT INTO emails (recipient, sender, subject, body_text, body_html, received_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          recipient,
          sender,
          email.subject || '(no subject)',
          email.text || '',
          email.html || '',
          now
        ).run();

        console.log(`Stored email for ${recipient}: "${email.subject}"`);
      } catch (err) {
        console.error('Failed to parse/store email:', err);
      }
    })()
  );
}
