import { emailHandler } from './email';
import { HTML } from './html';

const DOMAIN = 'atommail.cyou';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function normalizeRecipient(raw: string): string {
  // Strip domain if present, lowercase
  const at = raw.indexOf('@');
  const local = at >= 0 ? raw.substring(0, at) : raw;
  return local.toLowerCase().trim();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      // POST /api/inbox — create a new temporary address
      if (method === 'POST' && path === '/api/inbox') {
        let local: string;
        let attempts = 0;
        do {
          local = generateAddress();
          const exists = await env.ADDRESSES.get(local);
          if (!exists) break;
          attempts++;
        } while (attempts < 10);

        const fullAddress = `${local}@${DOMAIN}`;
        const now = Date.now();
        const expiresAt = now + 600_000; // 10 minutes

        await env.ADDRESSES.put(local, '1');
        await env.DB.prepare(
          'INSERT INTO inboxes (address, created_at, expires_at) VALUES (?, ?, ?)'
        ).bind(fullAddress, now, expiresAt).run();

        return json({ address: fullAddress, expiresAt });
      }

      // GET /api/inbox/:address/emails — poll for emails
      const emailsMatch = path.match(/^\/api\/inbox\/([^/]+)\/emails$/);
      if (method === 'GET' && emailsMatch) {
        const addr = decodeURIComponent(emailsMatch[1]);

        const inbox = await env.DB.prepare(
          'SELECT address, expires_at FROM inboxes WHERE address = ?'
        ).bind(addr).first<{ address: string; expires_at: number }>();

        if (!inbox) {
          return json({ error: 'Inbox not found or expired' }, 404);
        }

        // Cleanup expired emails for this inbox in the background is optional;
        // we just return what's there.
        const emails = await env.DB.prepare(
          'SELECT id, sender, subject, received_at FROM emails WHERE recipient = ? ORDER BY received_at DESC'
        ).bind(addr).all<{ id: number; sender: string; subject: string; received_at: number }>();

        return json({
          emails: emails.results ?? [],
          expiresAt: inbox.expires_at,
          expired: inbox.expires_at < Date.now(),
        });
      }

      // GET /api/email/:id — full email content
      const emailMatch = path.match(/^\/api\/email\/(\d+)$/);
      if (method === 'GET' && emailMatch) {
        const id = parseInt(emailMatch[1], 10);
        const email = await env.DB.prepare(
          'SELECT id, recipient, sender, subject, body_text, body_html, received_at FROM emails WHERE id = ?'
        ).bind(id).first();

        if (!email) {
          return json({ error: 'Email not found' }, 404);
        }

        return json(email);
      }

      // DELETE /api/inbox/:address — cleanup expired inbox + emails
      const deleteMatch = path.match(/^\/api\/inbox\/([^/]+)$/);
      if (method === 'DELETE' && deleteMatch) {
        const addr = decodeURIComponent(deleteMatch[1]);
        await env.DB.prepare('DELETE FROM emails WHERE recipient = ?').bind(addr).run();
        await env.DB.prepare('DELETE FROM inboxes WHERE address = ?').bind(addr).run();
        return json({ ok: true });
      }

      // GET / — serve frontend
      if (method === 'GET' && (path === '/' || path === '')) {
        return new Response(HTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('Request error:', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },

  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    return emailHandler(message, env, ctx);
  },
} satisfies ExportedHandler<Env>;
