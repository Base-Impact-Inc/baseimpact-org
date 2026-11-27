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

### Verification (fill after each step — do not report done until all pass)
- [ ] `npm run build` passes (Node >= 22.23.4)
- [ ] `dist/server/chunks/directory_*.mjs` contains `grid-cols-1` and no `grid-cols-3` for the list
- [ ] artifact mtime > `src/components/DirectoryApp.astro` mtime
- [ ] `id="load-more"` count == 1; `lookupZipCode` count == 0 in component
- [ ] no `<script src=...>` with a body
- [ ] `git status --short` reviewed; `dist/` not staged
- [ ] push to `main`; git-connected Production deploy confirms
- [ ] `curl -s 'https://baseimpact.org/directory/?v=<ts>' | grep -o 'grid-cols-1'` shows the new layout
- [ ] `curl -s 'https://baseimpact.org/api/geocode?zip=32754'` returns lat/lng

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
