# AtomMail

Disposable email service built on Cloudflare Workers. No sign-up, no tracking, no persistence.

Inboxes are temporary. Messages are automatically cleaned up after a short period and are never stored permanently. Exact lifetime depends on the configured TTL and can vary slightly depending on worker schedule.

Under heavy use or tight free-tier KV limits, some cleanup / write operations can start failing earlier than expected — keep an eye on the Cloudflare usage dashboard if you self-host.

## Quick Start
1. Clone the repo
2. `npm install`
3. Deploy with `wrangler deploy` or Vercel.

For local development:
```bash
npm install
npx wrangler dev
```

Make sure your `wrangler.toml` has the required KV / D1 bindings for a basic smoke test. A minimal local setup usually just needs the bindings declared so the worker can start without runtime errors.

Tip: if the worker fails to start locally, double-check that the binding names in `wrangler.toml` match what the code expects — this is the most common gotcha when getting started.

After deploy, double-check that your KV and D1 bindings are correctly linked in the Cloudflare dashboard — a missing binding is the most common reason the worker starts but returns errors.

## Features
- Temporary inboxes
- Privacy focused
- Admin dashboard integration (see [atommail-admin](https://github.com/awhite0030/atommail-admin))

## TODO
- Expand test coverage for worker routes (especially edge cases)
- Improve documentation with more examples
- Consider adding Docker support for local dev
- Empty-state message when an inbox has no messages yet (friendly “waiting for first email” note)

## Contributing
See open issues and feel free to submit PRs! ❤️

## Recent Changes
- Tiny README wording tweak for the local wrangler tip.
- Added a short note about KV quota pressure and cleanup behavior.
- Added a short post-deploy tip about verifying KV/D1 bindings.
- Clarified that inbox lifetime is approximate and depends on the configured TTL / worker schedule.
- Cleaned up older polish notes for readability.
- Minor README polish for clarity.
- Captured empty-state idea in the TODO list.

## Star us if you find it useful! ⭐
