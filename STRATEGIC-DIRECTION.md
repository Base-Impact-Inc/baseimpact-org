# Base Impact — Strategic Direction: Website, Purpose & Community Gap Analysis

## 🎯 Current State Assessment

### What's Working (Keep & Amplify)
| Asset | Evidence | Strategic Value |
|-------|----------|-----------------|
| **Verified directory** | 115+ resources, GPS distance sort, category filter | Core product — crisis users' primary need |
| **Impact stories** | 14 documented, photos, real names, GoFundMe links | Social proof, donor motivation, SEO content |
| **Four pillars** | Tech access, digital skills, nonprofit tech, resource guide | Clear program structure, fundable |
| **Brevard CoC membership** | Official coalition partner | Credibility, referral network, grant eligibility |
| **Rock Church partnership** | House rebuilds, warehouse racking, volunteer base | Trusted community anchor, volunteer pipeline |
| **MIT-licensed OSS** | Forkable, deployable by any community | Scalable model, grant-eligible (Mozilla, NLnet) |
| **Bilingual (EN/ES)** | Full `/es/` locale | Serves 12% Spanish-speaking population |

### Critical Gaps (Fix First)
| Gap | Impact | Effort |
|-----|--------|--------|
| **No 501(c)(3) determination** | Blocks tax-deductible donations, most grants | File 1023-EZ ($275, 4 weeks) |
| **No fiscal sponsor** | Blocks immediate tax-deductible donations | Apply Open Collective Foundation (2-4 weeks) |
| **Directory 500 error in dev** | Blocks development, testing | Fix Astro v6 runtime import (30 min) |
| **Contrast bugs (1.0:1)** | Invisible text on key pages | Fix CSS variables (1 hr) |
| **No search page** | Users can't search directory | Create `search.astro` (half day) |
| **No 404 page** | Dead ends, poor UX | Create `404.astro` (1 hr) |
| **No analytics** | Can't measure impact, report to funders | Add Cloudflare Web Analytics + custom events |

---

## 🔍 Community Gap Analysis (Brevard/Volusia/Orange)

### Unmet Needs Discovered Through Work
| Need | Evidence | Current Solutions | Gap |
|------|----------|-------------------|-----|
| **Offline resource access** | Hurricanes, homelessness, no data plans | 211 (voice only), paper lists | **Digital offline-first directory** |
| **Multilingual (HT/PT)** | 3% Haitian Creole, 1% Portuguese | English/Spanish only | **Aya/Cohere translation pipeline** |
| **Nonprofit tech support** | 5+ orgs asked for help, no budget | Ad hoc volunteers | **Structured program: device setup, security, training** |
| **Grant writing capacity** | Micro-nonprofits can't afford writers | None locally | **AI-assisted grant toolkit** |
| **Digital skills for seniors** | Veterans, elderly neighbors struggling | Library classes (limited) | **One-on-one coaching program** |
| **Device access** | Neighbors need phones/laptops for benefits, jobs | Ad hoc donations | **Refurbishment pipeline + distribution** |
| **Crisis navigation** | "Where do I go *right now*?" | 211, but no visual directory | **Mobile-first "Get Help Now" flow** |

### Competitive Landscape
| Provider | Coverage | Gap |
|----------|----------|-----|
| **211 / [ADDRESS]** | Region-wide | Voice only, no visual map, no offline, no multilingual |
| **[PERSON_NAME] / [PERSON_NAME]** | National | Not hyperlocal, paywalled, not crisis-optimized |
| **County websites** | Brevard/Volusia/Orange | Outdated, not mobile-first, no distance sort |
| **Church/pantry sites** | Individual orgs | Siloed, no unified search, no tech program |

**Base Impact's Unique Position:** Hyperlocal + verified + offline-capable + nonprofit tech program + open-source replicable

---

## 🎯 Refined Purpose Statement

### Current (from PRODUCT.md)
> "Connect people with food, shelter, showers, and essentials (a local, verified resource directory), and keep small nonprofits' technology working so they can serve."

### Sharpened (for grants, website, pitch)
> **Base Impact builds open-source digital infrastructure that helps hyperlocal communities solve their own crisis resource gaps — starting with a verified, offline-capable directory and nonprofit technology capacity program in Brevard/Volusia/Orange counties, Florida.**

