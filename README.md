# AtomMail

Disposable email in 10 minutes. No sign-up, no tracking, no persistence.

AtomMail generates a random `@atommail.cyou` address on demand, keeps it alive for exactly 10 minutes, then self-destructs — inbox, emails, and all. Built entirely on [Cloudflare Workers](https://workers.cloudflare.com/) with zero external dependencies beyond the edge.

## How it works

1. **Create** — click "Create Address" and get a random 8-character inbox (e.g. `xk7qm2p4@atommail.cyou`)
2. **Receive** — anyone can send email to that address; it appears in the browser within seconds
3. **Expire** — after 10 minutes the inbox is cleaned up automatically; no trace left

That's it. No accounts, no cookies, no database that grows forever.

## Architecture

```
Cloudflare Email Routing (catch-all)
          │
          ▼
    ┌─────────────┐     ┌──────────┐     ┌───────────────┐
    │  Worker      │────▶│  D1 (SQLite)  │────▶│  KV Namespace │
    │  (API + email│     │  inboxes       │     │  address      │
    │   handler)   │     │  emails        │     │  uniqueness   │
    └─────────────┘     └──────────┘     └───────────────┘
          │
          ▼
    Embedded SPA
    (served from Worker)
```

| Component | Purpose |
|-----------|---------|
| **Cloudflare Workers** | Single Worker handles both HTTP API and incoming email |
| **Cloudflare D1** | SQLite at the edge — stores inboxes and emails |
| **Cloudflare KV** | Permanent address tracking — prevents local-part reuse |
| **Cloudflare Email Routing** | Catch-all rule forwards `*@atommail.cyou` to the Worker |
| **`postal-mime`** | Parses raw RFC 2822 email streams into structured data |

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/inbox` | Generate a new temporary address |
| `GET` | `/api/inbox/:address/emails` | Poll for emails (returns list + expiry status) |
| `GET` | `/api/email/:id` | Fetch full email content (text + HTML) |
| `DELETE` | `/api/inbox/:address` | Delete inbox and all its emails |
| `GET` | `/` | Serve the frontend SPA |

All endpoints return `application/json` with CORS headers (`Access-Control-Allow-Origin: *`).

## Stack

- **Runtime**: Cloudflare Workers (TypeScript)
- **Database**: D1 (SQLite at the edge)
- **KV**: Address uniqueness guarantee
- **Email**: Cloudflare Email Routing + `postal-mime`
- **Frontend**: Vanilla HTML/CSS/JS — single-file SPA embedded in the Worker

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)
- Cloudflare account with D1 and Workers enabled

### Install

```bash
git clone https://github.com/awhite0030/atommail.git
cd atommail
npm install
```

### Configure

1. Create a D1 database:

   ```bash
   wrangler d1 create atommail-db
   ```

2. Create a KV namespace:

   ```bash
   wrangler kv namespace create ADDRESSES
   ```

3. Update `wrangler.jsonc` with the database ID and KV namespace ID returned by the commands above.

4. Apply the schema:

   ```bash
   # Local development
   npm run db:migrate:local

   # Production
   npm run db:migrate:remote
   ```

### Develop

```bash
npm run dev
```

Opens a local dev server at `http://localhost:8787`.

### Deploy

```bash
npm run deploy
```

After deploying, configure **Email Routing** in the Cloudflare dashboard:

1. Go to your domain → **Email** → **Routing rules**
2. Add a **catch-all** rule that forwards to your Worker (`atommail`)
3. Ensure MX records for `atommail.cyou` point to Cloudflare

## Project structure

```
atommail/
├── src/
│   ├── index.ts      # Worker entry — API routes + email() handler
│   ├── email.ts      # Incoming email handler (parse + store)
│   └── html.ts       # Frontend SPA (exported as string constant)
├── public/
│   └── index.html    # Standalone copy of the frontend
├── schema.sql         # D1 database schema (inboxes + emails)
├── wrangler.jsonc     # Cloudflare Worker configuration
├── tsconfig.json
└── package.json
```

## Design decisions

- **Single Worker** — API and email handling share one deployment, one config
- **KV for uniqueness** — addresses are permanently tracked so local parts are never reassigned
- **Lazy cleanup** — expired inboxes are cleaned when email arrives for them, not via a cron job
- **Embedded frontend** — the SPA is served directly from the Worker as a string constant; no separate Pages deployment needed
- **Browser-only sessions** — no user accounts, no auth, no cookies; just a temporary address with a 10-minute TTL

## License

[MIT](LICENSE)
