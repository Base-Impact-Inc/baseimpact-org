# Astro + Cloudflare Deployment Spec (Base Impact)

Single source of truth for how this site is built, verified, and published. Read this before
editing `src/`, running a build, or deploying. Violating these rules is what caused the
2026-11-26 directory outage (source edited, stale `dist/` deployed, wrong project targeted).

## 0. Domain (authoritative)

- **`baseimpact.org` is the ONLY production domain for this site.**
- `www.baseimpact.org` redirects to it. No other domains are attached to this site.
- Verify production changes against `https://baseimpact.org/...` with a cache-bust query
  (`?v=<timestamp>`). Do **not** verify against `*.pages.dev` preview URLs — those are stale
  or 404 and will give false readings.

## 1. The build → deploy → verify gate (never skip a step)

An edit to `src/` is **not** a deployed change. `wrangler pages deploy dist/client` uploads
whatever is already in `dist/`. If you did not rebuild, you deploy stale code.

```
1. npm run build                       # must pass; Node >= 22.23.4 on PATH
2. grep the BUILT output for your marker (NOT just the source):
     grep -c "<marker>" dist/server/chunks/directory_*.mjs   # SSR/prerender=false pages
     grep -c "<marker>" dist/client/_astro/*.js              # client scripts
     grep -c "<marker>" dist/client/<page>/index.html         # static pages
   If the marker is absent, the build did not include your change. Stop.
3. commit + push (git pull --rebase origin main first; never force-push)
4. wait for the git-connected project's Production deploy on main
5. curl https://baseimpact.org/<page>?v=<ts> and grep for the SAME marker
6. only then report done
```

Build timestamp check (quick stale-build detector):

```bash
stat -c '%y' src/components/DirectoryApp.astro   # source edit time
stat -c '%y' dist/server/chunks/directory_*.mjs   # built artifact time
```

**The artifact must be newer than the source.** If it isn't, you are about to deploy old code.

## 2. Node toolchain

Astro 7 hard-gates on Node >= 22.23.4. System node is older. Prepend for every npm/astro command:

```bash
export PATH=/home/eric/.hermes/tools/node-26.12.1-linux-x64/bin:$PATH
```

## 3. Cloudflare Pages projects (which one serves production)

| Project | Type | Serves |
|---|---|---|
| `baseimpact-org-git` | Git-connected (auto-deploys on push to `main`) | **`baseimpact.org` Production** |
| `baseimpact-org` | Manual `wrangler pages deploy` | preview `*.pages.dev` only — do NOT use for releases |

**Release procedure = push to `main`.** Do not run `wrangler pages deploy dist/client` expecting
the custom domain to update; it won't. Check with:

```bash
npx wrangler pages deployment list --project-name=baseimpact-org-git
# look for Environment: Production, Branch: main
```

## 4. Editing complex components without breaking them

`src/components/DirectoryApp.astro` has a **dual desktop/mobile structure** driven by
`public/js/directory.js`. The JS queries these IDs and silently no-ops if they are missing:

- `resource-grid` (desktop list), `resource-grid-mobile` (mobile list)
- `mobile-list`, `mobile-map`, `view-list`, `view-map`
- `map-container`, `map-container-mobile`, `map-legend`, `map-legend-mobile`
- `resource-data` (JSON island via `set:html`), `results-count`, `results-count-mobile`
- `load-more`, `load-more-mobile`, `pagination`, `empty-state`, `saved-bar`
- chip groups: `.chip-group button[data-group]`, `.map-legend-chip`

Rules:

- **Start from a clean baseline.** Before a structural edit, capture the last known-good
  version: `git show <good-commit>:src/components/DirectoryApp.astro > /tmp/baseline.astro`.
  Edit that, then verify counts, rather than stacking patches on a drifted working tree.
- **Never duplicate interactive IDs.** After every edit:
  `grep -c 'id="load-more"' src/components/DirectoryApp.astro` must be 1 (and
  `load-more-mobile` 1). Repeat for all IDs above. Duplicates were introduced on 2026-11-26.
- **Never nest a script inside a `<script src=...>` tag.** Inline JS must be its own
  `<script is:inline>` block. A `<script src="...">` with body content does not execute.
- **Keep both grids in sync.** Any card/list change applies to `resource-grid` and
  `resource-grid-mobile` identically. The JS hides one and shows the other via the view toggle.
- **One resource per row:** use `grid-cols-1` (not `sm:grid-cols-2 lg:grid-cols-3`) and full
  width. A 3-column grid inside the `1fr` half of a `1fr_420px` split is what produced the
  "narrow cards, address won't wrap" complaint. Remove the split if a single full-width list
  is wanted; do not leave a filter/map beside the list.
- **Addresses must wrap:** `overflow-wrap: anywhere` + `min-width: 0` on grid children.

## 5. Interactive features: add server-side, not as inline browser hacks

The ZIP geocoder must be an Astro API route, not a browser `fetch` to a third party. Direct
browser fetches to external geocoders fail with opaque errors even when `curl` works.

- Route: `src/pages/api/geocode.ts` with `export const prerender = false`
- Validate 5-digit ZIP server-side, fetch upstream, return normalized JSON
- Client calls `/api/geocode?zip=...` (same origin), never the third party directly
- Smoke-test: `curl 'https://baseimpact.org/api/geocode?zip=32754'`

## 6. Data changes (D1)

- Migrations in `migrations/`; apply to **both** local and remote:
  `npx wrangler d1 execute baseimpact-verify --local --file <f>` and `--remote`.
- Never wrap seeds in `BEGIN`/`COMMIT` — wrangler rejects explicit transactions.
- Seeding changes data, not the worker. If live rows look stale, rebuild+redeploy first, then
  verify remote row count with `wrangler d1 execute ... --remote` and grep the live page.

## 7. Pre-deploy checklist (copy into every deploy)

```
[ ] Node >= 22.23.4 on PATH
[ ] npm run build passes
[ ] grep built artifact for my marker (dist/, not just src/)
[ ] artifact mtime > source mtime
[ ] interactive ID counts are 1 (no duplicates)
[ ] no script nested in a script-with-src
[ ] git pull --rebase; push to main (never force)
[ ] git status --short reviewed; dist/ not staged (gitignored)
[ ] curl https://baseimpact.org/<page>?v=<ts> | grep marker
```

## 8. Why this doc exists

2026-11-26: directory "fix" shipped but the live page still showed the old 3-column grid.
Cause: source edited after the last build; `dist/` was 9h stale; wrong Pages project targeted.
Fix: rebuild, verify artifact, push to git-connected project, verify custom domain. Prevention:
this spec + the `astro-cloudflare-site` skill updates.