**Three Pillars (Equal Priority):**
1. **Crisis Resource Directory** — Verified, GPS-sorted, offline-first, multilingual
2. **Nonprofit Technology Capacity** — Free devices, digital skills, security for 1-5 person orgs
3. **Open-Source Replication** — MIT-licensed platform any community can fork, configure, deploy

---

## 🌐 Website Strategy: From "Directory Site" to "Platform Site"

### Current IA (12+ Nav Items — Too Many)
```
Resource Directory, Technology Access, Resource Guide, Crisis Help (211), About, Our Purpose, Impact, Partners, Financials, Grants & Funding, Join Us, How to Help, Donate, Stories
```

### Target IA (4 Primary + Crisis CTA)
```
[Logo]  [Find Help]  [Programs]  [Volunteer]  [Donate]  [About]  [Support]  [211 Button]
         ↓              ↓           ↓           ↓         ↓        ↓        ↓
      Directory    Tech Access   Volunteer   Donate    About    Privacy  Crisis CTA
      Guide        Digital Skills  Signup    Ways to   Contact  Terms    (always visible)
      Crisis       Nonprofit Tech  Stories   Help      Financials
      211/988
```

### Page-Level Strategy

| Page | Current | Target | Key Changes |
|------|---------|--------|-------------|
| **`/` Home** | Generic hero, stats, pillars | **Crisis-first landing**: "Help." → Find resources → Call 211 | Hero = search + 211; stats strip; pillars below fold |
| **`/directory`** | Working but 500 in dev | **Core product**: Search → Map → List → Save → Report | Fix 500; add search page; pagination; clusters; offline banner |
| **`/programs`** | Four pillars listed | **Program detail pages**: Each pillar = landing + apply/partner | Split into 4 subpages; add "Request Help" forms |
| **`/technology-access`** | Basic content | **Nonprofit Tech Program**: Device grant, digital skills, security audit | Add intake form; partner testimonials; impact metrics |
| **`/impact`** | Story list | **Impact dashboard**: Stories + metrics + partner logos | Filter by category; metrics counters; "Share Your Story" CTA |
| **`/donate`** | Zeffy embed | **Funding transparency**: 501c3 status, fiscal sponsor, programs funded | Progress bars; recurring options; corporate sponsorship tier |
| **`/about`** | Mission + team | **Credibility page**: Board, financials, 501c3 status, partners, press | Add fiscal sponsor badge; 1023-EZ timeline; annual report |
| **`/grants`** | New page | **Grant-seeking hub**: Open grants, application help, AI toolkit | **Unique value prop** — AI-assisted grant writing for micro-nonprofits |

### New Pages to Create
1. **`/search`** — Search results (SEO-friendly URLs)
2. **`/404`** — Helpful not-found with directory search
3. **`/offline`** — PWA offline page with cached resources
4. **`/admin/impact`** — Internal dashboard (password-protected)
5. **`/programs/tech-access`** — Nonprofit tech program detail
6. **`/programs/digital-skills`** — Digital skills coaching detail
7. **`/programs/nonprofit-tech`** — Nonprofit tech support detail
8. **`/programs/resource-guide`** — Directory methodology + partner onboarding
9. **`/grants/ai-toolkit`** — AI-assisted grant writing (open-source tool)

---

## 🤝 Partnership Strategy (Fill the Gaps)

### Tier 1: Formal Partners (MOUs This Quarter)
| Partner | What They Bring | What We Bring | Joint Output |
|---------|----------------|---------------|--------------|
| **Brevard Homeless CoC** | Referral network, HMIS data, funding access | Directory platform, tech support | CoC-integrated resource referrals |
| **Rock Church** | Volunteers, warehouse, distribution, trust | Tech support, directory management | Volunteer tech squad + resource updates |
| **Feeding Florida / Local Pantries** | Food resource data, distribution sites | Verified directory listings, tech help | Real-time food availability map |
| **Brevard County Libraries** | Digital literacy classes, computer labs | Curriculum, devices, 1:1 coaching | Expanded digital skills program |
| **CareerSource Brevard** | Job seekers, employer connections | Digital skills for job applications | Integrated workforce + digital skills |

