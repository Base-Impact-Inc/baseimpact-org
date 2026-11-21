# Technology access & hardware-reuse research (2026-11-18)

## Short answer

Yes. The directory already has a Technology tab — `group: "technology"` in
`src/lib/resources/types.ts`, labelled "Technology" / "Tecnología" in
`src/components/DirectoryApp.astro` — but only five entries use it: Xfinity
Internet Essentials, T-Mobile Project 10Million, Human-I-T, Everyone On, and
FCC Lifeline. All are connectivity or general low-cost-device programs. None
covers veteran-specific refurbished computers, a Brevard County refurbisher,
hardware donation outlets, or AI compute. Four verified additions fit the
existing schema with no UI change.

For the person who emailed about an underserved veteran: **Tech For Troops**
is the closest match. It gifts refurbished computers to veterans and
veteran-serving nonprofits, accepts donated laptops, tablets, cell phones,
**and computer parts**, and ships devices to recipients outside Richmond.[1][17]
The VA has partnered with it since 2014.[10]

## Tier 1 — recommend adding to the directory (`group: "technology"`)

### 1. Tech For Troops — national, veteran-specific

Receives used technology, refurbishes it, and provides it with training to
transitioning active-duty members, veterans, and nonprofits that serve
veterans; the VA describes three programs: IT training, technology reuse, and
computer recycling.[1][10] It accepts working *and* non-working laptops,
iPads, tablets, cell phones, and computer parts, with free recycling and
paid data-destruction/ITAD services for organizations.[1] Richmond-area
recipients attend a basic computer-literacy class first; equipment can be
shipped elsewhere by application.[17] Phone 804-521-7979; 4840 Waller Rd,
Richmond VA 23230; donations Mon–Fri 9–4, Sat 9–12.[1]

### 2. Computers Advancing Education (CAEI) — local, Brevard County

A Titusville 501(c)(3) that refurbishes donated computers and supplies them at
no cost to schools, nonprofits, and individuals; its site reports 12,000+
computers placed since 2005 and invites partner inquiries at 321-626-9754,
3000 Jolly Street, Titusville FL 32780.[12] A 2025 local report says the
all-volunteer group is short of funds for replacement parts, so list it with
"call to confirm availability" rather than promising stock.[13] **This is the
only Brevard County hardware refurbisher found in this research.**

### 3. World Computer Exchange — donation outlet + device supply

A 501(c)(3) that takes functional laptops, desktops, phones, and tablets under
seven years old, with free nationwide mail-in labels, local drop-off chapters,
and business ITAD pickup, certified data destruction, and tax receipts.[3]
Useful on both sides: a place for local companies to send surplus gear and a
potential device source for partner organizations.

### 4. PCs for People — low-cost devices for eligible households and nonprofits

Provides refurbished computers and hotspots to income-qualified people, and
sells refurbished devices to eligible 501(c)(3)s (up to five online; 6+ via
partner@pcsforpeople.org).[14] It holds NAID AAA and R2 certifications for
data destruction and electronics recycling.[14] The technology-access page
already names it, but the directory has no entry — adding one makes the
mention actionable.

### Draft entries (paste into `statewide.ts` / `brevard.ts`)

Coordinates for CAEI were geocoded from its published street address.
`sourceUrl` is the page the facts were confirmed from; keep `lastVerified`
set to the day you re-check it.

