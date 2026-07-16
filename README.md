<div align="center">

<pre>
     _   _                  __  __       _ _
    / \ | |_ ___  _ __ ___ |  \/  | __ _(_) |
   / _ \| __/ _ \| '_ ` _ \| |\/| |/ _` | | |
  / ___ \ || (_) | | | | | | |  | | (_| | | |
 /_/   \_\__\___/|_| |_| |_|_|  |_|\__,_|_|_|

   disposable email  ·  no sign-up  ·  no tracking
</pre>

<br/>

<p>
  <strong>AtomMail</strong> is a privacy-first <em>temporary email</em> service.
  Instant inbox, auto-expiry, zero account friction — built on Cloudflare Workers.
</p>

<p>
  <a href="#-why-atommail">Why</a> ·&nbsp;
  <a href="#-features">Features</a> ·&nbsp;
  <a href="#-quick-start">Quick start</a> ·&nbsp;
  <a href="#-architecture">Architecture</a> ·&nbsp;
  <a href="#-related">Related</a>
</p>

<p>
  <a href="https://atommail.vercel.app"><img src="https://img.shields.io/badge/demo-live-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo"/></a>
  &nbsp;<a href="LICENSE"><img src="https://img.shields.io/github/license/awhite0030/atommail?style=for-the-badge&color=blue" alt="License"/></a>
  &nbsp;<img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  &nbsp;<img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare"/>
  &nbsp;<img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  &nbsp;<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs welcome"/>
</p>

<p>
  <img src="https://img.shields.io/github/stars/awhite0030/atommail?style=social" alt="Stars"/>
  &nbsp;<img src="https://img.shields.io/github/forks/awhite0030/atommail?style=social" alt="Forks"/>
  &nbsp;<img src="https://img.shields.io/github/last-commit/awhite0030/atommail?style=social" alt="Last commit"/>
</p>

</div>

---

## ✨ Why AtomMail?

> *Most disposable email services are ads wrapped in a form. AtomMail is an inbox that disappears when you're done.*

| Pain | What AtomMail does |
| --- | --- |
| Sign-up walls for a one-time code | Instant inbox — no account, no password |
| Providers keep mail forever | Auto-expiry; no long-term persistence by design |
| Tracking and marketing pixels | Privacy-first path: receive → read → expire |
| Heavy self-host stacks | Edge Worker + Supabase + static Next.js UI |

**Live demo:** [atommail.vercel.app](https://atommail.vercel.app)

---

## 🧩 Features

<table>
  <thead>
    <tr>
      <th align="left">Area</th>
      <th align="left">What you get</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Instant inbox</strong></td>
      <td>Create a temporary address in one click; start receiving immediately</td>
    </tr>
    <tr>
      <td><strong>Email edge</strong></td>
      <td>Cloudflare Email Workers ingest MIME via PostalMime and store structured mail</td>
    </tr>
    <tr>
      <td><strong>Expiry</strong></td>
      <td>Inboxes expire automatically; expired data is cleaned up</td>
    </tr>
    <tr>
      <td><strong>UI</strong></td>
      <td>Modern landing + inbox on Next.js 15, React 19, Tailwind, Framer Motion</td>
    </tr>
    <tr>
      <td><strong>API</strong></td>
      <td>App Router routes for inbox create, list, and message detail</td>
    </tr>
    <tr>
      <td><strong>Rate limits</strong></td>
      <td>Basic abuse protection on public endpoints</td>
    </tr>
    <tr>
      <td><strong>Admin</strong></td>
      <td>Companion ops dashboard: <a href="https://github.com/awhite0030/atommail-admin">atommail-admin</a></td>
    </tr>
  </tbody>
</table>

---

## ⚡ Quick start

```bash
# 1. Clone
git clone https://github.com/awhite0030/atommail.git
cd atommail
npm install

# 2. Configure env (Supabase URL + keys)
#    see Environment below

# 3. Run the web app
npm run dev
```

Worker (Email Routing + Wrangler):

```bash
npm run worker:dev
# production:
npm run worker:deploy
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Architecture

```text
Inbound email
    │
    ▼
Cloudflare Email Worker  ──►  Supabase (inboxes, emails)
    │
    ▼
Next.js App (Vercel)
  · landing
  · inbox UI
  · API routes
```

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15, React 19, Tailwind, Framer Motion |
| Edge mail | Cloudflare Workers + Email Routing |
| Data | Supabase (Postgres REST) |
| Deploy | Vercel + Wrangler |

### Layout

```text
app/           # Next.js UI + API routes
components/    # Landing and inbox UI
lib/           # Supabase client, rate limit
worker/        # Cloudflare Email Worker
supabase/      # SQL schema and migrations
```

---

## 🔐 Environment

Typical variables:

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Web | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web | Public anon key |
| `SUPABASE_URL` | Worker | Supabase URL (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker | Service role for ingest |

---

## 🔗 Related

| Repo | Role |
| --- | --- |
| [atommail](https://github.com/awhite0030/atommail) | Public product + Worker (this repo) |
| [atommail-admin](https://github.com/awhite0030/atommail-admin) | Ops dashboard: bans, abuse, stats |
| [Demo](https://atommail.vercel.app) | Live frontend |

---

## 📊 Stats

<p>
  <img src="https://img.shields.io/github/languages/top/awhite0030/atommail?style=flat-square" alt="Top language"/>
  &nbsp;<img src="https://img.shields.io/github/repo-size/awhite0030/atommail?style=flat-square" alt="Repo size"/>
  &nbsp;<img src="https://img.shields.io/github/last-commit/awhite0030/atommail?style=flat-square" alt="Last commit"/>
  &nbsp;<img src="https://img.shields.io/github/issues/awhite0030/atommail?style=flat-square" alt="Issues"/>
</p>

---

## 📄 License

[MIT](LICENSE) © 2026 A. White.

<sub>Built for people who just need a code once.</sub>
