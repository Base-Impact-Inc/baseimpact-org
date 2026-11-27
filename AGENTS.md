# AGENTS.md — Base Impact website

Instructions for coding agents working in this repo. Human-facing overview is in `README.md`.
Verified project facts only. When these conflict with a user request, the user wins.

## What this is

Astro 7 + Cloudflare Worker site for Base Impact (Florida nonprofit). The resource directory
reads Cloudflare D1 at request time and falls back to a bundled snapshot. One production domain:
`https://baseimpact.org`.

## Toolchain

- Node >= 22.23.4 (see `.node-version`: 26.12.1). System node is older. Prepend for every
  npm/astro/wrangler command:
  `export PATH=/home/eric/.hermes/tools/node-26.12.1-linux-x64/bin:$PATH`
- `npm run dev` (localhost:4321, D1 unavailable → snapshot fallback)
- `npm run build` (must pass before any deploy; writes `dist/`)
- `npm run preview`

## Deploy (READ CAREFULLY — get this wrong and nothing goes live)

`baseimpact.org` and `www.baseimpact.org` are **custom domains on the Worker `baseimpact-org`**.
The Pages projects (`baseimpact-org`, `baseimpact-org-git`) serve only `*.pages.dev` previews.

Correct release:
```bash
npm run build
npx wrangler deploy                       # deploys the Worker -> baseimpact.org
curl -s 'https://baseimpact.org/directory/?v=<ts>' | grep '<marker>'
```
Git push to `main` is version control only — it does NOT deploy the Worker.
Never use `wrangler pages deploy` for a production release. Full detail:
`docs/ASTRO-CLOUDFLARE-SPEC.md`.

## Build → verify → deploy gate (never skip)

A source edit is not a deployed change. `wrangler deploy` ships the built `dist/`, not `src/`.

1. `npm run build`
2. Grep the BUILT artifact for your marker (SSR pages: `dist/server/chunks/<page>_*.mjs`;
   static pages: `dist/client/<page>/index.html`; CSS: `dist/client/_astro/*.css`).
3. Confirm artifact mtime > source mtime (`stat -c '%Y' <file>`).
4. Only then deploy. Verify against `https://baseimpact.org/...` with a cache-bust query,
   never a `*.pages.dev` URL. Re-fetch a few times if an edge copy looks stale.

## D1 / data

- Binding: `baseimpact_verify` (in `wrangler.jsonc`). Migrations in `migrations/`, apply to both
  local and remote: `npx wrangler d1 execute baseimpact-verify --local|--remote --file ...`
- Never wrap seed SQL in `BEGIN`/`COMMIT` — wrangler rejects explicit transactions.
- `src/pages/directory.astro` loads rows via `loadResources()` then maps with
  `calculateDistanceMiles()` + `getNextAvailableInfo()` from `src/lib/resources/logic.ts`.
  Do not use `processResources()` there — it reads the static snapshot, not D1.
- Seeding changes data, not the worker. Rebuild + redeploy before diagnosing "stale rows".

## Directory component contract (`src/components/DirectoryApp.astro`)

`public/js/directory.js` is self-contained and queries these IDs. Keep exactly one of each;
the JS silently no-ops if they are missing:
`resource-grid`, `resource-grid-mobile`, `mobile-list`, `mobile-map`, `view-list`, `view-map`,
`map-container`, `map-container-mobile`, `map-legend`, `map-legend-mobile`, `resource-data`,
`results-count`, `results-count-mobile`, `load-more`, `load-more-mobile`, `pagination`,
`pagination-mobile`, `empty-state`, `empty-state-mobile`, `saved-bar`, `zip-input`,
`use-location-btn`, `radius-select`, `state-filter`, `search-input`, `open-now`.

Rules learned the hard way:
- **Full-width single-column list.** No `grid-cols-3` inside a `1fr_420px` split — that produced
  narrow cards and unreadable addresses. The map is a toggled view, not a side column.
- Keep desktop and mobile grids in sync; both render the same cards/data attributes.
- Never stack patches on a drifted component. Save a clean baseline first:
  `git show <good-commit>:path/to/component.astro > /tmp/baseline`, then edit that.
- Interactive IDs must appear exactly once (`grep -c 'id="x"'`). No `<script>` body inside a
  `<script src=...>` tag. Inline scripts that must execute in place use `is:inline`.
- Verify in the built artifact; a passing build that renders the wrong layout is still broken.

## External fetches

Server-side only. ZIP geocoding uses the existing SSR route `src/pages/api/geocode.ts`
(`export const prerender = false`, calls zippopotam.us); the client calls `/api/geocode?zip=...`.
Never `fetch()` a third-party API directly from the browser.

## Content / photos

- Posts: `src/content/posts/<slug>.md` (`draft: true` until approved). Photos: `public/assets/`.
- Wire images by hand-written descriptive filename (ground truth for event identity).
- Optimize before publishing (<=1600px, progressive JPEG q82). Verify the built route carries
  the image; a frontmatter-only edit is not done. Consent required for public photos.
- Never write a narrative around an unidentified photo — publish a neutral `src/content/photos/` entry.

## Git

`git pull --rebase origin main` before push. Never force-push. Stage only intended files;
`dist/` is gitignored. Do not commit legal/filing documents or private material.

## Where the deeper rules live (don't duplicate them here)

- `docs/ASTRO-CLOUDFLARE-SPEC.md` — full build/deploy/D1/component spec and checks
- `docs/CHANGE-LOG.md` — change + verification record
- `docs/directory-database.md` — directory DB schema/seed details
- `docs/design-recommendations.md`, `.agents/skills/design-taste-frontend/` — design rules
- `docs/impact-log.md` — stories told and pending
- `docs/accessibility-compliance-report.md` — a11y baseline
- `PRD.md`, `PRODUCT.md`, `STRATEGIC-DIRECTION.md` — product/strategy source of truth
- `legal/` — nonprofit governance, bylaws, grant/legal documents (not website code)