```ts
// statewide.ts — append to STATEWIDE_RESOURCES
{
  id: "res-tech-5",
  name: "Tech For Troops",
  category: "Charity Free Services",
  address: "National — 4840 Waller Rd, Richmond, VA 23230",
  lat: 28.7617,
  lng: -80.8625,
  phone: "804-521-7979",
  website: "https://www.techfortroops.org/",
  serviceUrl: "https://www.techfortroops.org/",
  sourceUrl: "https://www.techfortroops.org/",
  description: "Gifts refurbished computers to veterans, transitioning service members, and nonprofits that serve veterans, with free or low-cost computer skills training. Donates working or non-working laptops, tablets, cell phones, and computer parts; devices can be shipped to recipients outside the Richmond area. Apply online. Local recipients complete a basic computer literacy class first.",
  hoursText: "Donations Mon–Fri 9:00 AM – 4:00 PM; Sat 9:00 AM – 12:00 PM",
  schedule: {1: [[9, 16]], 2: [[9, 16]], 3: [[9, 16]], 4: [[9, 16]], 5: [[9, 16]], 6: [[9, 12]]},
  tags: ["Veterans", "Refurbished Computers", "Computer Training", "Parts Donation", "Ships Nationwide"],
  partnerType: "Nonprofit",
  capacityStatus: "Open & Ready",
  group: "technology",
  services: [],
  county: "Statewide",
  city: "National",
  state: "FL",
  lastVerified: "2026-11-18",
  eligibility: "Veterans, transitioning active-duty, National Guard and Reserve members, and nonprofits whose mission serves veterans.",
  documents: "Online application; local recipients attend or test out of a computer literacy class.",
  mobileOnly: true,
},
{
  id: "res-tech-6",
  name: "World Computer Exchange",
  category: "Charity Free Services",
  address: "National, National, FL",
  lat: 28.7617,
  lng: -80.8625,
  phone: "",
  website: "https://worldcomputerexchange.org/",
  serviceUrl: "https://worldcomputerexchange.org/get-involved/give-computers/",
  sourceUrl: "https://worldcomputerexchange.org/get-involved/give-computers/",
  description: "Free, secure donation outlet for surplus laptops, desktops, phones, and tablets under seven years old. Prepaid mail-in labels, local drop-off chapters, and business pickup with certified data destruction, asset reports, and tax receipts. Refurbished devices go to schools, nonprofits, and underserved communities.",
  hoursText: "Online 24/7; drop-off hours vary by chapter",
  schedule: {0: [[0, 24]], 1: [[0, 24]], 2: [[0, 24]], 3: [[0, 24]], 4: [[0, 24]], 5: [[0, 24]], 6: [[0, 24]]},
  tags: ["Computer Donation", "ITAD", "Data Destruction", "Tax Receipt", "National"],
  partnerType: "National Nonprofit",
  capacityStatus: "Open & Ready",
  group: "technology",
  services: [],
  county: "Statewide",
  city: "National",
  state: "FL",
  lastVerified: "2026-11-18",
  eligibility: "Individuals, businesses, schools, and nonprofits may donate; recipient organizations are schools, nonprofits, and underserved communities.",
  mobileOnly: true,
},
{
  id: "res-tech-7",
  name: "PCs for People",
  category: "Charity Free Services",
  address: "National, National, FL",
  lat: 28.7617,
  lng: -80.8625,
  phone: "",
  website: "https://www.pcsforpeople.org/",
  serviceUrl: "https://www.pcsforpeople.org/nonprofits/",
  sourceUrl: "https://www.pcsforpeople.org/nonprofits/",
  description: "Low-cost refurbished computers, hotspots, internet, and digital skills support for income-qualified households. Eligible 501(c)(3)s, schools, and community organizations can buy refurbished desktops and laptops online (up to five) or contact partner@pcsforpeople.org for bulk orders. NAID AAA and R2 certified for data destruction and recycling.",
  hoursText: "Online 24/7",
  schedule: {0: [[0, 24]], 1: [[0, 24]], 2: [[0, 24]], 3: [[0, 24]], 4: [[0, 24]], 5: [[0, 24]], 6: [[0, 24]]},
  tags: ["Refurbished Computers", "Low-Cost", "Hotspots", "Nonprofit Discount", "National"],
  partnerType: "National Nonprofit",
  capacityStatus: "Open & Ready",
  group: "technology",
  services: [],
  county: "Statewide",
  city: "National",
  state: "FL",
  lastVerified: "2026-11-18",
  eligibility: "Income-qualified individuals and households; verifying 501(c)(3)s, accredited schools, and eligible community organizations for nonprofit pricing.",
  documents: "Proof of eligibility (benefit enrollment or income) for individuals; 501(c)(3) documentation for organizations.",
  mobileOnly: true,
},

// brevard.ts — append to BREVARD_RESOURCES (confirm the exported array name)
{
  id: "res-tech-brev-1",
  name: "Computers Advancing Education (CAEI)",
  category: "Charity Free Services",
  address: "3000 Jolly Street, Titusville, FL 32780",
  lat: 28.5823559,
  lng: -80.8123260,
  phone: "321-626-9754",
  website: "http://www.computersadvancingeducation.org",
  serviceUrl: "http://www.computersadvancingeducation.org",
  sourceUrl: "http://www.computersadvancingeducation.org",
  description: "All-volunteer Titusville nonprofit that refurbishes donated computers and gives them free to students, schools, nonprofits, and individuals in need. Always seeking donated systems, parts, and partners. Call to confirm current availability — the group reported a funding shortfall for replacement parts in 2025.",
  hoursText: "Call ahead — volunteer-operated",
  schedule: {},
  tags: ["Refurbished Computers", "Free Computers", "Students", "Parts Donation", "Volunteers"],
  partnerType: "Nonprofit",
  capacityStatus: "Call to Confirm",
  group: "technology",
  services: ["Charity"],
  county: "Brevard",
  city: "Titusville",
  state: "FL",
  lastVerified: "2026-11-18",
  eligibility: "Students, schools, nonprofits, and individuals in need; call about current stock.",
},
```

