# Change Log & Verification Record

Repo: `/home/eric/projects/baseimpact-org` · Production domain: `https://baseimpact.org` (only domain)

## 2026-11-27 — Resource notes, reclassification, link audit & distance research (deployed)

### Changes
| # | Change | Files |
|---|--------|-------|
| 1 | Added a real `notes` field (migration, schema, type, D1 mapping, seed script) and a "Research notes" expander on each card | `migrations/0006_notes.sql`, `src/schema.sql`, `src/lib/resources/types.ts`, `src/lib/resources/load.ts`, `scripts/seed-resources.mjs`, `src/components/ResourceCard.astro` |
| 2 | Reviewed all 40 `cand-expand-*` imports against provider pages; wrote notes and corrected 32 groups; replaced blocked findhelp links | `src/lib/resources/data/research-overrides.ts`, `src/lib/resources/data/index.ts` |
| 3 | Added missing listing `hfuw-utility-assistance` with full utility-program notes (OUC $500, Duke 2x/year, Winter Park/Garden $650, 211 referral) | `src/lib/resources/data/research-overrides.ts` |
| 4 | Added a link-audit tool and row-level report (670 URL slots) | `scripts/audit-resource-links.py`, `docs/resource-link-audit.csv` |
| 5 | Labeled straight-line vs road distance; documented findhelp comparison | `public/js/directory.js`, `docs/distance-research.md` |
| 6 | Documented decisions, geography warnings, and the next batch | `docs/resource-research-2026-11-27.md` |

### Verification (all passed 2026-11-27)
- [x] Migration applied remote + local; `notes` column confirmed in D1 `PRAGMA table_info`
- [x] `npm run build` passes; `npm run db:seed` upserts 228 source rows; D1 count = 229; 41 rows have notes
- [x] `npx wrangler deploy` → Worker version `abade86a-85cc-4825-955e-ec7061c8c9b1`
- [x] Live browser: 229 results; Ryan White card is `data-group="health"` with a 570-char note and working `centralfloridahivpc.com` link; new HFUW utility card is `data-group="money"` with a 1,785-char note; zero `pageerror`
- [x] Filter regression still passes (`scripts/smoke-directory-filter.mjs`) against dev
- [x] Link audit: 669 URL slots, 440 ok, 171 blocked, 30 other HTTP, 21 broken, 7 errors; 403s recorded as blocked, not broken
- [x] Distance research: five findhelp distances fit Haversine from ZIP centroid 28.722/-80.943 with RMSE 0.055 mi; no algorithm copied, only basis labeling changed

## 2026-11-27 — Directory `?filter=` deep link fixed (deployed)

### Problem
- The nav item "Crisis Help (211)" links to `/directory?filter=crisis`, but no code ever read
  the `filter` query parameter. The page loaded all 228 resources with the "All" chip active.
- All interactive controls (category chips, search, state, open-now, radius/ZIP, saved)
  were verified working at 1280px and 390px on both dev and production; the broken surface
  was specifically the deep link. Git history confirms the parameter was never implemented
  (`git log -S 'URLSearchParams'` on the directory files is empty).
- Separately, chip buttons rendered the literal text of an Astro expression inside `class`
  (`{g === 'all' ? ...}`). It did not block filtering because JS toggles the classes, but it
  produced invalid class tokens in the DOM.

### Changes
| # | Change | Files |
|---|--------|-------|
| 1 | Read `?filter=` on init, validate against rendered chip values, let existing `syncChips()`/`render()` apply it | `public/js/directory.js` |
| 2 | Replace literal interpolation in chip class with `class:list` | `src/components/DirectoryApp.astro` |
| 3 | Add reusable smoke test covering deep link + normal chip click | `scripts/smoke-directory-filter.mjs` |

### Verification (all passed 2026-11-27)
- [x] Red/green loop: before fix, `?filter=crisis` → 228 results, chip not pressed; after fix → 5 results, all visible cards `data-group="crisis"`, chip `aria-pressed=true`
- [x] `npm run build` passes (Node 26.12.1); built `dist/client/js/directory.js` contains the parameter handling
- [x] `node scripts/smoke-directory-filter.mjs` PASSES against dev (238 snapshot rows) and production (228 D1 rows), zero unexpected page errors
- [x] Full control sweep on production at 1280px and 390px: every chip changes count and visible cards, search/state/open-now/radius work, no `pageerror`; `?filter=crisis` now reports 5 results
- [x] `npx wrangler deploy` → Worker `baseimpact-org`, version `ce1a6a6e-c2ab-49db-b7ff-bb445b626f41`; 4/4 repeated live checks returned the filtered crisis list

## 2026-11-27 — AI Hardware Campaign page + linked blog article (deployed)

### Changes
| # | Change | Files |
|---|--------|-------|
| 1 | New funder/manufacturer campaign page at `/ai-hardware-campaign`: 32–128 GB ask, three hardware paths, use cases, five-step stewardship, donor reporting, tax-status note, honest "no hardware yet" status | `src/pages/ai-hardware-campaign.astro` |
| 2 | New linked article `/blog/ai-hardware-campaign` ("A Local AI Lab for the Neighbors We Serve") with runnable CTA links and cited Apple/AMD spec pages (checked 2026-11-27) | `src/content/posts/ai-hardware-campaign.md` |
| 3 | Cross-links from nav (Resources), `/grants`, `/grants/ai-toolkit`, `/partners`; route recorded in PRD, impact log, stock-image provenance | `src/components/Navigation.astro`, `src/pages/grants.astro`, `src/pages/grants/ai-toolkit.astro`, `src/pages/partners.astro`, `PRD.md`, `docs/impact-log.md`, `docs/stock-images.md` |
| 4 | Removed `min-height: 320px` from shared post hero (aspect-ratio + min-height forced 569px width at 390px viewport on every post) | `src/pages/blog/[slug].astro` |
| 5 | Fixed mobile overflow on the campaign table: `overflow-x-auto` is not a defined utility in `global.css`, so used inline `overflow-x:auto` + `min-width:680px` on the table | `src/pages/ai-hardware-campaign.astro` |

### Verification (all passed 2026-11-27)
- [x] `npm run build` passes with Node 26.12.1 after every edit; artifact mtime > source mtime
- [x] `dist/client/ai-hardware-campaign/index.html` and `dist/client/blog/ai-hardware-campaign/index.html` exist with markers; both URLs in `dist/client/sitemap-0.xml`
- [x] Headless Chrome at 1280px and 390px: both pages HTTP 200, `h1` opacity 1, no missing alt, zero `pageerror`, `body.scrollWidth == innerWidth` (390/390 after fix)
- [x] Clicked the rendered campaign -> article CTA link; nav link present on homepage (2 occurrences: desktop + mobile menus)
- [x] `npx wrangler deploy` -> Worker `baseimpact-org`, version `c640995f-c4fa-41df-a6a5-85f73b657344`
- [x] Live: `/ai-hardware-campaign/` HTTP 200 with headline; `/blog/ai-hardware-campaign/` HTTP 200 with article title and 6 links to campaign; sitemap contains both URLs
- [x] Early cache-bust requests to the new article alternated 200/404 from stale edge copies; 6/6 subsequent unique-query requests returned 200 (no code change)
- [x] Deployed directory smoke test: `/directory/` HTTP 200, 228 results, `grid-cols-1 w-full` present; `/api/geocode?zip=32754` returns Mims coords
- [x] User explicitly approved deploying the campaign together with the pre-existing uncommitted directory/migration work in the working tree

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