### Tier 2: Technical Partners (In-Kind)
| Partner | Ask | Offer |
|---------|-----|-------|
| **Cloudflare** | Workers/D1 credits, Pages | Case study, open-source showcase |
| **GitHub** | Copilot, Actions minutes | Open-source nonprofit showcase |
| **OpenRouter / NVIDIA** | Nemotron access | Feedback, benchmarks, blog |
| **Cohere** | Multilingual API credits | Translation pipeline open-source |
| **Lambda Labs** | GPU credits for fine-tuning | Offline LLM research publication |

### Tier 3: Funding Partners (Grants/Sponsorships)
| Target | Program | Amount | Timeline |
|--------|---------|--------|----------|
| **Mozilla Builders** | Local AI / Open Source | $50-100K | Next cohort (watch builders.mozilla.org) |
| **NLnet Foundation** | NGI Zero / Restack | €5-50K | Rolling (3rd of odd months) |
| **OpenAI Researcher Access** | API credits | $1K | Dec 2024 cycle |
| **Cohere Catalyst** | Multilingual API | Project-sized | Rolling |
| **Lambda Research** | GPU credits | $5K | Rolling |
| **Local: Community Foundation of Brevard** | Capacity building | $5-25K | Quarterly cycles |
| **Corporate: L3Harris, Northrop, Health First** | Employee matching, sponsorship | $5-50K | Relationship-based |

---

## 📈 90-Day Strategic Roadmap

### Month 1: Foundation & Funding (Weeks 1-4)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | **Legal/Compliance** | Legal folder created; docs scanned; bylaws adopted; COI signed; board resolutions |
| 1 | **Critical Fixes** | Directory 500 fixed; contrast bugs fixed; 404/search pages created |
| 2 | **Fiscal Sponsorship** | Open Collective Foundation application submitted |
| 2 | **501(c)(3)** | Form 1023-EZ filed ($275) |
| 2 | **OSS Applications** | Codex for OSS, [PERSON_NAME] for OSS, GitHub Copilot submitted |
| 3 | **Research Grants** | OpenAI Researcher Access, Cohere Catalyst, Lambda Research submitted |
| 3 | **Repo Readiness** | LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, FUNDING.yml, CI, templates |
| 4 | **External Contributors** | 3+ PRs merged from partners/friends |
| 4 | **Analytics** | Cloudflare Web Analytics + custom events deployed |

### Month 2: Product & Partnerships (Weeks 5-8)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 5 | **Navigation Restructure** | New IA deployed; Crisis CTA floating; mobile tested |
| 5 | **Photo Integration** | 7 identified photos on stories; alt text; WebP |
| 6 | **Spanish Audit** | 100% UI strings translated; story translations started |
| 6 | **Partner MOUs** | CoC, Rock Church, 2 pantries signed |
| 7 | **Program Pages** | 4 program subpages live with intake forms |
| 7 | **Grant Hub** | `/grants` page with AI toolkit preview |
| 8 | **PWA/Offline** | Service worker; cached resources; offline page |

### Month 3: Scale & Replicate (Weeks 9-12)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 9 | **Multilingual v2** | Haitian Creole (top 20 resources); Portuguese started |
| 9 | **NPM Package** | `@baseimpact/resources` published |
| 10 | **Replication Docs** | "Fork & Deploy" guide; county config schema |
| 10 | **Mozilla/NLnet Apps** | Submit if cohorts open |
| 11 | **Impact Report** | Q1 metrics: visits, calls, reports, stories, nonprofits served |
| 12 | **Board Review** | Strategic plan update; budget vs actual; next quarter OKRs |

---

## 🎯 Success Metrics (Quarterly)

| Metric | Baseline | Q1 Target | Q2 Target | Q3 Target |
|--------|----------|-----------|-----------|-----------|
| **Directory visits/mo** | ~X | 2,000 | 5,000 | 10,000 |
| **Resource calls clicked** | ~X | 500 | 1,500 | 3,000 |
| **Crisis CTA clicks** | 0 | 200 | 500 | 1,000 |
| **Impact stories published** | 14 | 20 | 30 | 45 |
| **Nonprofits tech-supported** | 5 | 10 | 20 | 35 |
| **Devices distributed** | ~X | 10 | 30 | 60 |
| **Digital skills sessions** | ~X | 20 | 50 | 100 |
| **External OSS contributors** | 0 | 3 | 8 | 15 |
| **Dependent repos/packages** | 0 | 1 (NPM) | 3 | 10 |
| **Grant applications submitted** | 0 | 8 | 15 | 25 |
| **Funding secured** | $0 | $15K | $50K | $150K |
| **501(c)(3) status** | Pending | Submitted | Approved | Active |
| **Fiscal sponsor** | None | Active | Active | Active |

