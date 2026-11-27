# Base Impact — website

Food, shelter, and help resources for Brevard, Volusia, and Orange County, Florida.
The resource directory at `/directory` reads a live Cloudflare D1 database, sorts by distance,
and offers search, ZIP/GPS lookup, filters, a List/Map toggle, saved items, and print/CSV export.

Live site: **https://baseimpact.org** (the only production domain).

## Quick start

Requires Node >= 22.23.4 (`.node-version` is 26.12.1). If your node is older:

```sh
export PATH=/home/eric/.hermes/tools/node-26.12.1-linux-x64/bin:$PATH
npm install
npm run dev        # http://localhost:4321
```

In dev, D1 bindings are unavailable, so the directory falls back to bundled snapshot data.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Local dev server at localhost:4321 |
| `npm run build` | Build to `dist/` — must pass before deploying |
| `npm run preview` | Preview the built site locally |
| `npm run db:seed` / `db:seed:local` | Seed resource data to remote / local D1 |
| `npm run db:import-third-party` | Import provider-sourced resources (verify rows first) |

## Deploying

`baseimpact.org` is served by the Cloudflare **Worker** `baseimpact-org`. After a successful
build, `npx wrangler deploy` publishes it. Pushing to `main` does not deploy production, and
`wrangler pages deploy` only updates preview URLs. See `docs/ASTRO-CLOUDFLARE-SPEC.md`.

## Project layout

```
src/pages/         routes (directory.astro is SSR; API routes under api/)
src/components/    Astro components (DirectoryApp, ResourceCard, …)
src/layouts/       Base layout
src/lib/resources/ data, loading (D1), processing, types
src/content/       posts, photos, events (content collections)
public/            static assets, images, /js/directory.js, /js/report.js
migrations/        D1 schema migrations
docs/              specs, change log, design + a11y research
legal/             nonprofit governance and grant documents
```

## Documentation

- **AGENTS.md** — instructions for coding agents (build/deploy/verify rules)
- **README.md** — this file (human quickstart)
- **CONTRIBUTING.md** — how to contribute
- **PRD.md / PRODUCT.md / STRATEGIC-DIRECTION.md** — product and strategy
- **docs/ASTRO-CLOUDFLARE-SPEC.md** — build → verify → deploy gate, D1 rules
- **docs/CHANGE-LOG.md** — changes and verification of fixes
- **docs/directory-database.md** — directory DB schema and seeding
- **docs/design-recommendations.md** — design research and motion rules
- **docs/impact-log.md** — impact stories told and pending
- **docs/accessibility-compliance-report.md** — accessibility baseline
- **legal/** — bylaws, policies, grants, board records

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
