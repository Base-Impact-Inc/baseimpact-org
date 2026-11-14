# Directory data & database

The resource directory has one source of truth and one live store.

| Layer | What it is | Where |
|---|---|---|
| Source of truth | The reviewed listing files, one per county | `src/lib/resources/data/*.ts` |
| Live store | Cloudflare D1 `baseimpact-verify`, table `resources` | remote database |
| Schema / migration | `CREATE TABLE IF NOT EXISTS resources (...)` | `migrations/0001_init.sql`, `src/schema.sql` |
| Seed / upsert script | Projects the reviewed files into D1 | `scripts/seed-resources.mjs` |
| Runtime reader | Reads D1, falls back to the bundled snapshot | `src/lib/resources/load.ts` |
| Public API | Geo + search JSON endpoint | `functions/api/resources.ts` (`/api/resources`) |

## Keeping the database in sync

```bash
npm run db:seed          # upsert every listing into the remote D1 database
npm run db:seed:local    # same, against wrangler's local database
```

The script is idempotent — rows are keyed on `id` and replaced, so running it
after editing a listing updates that listing instead of duplicating it. Run it
whenever a listing file changes; the directory reads the database at request
time, so changes appear on the next deploy or worker cold start.

## How the directory resolves its data

1. `/directory` (and `/es/directory`) are rendered per request, not pre-built.
2. The page calls `loadResources()`:
   - D1 reachable and populated → live rows, normalised to the `Resource` shape.
   - otherwise → the bundled snapshot, so the page can never render empty.
3. The UI badge names which source answered ("Live database" / "Snapshot").
4. Every row is embedded as JSON for the map, and rendered as HTML for the list,
   so filtering, search, GPS sorting, and print all work without a round trip.

## Public API

```
GET /api/resources?lat=28.61&lng=-80.81&radius=10&group=food&q=pantry&limit=50
```

- `lat` + `lng` → distance is computed for every row and results are sorted
  nearest-first (the closest-listing view).
- `radius` (miles) drops listings beyond that distance once coordinates are given.
- `q` searches name, description, address, and tags case-insensitively.
- `county` / `group` filter exactly; `limit` defaults to 500 and caps at 1000.

Response:

```json
{ "resources": [ { "id": "res-1", "name": "…", "distanceMiles": 3.4, "…": "…" } ],
  "total": 138, "returned": 50 }
```

## Notes

- The database does not store `city`/`state`; they are derived from the address
  when rows are loaded, because the address is the field partners actually maintain.
- `mobile_only` entries (phone services with no walk-in location) are always kept
  regardless of distance and radius — a phone line is never "too far away".