## Tier 2 — partner / supply pipeline (do **not** put in the people-facing directory)

- **TechSoup** is the practical supply channel for your own nonprofit: validated
  members get donated and discounted hardware from Dell, HP, Lenovo, Cisco, and
  Microsoft.[19][20]
  Dell and HP also publish product-specific offer terms there.[5][6]
  You can donate your own working devices under seven years old with prepaid
  labels, pickups, receipts, and data-destruction certificates.[4] Donated
  products go to qualifying organizations, not directly to individuals.[27]
- **Licensing for a refurbishment program:** Microsoft says it has no hardware
  grant program and that refurbishers installing software on donated PCs must
  use its refurbisher programs, not the standard nonprofit grants.[21] The
  Registered Refurbisher program targets small and midsize refurbishers
  supplying qualified charitable organizations; Authorized Refurbisher is for
  high-volume operations.[22] Budget for this before accepting parts.
- **Federal surplus equipment:** 40 U.S.C. § 549a directs eligible surplus
  computers to nonprofit refurbishers for repair and distribution at no cost
  (except shipping) to eligible recipients explicitly including veterans,
  low-income individuals, students, seniors, and people with disabilities.[9]
  Florida's contact is DMS Federal Property Assistance,
  SASPEligibility@dms.fl.gov, 904-964-5601.[7] This is the strongest hardware
  source for a scaled refurbishment program.
- **AI compute / GPUs — no live general program found.** NVIDIA's Academic
  Grant Program offers cloud, hardware, and software grants but is currently
  *not accepting new applications* and requires a full-time faculty member at
  a PhD-granting institution.[8] The Foresight Institute's local-compute RFP
  ($30,000–$100,000 for community-owned clusters) closed 31 October 2026.[23]
  Track both for a future cycle; do not list either as available now. For an
  immediate need, local AI-capable workstations remain the only realistic
  route, paired with TechSoup/Dell/HP channels.[19][20]
- **Digitunity** is a useful coalition contact, not a direct walk-in: it
  connects retired business and government technology to trusted community
  organizations,[2] and an AT&T/Digitunity grant delivered 205 refurbished
  laptops to a Bay Area veteran services nonprofit in August 2026.[25] Its
  member portal was temporarily unavailable when checked.[2]

## Tier 3 — excluded / needs more proof

- **"Through the Trees" is Brevard, North Carolina**, not Brevard County,
  Florida. Its similar name makes it an easy false positive; excluded.[26]
- **Computers with Causes** offers Florida bulk pickup but requires donors to
  pay shipping and has no drop-off sites; only its own page was found, with no
  independent rating retrieved. Verify before listing.[18][unverified]
- **AI GPU / accelerator donations to small nonprofits:** no open program was
  found. Both plausible leads are closed.[8][23] Treat vendor "grant"
  aggregators as leads only; confirm on the funder's own site.

## Northeast Florida / active-duty follow-up (2026-11-18)

The email came from an active-duty Navy member near Jacksonville needing a used
GPU, compatible DDR5 RAM, and three case fans for a CAD/3D modeling build.
Tech For Troops' published eligibility names veterans, Guard, and *transitioning*
active duty, but November 2026 coverage describes it giving laptops to active-duty
military in need, and it runs periodic named giveaway events for military
communities.[24] Treat it as a "call and ask" lead, not a guaranteed application.

**ReUse IT Jax is the best local parts lead.** Its own site describes a Jacksonville
store selling used PCs, phones, cameras, cords, and parts at low prices, with
test-before-you-buy workbenches, free hard-drive shredding and certificates of
destruction, a diagnostic bench, and paid upgrades/installs; it also collects
sign-ups for PC and product giveaways and has an item-request form.[35][36] It is
the reuse division of Sensible Recycling.[35] Call 904-253-3482 before driving —
inventory varies and it is closed Sunday and Monday.[35]

The four URLs asked about:

