# Content duplicate audit — 2026-11-18

## Method

- Inventoried all **23 published posts** and **12 photo-collection entries** under `src/content/`.
- Scored every post pair on token overlap, sequence similarity, and title similarity; grouped by shared `image` path.
- Hashed all image files in `public/assets` — **no byte-identical image files** were found.
- Read every candidate pair in full before making a decision. No content was deleted.

## Verified duplicates (merged)

### 1. Cold-weather shelter training — same event, same photo

| File | Verdict |
|---|---|
| `cold-weather-shelter-training.md` | Generic version, no location, no sources, dated 2026-09-19 |
| `lifepointe-cold-weather-shelter.md` | Specific, sourced LifePointe/CREW 29 version, same date |

Evidence: identical publication date, **identical image** (`lifepointe-cold-weather-shelter-cots-2026-09-19.jpg`), and the same four training themes (cot setup, intake/welcome, hospitality, team coordination). The LifePointe version adds the venue, organization, phone number, and four cited sources.

Action: merged the generic post's unique material — Base Impact's role bullets and the ~40°F / 211 shelter-opening guidance — into the LifePointe post as a new section. The generic post is now `draft: true` with an HTML comment recording the merge. It no longer renders on `/blog` or the home page.

### 2. Warehouse racking photo — same file, same date

| File | Verdict |
|---|---|
| `warehouse-racking-build.md` | Generic title/caption, same image and date |
| `warehouse-racking-build-2026-09-17.md` | Date-named, specific LifePointe caption |

Evidence: identical image path, identical date (2026-09-17), identical album (`warehouse`), identical `consent: true`. Two gallery cards for one photograph.

Action: kept the date-named entry and improved its caption to mention the volunteer shelving build for donated goods and clothing. The generic entry is now `draft: true` with a merge note. `/photos` filters drafts, so only one card remains.

### 3. CoC membership announcement + November meeting report — merged on owner request

| File | Verdict |
|---|---|
| `brevard-homeless-coc-coalition.md` | Kept. Preferred slug, membership announcement (Oct 29). |
| `coc-general-meeting-2026-11-04.md` | Draft tombstone. Meeting report (Nov 4). |

Earlier audit classified these as separate stories. The site owner later asked for them to be merged and chose the `brevard-homeless-coc-coalition` slug. Evidence: same organization, same photo, and the meeting report itself says the involvement "began when we joined the CoC in October 2026" — one continuous membership story.

Action: merged the meeting report's unique material into the membership post — 2027 calendar (Feb 3, May 5 annual, Aug 4 Agency Resource Fair, Nov 3), Center for Collaboration venue, lead-agency designation, "rare, brief, nonrecurring" framing, quarterly open meetings, and source [10]. The meeting post is `draft: true` with an HTML merge note, and `public/_redirects` 301s both URL variants to the kept post. Nothing deleted.

## Checked and NOT duplicates (all kept)

| Pair | Why they are different |
|---|---|
| `operation-christmas-child-shoebox.md` ↔ `rock-church-operation-christmas-child.md` | National "what/how to participate" explainer with sources vs. a local Rock Church packing event with its own photo and named church. Complementary, not doubles. |
| `family-seeking-shelter-rent-funds.md` ↔ `moving-elderly-neighbor-new-home.md` | Ongoing rental-assistance case for a family vs. a completed one-day move of a 73-year-old from her car into an 83-year-old neighbor's spare room. Same stock image only. |
| `helping-travelers-florida-heat.md` ↔ `moving-elderly-neighbor-new-home.md` | Heat outreach and rides vs. a housing match and move. Different dates and people. |
| `helping-new-florida-resident-find-work.md` ↔ `internet-bill-fund-assistance.md` | Job-search/computer setup vs. an internet-bill intervention. Both are technology stories but different neighbors and outcomes. |
| `reloading-laptop-war-veteran.md` ↔ `helping-new-florida-resident-find-work.md` | Veteran laptop reload vs. a new resident's donated-computer setup and job applications. |

## Shared images that are not content duplicates

- `community-volunteers.jpg` — heat outreach post and the Welcome to Base Impact post.
- `homeless-shelter-community.jpg` — family rent-assistance story and the elderly-neighbor move story. A distinct photo should replace one of these when available.
- `tech-help-digital-skills.jpg` — veteran laptop story only.
- `operation-christmas-child-shoebox-gift-2026-11-16.jpg` vs `rock-church-operation-christmas-child-packing-2026-11-16.jpg` — different photos (gift vs. packing event), not duplicates.

## State after merge

- Posts: 23 files, **21 published** (2 draft tombstones).
- Photos: 12 files, **11 published** (1 draft tombstone).
- Files deleted: **none**. Both merged-away entries are reversible by flipping `draft` back to `false`.
