# AtomMail

Disposable email service built on Cloudflare Workers. No sign-up, no tracking, no persistence.

Inboxes are temporary. Messages are automatically cleaned up after a short period and are never stored permanently. Exact lifetime depends on the configured TTL and can vary slightly depending on worker schedule.

The default TTL is intentionally short. You can change it in your Worker configuration / KV settings if you want longer-lived inboxes for self-hosted instances.

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

After deploy, double-check that your KV and D1 bindings are correctly linked in the Cloudflare dashboard — a missing binding is the most common reason the worker starts but returns errors. If something still looks off, open the Worker logs in the Cloudflare dashboard; they usually surface the problem (missing bindings, migration issues, etc.) within a few seconds.

## Features
- Temporary inboxes
- Privacy focused
- Admin dashboard integration (see [atommail-admin](https://github.com/awhite0030/atommail-admin))

## TODO
- Expand test coverage for worker routes (especially edge cases)
- Improve documentation with more examples
- Consider adding Docker support for local dev
- Friendly empty-state message when an inbox has no messages yet (“waiting for first email”)
- Optional “last cleaned” hint on the empty inbox state (see #26)
- Rough remaining lifetime next to the address (see #29)
- Soft warning banner when inbox is about to expire (see #28)
- Clarify in docs that inbox TTL is configurable (see #30)

## Contributing
See open issues and feel free to submit PRs! ❤️

## Recent Changes
- Tiny clarity tweak on the TTL note.
- Noted that inbox TTL is configurable via Worker/KV settings.
- Captured docs idea about configurable TTL (#30).
- Captured soft-warning-when-expiring idea (#28) in the TODO list.
- Captured remaining-lifetime idea (#29) in the TODO list.
- Mentioned the empty-state “last cleaned” idea in the TODO list.
- Tiny wording polish on the empty-state TODO note.
- Tiny clarity tweak on the post-deploy Worker logs tip.
- Tiny polish on the post-deploy Worker logs tip (mention migration issues).
- Tiny clarity tweak on the post-deploy Worker logs tip.
- Tiny polish on the post-deploy bindings tip (mention Worker logs).
- Tiny README wording tweak for the local wrangler tip.
- Added a short note about KV quota pressure and cleanup behavior.
- Added a short post-deploy tip about verifying KV/D1 bindings.
- Clarified that inbox lifetime is approximate and depends on the configured TTL / worker schedule.
- Cleaned up older polish notes for readability.
- Minor README polish for clarity.
- Captured empty-state idea in the TODO list.

## Star us if you find it useful! ⭐
