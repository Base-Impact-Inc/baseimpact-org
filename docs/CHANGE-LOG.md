# Change Log & Verification Record

Repo: `/home/eric/projects/baseimpact-org` · Production domain: `https://baseimpact.org` (only domain)

## 2026-11-27 — Directory layout clean fix + process spec

### Problem
- `/directory/` rendered narrow 3-column cards (`sm:grid-cols-2 lg:grid-cols-3`) inside a
  `1fr_420px` split, so addresses wrapped badly and users saw two grids (desktop split + mobile).
- Prior "fix" committed source edits but deployed a stale `dist/` (built 10:29, source 19:44)
  to the wrong Pages project (`baseimpact-org` preview instead of git-connected production).
- Component had accumulated a duplicate `load-more` button, 3 copies of `lookupZipCode`, and
  a script nested inside a `<script src=...>` tag.

### Changes
| # | Change | Files |
|---|---|---|
| 1 | Added deployment spec (build→verify→deploy→verify gate, single domain, editable-ID rules) | `docs/ASTRO-CLOUDFLARE-SPEC.md` |
| 2 | Added this change log | `docs/CHANGE-LOG.md` |
| 3 | Restore `DirectoryApp.astro` from clean baseline `f5f001f1` (removes all stacked junk) | `src/components/DirectoryApp.astro` |
| 4 | Single-column full-width resource list; map becomes a toggled panel, not a side column | `src/components/DirectoryApp.astro` |
| 5 | Remove stale CSS overrides; keep single-column address wrapping | `src/styles/global.css` |
| 6 | ZIP lookup stays server-side via existing `/api/geocode` (no inline Nominatim fetch) | (no change — verified present) |

### Verification (all passed 2026-11-27)
- [x] `npm run build` passes (Node 26.12.1)
- [x] `dist/server/chunks/directory_*.mjs` has `grid-cols-1 w-full`, no `grid-cols-3`, no `1fr_420px`
- [x] artifact mtime > source mtime (both DirectoryApp.astro and directory.astro)
- [x] `id="load-more"` count == 1; `lookupZipCode` count == 0 in component
- [x] no `<script src=...>` with a body (all 3 script bodies empty)
- [x] `git status --short` clean before commit; `dist/` not staged
- [x] push to `main` (rebased, no force)
- [x] `curl https://baseimpact.org/directory/?v=<ts>` → HTTP 200, `grid-cols-1 w-full` present,
      `grid-cols-3` and `1fr_420px` absent, 154 results from D1
- [x] shipped CSS contains `overflow-wrap:anywhere` and `width:100%`
- [x] `https://baseimpact.org/api/geocode?zip=32754` → `{"lat":28.6974,"lng":-80.8663,"label":"Mims, FL"}`

### Production target CORRECTION (important)
`baseimpact.org` is served by the **Cloudflare Worker** `baseimpact-org`
(worker custom domains: baseimpact.org + www.baseimpact.org), NOT by a Pages project.
- Correct release: `npm run build` then `npx wrangler deploy` (deploys `baseimpact-org` Worker).
- `wrangler pages deploy dist/client --project-name=baseimpact-org(-git)` only updates
  `*.pages.dev` preview URLs and does NOT change baseimpact.org. This was the root cause
  of the earlier "fix not showing".
- Git push to main is for version control / the git Pages project's own CI; the Worker is
  what serves production and must be deployed explicitly after each build.
- During this fix, the Worker deploy initially returned 500 because a prior commit had
  renamed `processed` → `resources` in `src/pages/directory.astro` but left two usages of
  the undefined `processed`. Fixed by mapping DB rows with `calculateDistanceMiles` +
  `getNextAvailableInfo`; the live page now renders D1 data (154 results).

### Past-session tasks checked for reapplication
- Card redesign session (`local-16d6f9e9…`): its clean `ResourceCard.astro` (lightbox, distance
  row, wrapped address) is already in the tree and kept. Its DirectoryApp split view was the
  source of the narrow grid — intentionally replaced with the single-column layout above.
- Placeholder-image session (`local-4e5ffadd…`): commits `47a9899e` / `396597b1` already
  rebased into `main`; no reapplication needed.

### Data caveat (must resolve before calling imported resources verified)
`scripts/third-party-resources.json` / `scripts/more-resources.json` were machine-generated with
some invented phone numbers and addresses. They were seeded into **local D1 only** (commands
did not use `--remote`), so nothing fabricated is live. Before importing to production, verify
each row against the provider page. Do not publish these as verified resources as-is.
