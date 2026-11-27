# Resource notes & link audit — 2026-11-27

## Scope completed this pass

- Added a real `notes` field end-to-end: migration `0006_notes.sql`, `schema.sql`, `Resource` type, D1 row mapping, seed script, and a collapsible "Research notes" section on every card.
- Reviewed **all 40 `cand-expand-*` imported listings** against the provider's own page and wrote notes covering services, dollar/frequency limits, eligibility, documents, and working program links. Notes live in `src/lib/resources/data/research-overrides.ts`.
- Corrected **32 of those 40 groups**. The bulk import had guessed from keywords: Ryan White HIV and Medicaid were under "Gas", Career Pathways under "Gas", Financial Education under "Work", and the dementia helpline under "Legal".
- Added one missing listing: `hfuw-utility-assistance` under **Money Help**, sourced from Heart of Florida United Way's financial-assistance page.
- D1 now has **229 rows** (228 previous + 1 new); **41 rows carry notes**.

## The HFUW example

| Question | Finding |
|---|---|
| Was the HFUW listing under gas? | Yes, but it was the **Ryan White HIV/AIDS** listing (`cand-expand-014`), mis-bucketed by the importer. It is now **Health**, with the blocked findhelp `serviceUrl` replaced by `https://centralfloridahivpc.com/get-help/`. |
| Does HFUW offer gas help? | Only partially: the online application portal also lists **Lake Apopka Natural Gas District**. The published page is mainly emergency **electric utility** assistance. |
| What does it include? | OUC Project CARE up to **$500** once per 12 months; Duke Energy up to **twice/year**; Winter Park **$650/12 months**; Winter Garden **$650/12 months**. Rent, mortgage and other utility help go through **211 referral**, not a guaranteed payment. |
| Key caveat | Funds are limited and only a limited number of applications are accepted each week. |

The full note is on the card and in the database; primary source: https://www.hfuw.org/get-help/financial-assistance/

## Geography / honesty corrections

Three imported entries are not useful as Florida local resources and now say so plainly in their notes: Enchanted Peach (Georgia only), Read Now (Austin, Texas), and Save First Financial Wellness (Southwest Washington). Affordable Diabetic, CogniTutor and Atticus are for-profit providers and are labeled as such rather than as free aid.

## Link audit

`scripts/audit-resource-links.py` checked every `website`, `serviceUrl` and `sourceUrl` in D1: **669 URL slots** (398 unique URLs), 440 OK, 171 blocked (403/429, mostly findhelp.org and bot walls), 30 other HTTP, 21 broken, 7 network errors. Full row-level report: `docs/resource-link-audit.csv`.

A 403/429 is **not** treated as broken: many sites block datacenter agents but open for a visitor. The 21 true 404s are the next batch to fix, notably:

- `titusville.com/DocumentCenter/View/4732/Food-Pantries-List-North-Brevard...` — shared by three pantry listings
- `https://www.riverrunchristian.com/find-help` — River Run Christian Church
- `https://www.t-mobile.com/brand/project-10million` — T-Mobile Project 10Million
- `https://www.christianservicecenter.org/downtownorlando` — Christian Service Center
- `https://loveincbrevard.com/need-help` — Love INC of Brevard
- `https://www.hud.gov/renting`, `https://floridajobs.org/job-seekers`, `https://www.everyoneon.org/get-connected`

## Remaining work

- Research and annotate the other ~188 listings. Existing hand-reviewed county entries have better data than the import; priority is the broken-link list above, then the "gas" and "money" groups where people most often need exact limits.
- Replace blocked findhelp `serviceUrl` values with provider program pages as each row is reviewed.
- Add a review date to every note so stale limits are visible.