| Source | Decision | Reason |
|---|---|---|
| reuseitjax.com | **Added** (`res-tech-10`) | Real parts/repair/giveaway channel in Jacksonville; described as retail, not a free handout.[35][36] |
| human-i-t.org | Already listed (`res-tech-3`) | No duplicate. Its old `/clients` service link was dead; updated to the live low-cost-devices page, which also documents Gold discounts for veterans in need.[37] |
| digitunity.org | **Not added** to the people-facing directory | It builds systems and a partner network rather than supplying individuals directly; its member portal was temporarily unavailable when checked, so it belongs on the partners page as a coalition contact.[2] |
| pcsforpeople.org/nonprofits | **Added** (`res-tech-7`) | Low-cost refurbished devices for income-qualified people and eligible nonprofits.[14] |

Also added for the same reader: NMCRS interest-free loans and grants for active-duty
Sailors and Marines,[30][31] Cell Phones For Soldiers' free phones and emergency
funding for active-duty members,[29] and the NAS Jacksonville Fleet and Family
Support Center's financial counseling (904-542-5745).[32][33] Compudopt is listed
as a free-computer resource with an explicit "check local availability" caveat.[28]

Not added: Operation Homefront's Critical Financial Assistance requires dependents
for active-duty E-1–E-6 applicants, so it is a poor fit for a single sailor.[34]

## Implementation

1. Nine entries were appended to the reviewed data files: eight statewide and one
   Brevard. No new `HelpGroup` or UI change is needed.
2. Check each `sourceUrl` again on the day you commit, update `lastVerified`,
   and run `npm run db:seed` so D1 picks them up (the page reads D1 live).
3. On `/partners`, describe Tech For Troops, CAEI, WCE, PCs for People, and
   TechSoup as **prospective** collaborators or supply channels. The page
   currently says there are no formal partnerships; don't imply otherwise.
4. Add the veteran-specific path to `/technology-access` — right now the
   partner list names only Lifeline, PCs for People/refurbishers, libraries,
   and carriers.

## Sources

[1] https://www.techfortroops.org
[2] https://digitunity.org
[3] https://worldcomputerexchange.org/get-involved/give-computers
[4] https://page.techsoup.org/donation
[5] https://www.techsoup.org/dell-details
[6] https://www.techsoup.org/hp-inc-details
[7] https://www.gsa.gov/buy-through-us/government-property-for-sale-or-lease/office-of-personal-property-management/for-state-agencies-and-public-organizations/state-agencies-for-surplus-property-contacts
[8] https://www.nvidia.com/en-us/industries/higher-education-research/academic-grant-program
[9] https://uscode.house.gov/us/usc/119-142/t40/s549a
[10] https://news.va.gov/54889/tech-for-troops
[12] https://business.acceleratebrevard.org/directory/Details/computers-advancing-education-2645087
[13] https://spacecoastdaily.com/2025/08/help-computers-advancing-education-continue-their-mission-to-provide-free-computers-to-space-coast-community
[14] https://www.pcsforpeople.org/nonprofits
[17] https://nrd.gov/resource/detail/21076127/Tech-For-Troops
[18] https://www.computerswithcauses.org/computer-donation-florida
[19] https://www.techsoup.org/computers-and-electronics
[20] https://page.techsoup.org/hardware-no-admin-fees
[21] https://www.microsoft.com/en-us/nonprofits/faq
[22] https://devicepartner.microsoft.com/en-us/communications/comm-microsoft-refurbisher-programs
[23] https://foresight.org/grants/ai-science-safety-nodes-rfp-local-compute
[24] https://www.wric.com/news/veterans-voices/tech-for-troops
[25] https://www.prlog.org/13166755-att-digitunity-help-expand-digital-access-through-laptop-donation-to-open-doors-to-future-possi.html
[26] https://www.ednc.org/brevards-through-the-trees-gives-a-second-life-to-old-devices-and-a-fresh-start-for-neighbors-who-need-them
[27] https://www.techsoup.org/restrictions
[28] https://www.compudopt.org
[29] https://cellphonesforsoldiers.com
[30] https://www.nmcrs.org/get-help/financial-assistance/interest-free-loans-grants
[31] https://www.navy.mil/Press-Office/News-Stories/display-news/Article/2250494/navy-marine-corps-relief-society
[32] https://cnrse.cnic.navy.mil/Installations/NAS-Jacksonville/Fleet-and-Family-Readiness/Support-Services
[33] https://installations.militaryonesource.mil/military-installation/naval-air-station-jacksonville/military-and-family-support-center/financial-assistance
[34] https://operationhomefront.org/cfa-eligibility
[35] https://www.reuseitjax.com
[36] https://www.reuseitjax.com/item-request
[37] https://www.human-i-t.org/low-cost-devices
