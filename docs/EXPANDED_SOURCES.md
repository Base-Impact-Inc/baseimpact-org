# Expanded service sources — import notes

Last expanded: 2026-11-27. Focus: low-income / no-income residents, people experiencing
homelessness, and anyone in Brevard and its neighbouring counties trying to get back to
work or find essentials.

## Sources used

| Source | URL pattern | Pages sampled | Result |
|---|---|---|---|
| findhelp.org | `https://www.findhelp.org/<category>/all?postal=32754` | First page (10 listings) of all 10 categories: food, housing, goods, transit, health, money, care, education, work, legal | 100 raw, 68 duplicates, 32 new + 34 from the earlier first pass |
| 211 Brevard | `https://search.211brevard.org/search?...&query_type=taxonomy` | Pantries, Job Preparation/Search, plus 10 other topic pages fetched for coverage review | Pantry listings were already fully covered; 12 job listings yielded 8 unique new records |

212 Brevard topic pages are blocked to the automation browser, so listing details were
read from the rendered preview pane. Phone numbers were taken from visible page text;
masked `tel:` links were never reconstructed.

## Geographic scope

Brevard County plus bordering/surrounding counties: Volusia, Orange, Indian River,
Seminole, Osceola, St. Lucie, Polk and Lake. Statewide / all-US phone and online services
are retained because they are reachable from the county and are marked `mobileOnly` when
there is no walk-in location.

## Field mapping

- Source wording is preserved in `coverage`, `eligibility`, `cost`, `documents` and
  `languages`. Values not stated by a source are written as `See source listing`, never
  guessed.
- `sourceUrl` is always the exact listing URL; `importedSource` is `findhelp.org` or
  `211brevard.org`; `sourceType` is `third-party`; `importDate` is the research date.
- Coordinates come from the project ZIP geocoder. Phone/online-only records use the
  documented Brevard centre point (28.326, -80.751) and `mobileOnly: true`.
- New browse groups: `education`, `work`, `legal`; existing groups reused for
  goods → `basics`, transit → `gas`, care → `health`.

## Dedupe rule

Token-set Jaccard ≥ 0.7 on normalised names against the current directory and against
earlier candidates. 68 of 100 findhelp candidates and 4 of 12 job listings were dropped.
IDs are checked for uniqueness after bundling.

## Data files

- `scripts/third-party-candidates.json` — first pass (34 records, food/housing/money/health)
- `scripts/third-party-candidates-expanded.json` — this pass (40 records, all categories + jobs)
- `src/lib/resources/data/import-findhelp-expanded.ts` — first reviewed batch
- `src/lib/resources/data/import-services-expanded.ts` — this reviewed batch

## Verification status

Verify before promoting a candidate to a first-party listing: `lastVerified`, hours,
eligibility and phone. Several findhelp programs are statewide or national and may have
long waits; the directory shows `Coverage` verbatim so a resident can judge relevance.
