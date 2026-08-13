# AtomMail

Disposable email service built on Cloudflare Workers. No sign-up, no tracking, no persistence.

Inboxes are temporary. Messages are automatically cleaned up after a short period and are never stored permanently. Exact lifetime depends on the configured TTL and can vary slightly depending on worker schedule.

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

## Features
- Temporary inboxes
- Privacy focused
- Admin dashboard integration (see [atommail-admin](https://github.com/awhite0030/atommail-admin))

🚀 Updated for better onboarding!

## TODO
- Expand test coverage for worker routes (especially edge cases)
- Improve documentation with more examples
- Consider adding Docker support for local dev

## Contributing
See open issues and feel free to submit PRs! ❤️

## Recent Changes
- Clarified temporary nature of inboxes and messages (TTL / cleanup).
- Minor README polish for clarity.
- Added badges for tech stack and deployment status.
- Fixed a small typo in features list.
- Updated deployment note for Vercel compatibility.
- Small wording tweak for consistency.
- Clarified TODO priorities.
- Tiny cleanup in the features description.
- Added local wrangler dev note.
- Clarified wrangler.toml bindings note for local testing.
- Tiny extra note on what the local bindings are for.
- Added a short tip about binding name mismatches.
- Tiny wording polish in the local dev tip.
- Small clarification on the most common local setup gotcha.
- Slight wording improvement in the local setup tip.
- Another tiny clarity pass on the local tip.
- Small wording polish on the local setup tip.
- Tiny wording polish in the local setup tip.
- Clarified that cleanup timing is approximate and depends on the configured TTL.
- Small note: exact TTL can vary slightly depending on worker schedule.
- Tiny extra polish on the local setup tip wording.
- Tiny clarification on approximate inbox lifetime.
- One more small clarity note on approximate lifetime.
- Tiny extra polish on the local setup tip.
- Tiny wording polish in the local setup tip.
- Slightly clarified the most common local setup gotcha again.
- One more tiny note that lifetime is approximate by design.

## Star us if you find it useful! ⭐
