# AtomMail

**Disposable email in 10 minutes.** No sign-up, no tracking, no long-term persistence.

Live demo: [atommail.vercel.app](https://atommail.vercel.app)

## Features

- Instant temporary inbox (no account required)
- Privacy-first: no tracking, auto-expiry
- Email ingest on **Cloudflare Email Workers**
- Storage via **Supabase** (Postgres)
- Landing + inbox UI on **Next.js**
- Companion admin dashboard: [atommail-admin](https://github.com/awhite0030/atommail-admin)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind, Framer Motion |
| Email edge | Cloudflare Workers (Email Routing) |
| Data | Supabase (Postgres REST) |
| Deploy | Vercel + Wrangler |

## Project structure

```text
app/           # Next.js UI + API routes
components/    # Landing and inbox UI
lib/           # Supabase client, rate limit
worker/        # Cloudflare Email Worker
supabase/      # SQL schema and migrations
```

## Local development

```bash
npm install
cp .env.example .env.local   # if present; set Supabase keys
npm run dev
```

Worker (requires Wrangler + Email Routing config):

```bash
npm run worker:dev
# deploy:
npm run worker:deploy
```

## Environment

Typical variables (names may vary by deploy):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Worker secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Related

- Admin: https://github.com/awhite0030/atommail-admin
- Demo: https://atommail.vercel.app

## License

MIT