---

## 💡 Pivot/Improvement Opportunities

### If Directory Growth Stalls
- **Pivot:** Partner with 211 as their visual directory layer
- **Pivot:** White-label for county governments
- **Pivot:** Focus entirely on nonprofit tech program (higher willingness to pay)

### If Funding Stalls
- **Pivot:** Fee-for-service tech support to nonprofits ($500-2K/project)
- **Pivot:** Grant writing services using AI toolkit ($1-3K/grant)
- **Pivot:** Corporate sponsorship packages (employee volunteer days + tech)

### If Technical Debt Grows
- **Pivot:** Migrate to Next.js + Vercel + Postgres (larger dev pool)
- **Pivot:** Keep Astro but add headless CMS (Sanity/Contentful) for non-technical edits
- **Pivot:** Build mobile app (React Native / Expo) for offline-first

### Community Feedback Loops (Monthly)
1. **Partner check-in** (Rock Church, CoC, pantries) — 30 min each
2. **Neighbor intercept** — 5 min surveys at resource sites
3. **Volunteer retrospective** — What's working/broken in tech program
4. **Metrics review** — Dashboard + qualitative stories

---

## 🔗 Quick Reference: Strategic Documents Created

| Document | Purpose | Location |
|----------|---------|----------|
| `LEGAL-DOCS-README.md` | Legal folder structure, 501c3 checklist | `/home/eric/projects/baseimpact-org/` |
| `APPLICATIONS-DRAFT.md` | 10 funding applications ready to customize | `/home/eric/projects/baseimpact-org/` |
| `REPO-CHANGES.md` | 50+ repo fixes for funding readiness | `/home/eric/projects/baseimpact-org/` |
| `BETTER-MODELS.md` | Ollama + OpenRouter model upgrade guide | `/home/eric/projects/baseimpact-org/` |
| `STRATEGIC-DIRECTION.md` | This document — website, purpose, gaps | `/home/eric/projects/baseimpact-org/` |

---

## 🎯 Your Immediate Next Actions (Priority Order)

### Today (2 hours)
1. **Fix `directory.astro`** — Change runtime import to `import { env } from 'cloudflare:workers'`
2. **Fix contrast bugs** — Edit `src/styles/global.css` for `/donate`, `/programs`, `/technology-access`
3. **Create legal folder** — `mkdir -p legal/{incorporation,ein,fdacs,bank,governance/{board-resolutions,directors,meeting-minutes},501c3-application,fiscal-sponsorship,insurance,compliance}`
4. **Scan existing docs** — EIN letter, Articles, FDACS, bank confirmation into legal folder

### This Week (10 hours)
5. **Apply Open Collective Foundation** — Fiscal sponsor (unlocks tax-deductible NOW)
6. **File Form 1023-EZ** — $275, 4-week timeline
7. **Submit Codex for OSS + [PERSON_NAME] for OSS** — Use drafted applications
8. **Add GitHub templates** — LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, FUNDING.yml, CI
9. **Recruit 3 external PRs** — Ask Rock Church contact, CoC staff, dev friend
10. **Pull better models** — Run `ollama pull deepseek-coder-v2:16b nemotron3:8b aya:8b mxbai-embed-large`

### Next Week (8 hours)
11. **Navigation restructure** — New IA, Crisis CTA component
12. **Photo integration** — Copy 7 photos, update story frontmatter
13. **Spanish audit** — Check all UI strings in `spanish-translations.ts`
14. **Submit research grants** — OpenAI Researcher, Cohere Catalyst, Lambda Research
15. **Create search.astro + 404.astro** — Deploy and test

---

## 💬 Need Help With Any of These?

I can:
- **Draft specific files** (bylaws, board resolutions, CONTRIBUTING.md, CI workflow)
- **Review your GitHub repo** for OSS signal gaps before applications
- **Run impeccable audit** on staging deployment before launch
- **Create pull-model.sh** script and verify pulls
- **Design the Crisis CTA component** with proper accessibility
- **Write the "Fork & Deploy" replication guide**

Just say which one saves you the most time this week.
