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

### 2026-11-27 — Directory filters fully functional (verified in headless Chrome)

Root cause: `activeGrid()` filtered the *hidden mobile grid* on desktop, so category chips,
search, state and open-now changed nothing visible. Mobile also had no filter chips (nav was
`hidden lg:block`), and there was no "All" chip to reset a category.

| # | Change | Files |
|---|---|---|
| 1 | Remove duplicated mobile list/map markup; one list + one toggleable map at all widths | `src/components/DirectoryApp.astro` |
| 2 | Show category chip nav at all widths; add an "All" chip | `src/components/DirectoryApp.astro` |
| 3 | `activeGrid()` always returns the single visible grid; remove all mobile JS branches | `public/js/directory.js` |
| 4 | Chip selector includes the "All" chip (`.chip-groups button[data-group]`) | `public/js/directory.js` |
| 5 | Keep location label on the live object so ZIP status reads "Showing results near Mims, FL" | `public/js/directory.js` |

Headless Chrome results (live `baseimpact.org`, no page errors):
- Food chip: 154 → 62 results; All: → 154; Shelter: → 30
- Search "pantry": → 60; Open now: → 17
- Load more: 12 → 24 visible; State FL: → 115
- ZIP 32754: "Showing results near Mims, FL · road distance (driving)", nearest 3.3 mi
- Invalid ZIP: "Enter a valid 5-digit ZIP code."
- Map click hides grid/shows map; List click reverses
- Deployed Worker version `d5e93a07`; commits `1a956ef3`, `62e893aa`, `d77a824f`

### 2026-11-27 — Map legend buttons no longer make listings/markers disappear

Reported: desktop showed all listings, then they disappeared after clicking several map buttons.
Root cause: `filterMap()` removed layers from the Leaflet layer group while iterating it with
`eachLayer()` — skipped entries and permanently dropped markers, so switching categories after
the first click showed 0 markers. The map legend also had no "All" chip to reset the filter.

| # | Change | Files |
|---|---|---|
| 1 | Keep a persistent `allMarkers` list; `filterMap()` calls `layer.clearLayers()` then re-adds matching markers from that list | `public/js/directory.js` |
| 2 | Add an "All" chip to the map legend (resets to all 154 markers) | `src/components/DirectoryApp.astro` |

Headless Chrome verification of the exact reported flow (no page errors):
- Load-all → 154 visible listings; open map → 154 markers
- Click every category chip in sequence → 5 markers (Crisis), no errors
- Click map "All" chip → 154 markers restored
- Back to List → all 154 listings still visible
- Food chip after map use → 62 results (filters still work)
- Commits `552b4db7`, `d8cd5dc9`; Worker version `597f07f7`

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
