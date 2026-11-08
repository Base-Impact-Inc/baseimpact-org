# Base Impact — Impact Log

Living document tracking all projects, people helped, and events. Updated as new stories are documented.

## Documented Impact Stories (on website)

| # | Title | Date | Category | Source File |
|---|-------|------|----------|-------------|
| 1 | Reloading a Laptop for a War Veteran | 2026-10-15 | Impact Stories | `src/content/posts/reloading-laptop-war-veteran.md` |
| 2 | Helping a New Florida Resident Find Work | 2026-10-20 | Impact Stories | `src/content/posts/helping-new-florida-resident-find-work.md` |
| 3 | Helping Travelers in Florida Heat | 2026-08-15 | Impact Stories | `src/content/posts/helping-travelers-florida-heat.md` |
| 4 | Moving 80+ Year-Old Neighbor Into New Home | 2026-10-27 | Impact Stories | `src/content/posts/moving-elderly-neighbor-new-home.md` |
| 5 | Donated 2XL Jackets | 2026-11-01 | Community News | `src/content/posts/donated-2xl-jackets.md` |
| 6 | Community Technology Day (photo) | 2026-10-15 | Photos | `src/content/photos/first-community-event.md` |
| 7 | Cold-Night Shelter Supply Drive (event) | 2026-11-15 | Events | `src/content/events/cold-weather-supply-drive.md` |

## Pending / Undocumented Stories (need to be added)

| # | Story | Date | Notes | Status |
|---|-------|------|-------|--------|
| 8 | Internet bill fund assistance (published news story) | 2026-10-21 | Drafted (draft: true) — needs news article link + consent | Needs post + link to news article |
| 9 | Family seeking shelter/rent funds | 2026-10-20 | Drafted (draft: true) — privacy, get consent before publishing | Needs post when appropriate (privacy) |
| 10 | Cold weather shelter training | 2026-09-19 | Drafted (draft: false) — photos ready (IMG20260919110829) | Needs photo gallery post |
| 11 | Nonprofit warehouse storage racking build | 2026-09-17 | Drafted (draft: false) — photos ready (IMG20260917121740) | Needs photo gallery post |
| 12 | Brevard Homeless CoC coalition meeting (membership) | 2026-10-29 | Drafted (draft: true) — photos ready (IMG20261029140358, Titusville) | Needs post + consent check |
| 13 | Rock Church house rebuild (loss of family member) | 2026-09-24 | Drafted (draft: true) — photos ready (IMG20260924105719) | Needs post + consent check |

## Design & Web Improvement Tracking

### Repos/Skills Installed for Design Improvement
| Skill | Source | Status | Purpose |
|-------|--------|--------|---------|
| impeccable | official (Hermes) | Installed | Design vocabulary, catch AI slop, critique/audit/polish |
| animate | emilkowalski (skills.sh) | Installed | Animation from scratch |
| animation-performance | emilkowalski (skills.sh) | Installed | Fix janky animations |
| taste (senlindesign) | Manual clone | Installed | Extract design DNA from reference sites |
| taste-leonxlnx | Manual clone | Installed | Build pro company sites, browser checker |
| design-taste-frontend | local | Installed | Anti-slop frontend skill (tasteskill v2) |
| popular-web-designs | builtin | Installed | 54 real design systems reference |
| design-standard | local | Installed | Design guardrails |
| theme-system | local | Installed | Multi-theme light/dark WCAG AA |
| sketch | local | Installed | Throwaway mockups |
| design-md | official | Installed | Google DESIGN.md token spec |
| awesome-design-md | local | Installed | Real brand DESIGN.md references |
| gsap-slide-in-reveal | local | Installed | GSAP scroll animations |

### Ranked Design Improvements (Base Impact site)
1. Add hero/community photography (high impact, low effort)
2. Enable search on resource directory (high impact, medium effort)
3. Replace vanity stat "100% Community Focused" (medium impact, low effort)
4. Add "Get Help Now" floating CTA for crisis visitors (high impact, low effort)
5. Move Donate/Volunteer CTAs above the fold (high impact, low effort)
6. Choose brand color beyond default Tailwind blue (medium impact, low effort)
7. Enable dark mode (fix contrast bugs first) (medium impact, medium effort)
8. Group navigation (12+ items → 4 groups) (medium impact, low effort)
9. Add photo gallery for undocumented stories (medium impact, medium effort)
10. Add impact counter/metrics dashboard (low impact, high effort)

### Dev-Server Audit (impeccable detect, 2026-11-07)

Full URL scan run against `npm run dev` (http://localhost:4321). Page-level rules (contrast, tiny text, line length) ran; regex-only file scan had undercounted.

**Critical (blocks core feature):**
- `/directory` → HTTP 500: `Astro.locals.runtime.env` removed in Astro v6; directory.astro:7 reads D1 via `runtime?.env?.baseimpact_verify`. Fix: use `import { env } from 'cloudflare:workers'` (Astro v6 pattern) or guard with fallback. This breaks the site's core interactive surface in dev.

**Script errors (every page):**
- Vite ErrorOverlay: `Uncaught TypeError: Cannot read properties of undefined (reading 'name')` at `@vite/client:1507:26` — Vite dev overlay failing to render the directory error. Resolves once directory is fixed.
- Cloudflare Turnstile 110200 on /contact and /technology-access (Turnstile config issue in dev).

**Accessibility (WCAG AA failures):**
- `low-contrast 1.0:1` (text #133621 on #133621) on /donate, /programs, /technology-access — text rendered on same color = invisible text. Must fix before enabling dark mode.
- `line-length` (~86-173 chars) on /donate, /about, /programs, /technology-access — add max-width 65-75ch.

**Advisory (not failures):**
- `bounce-easing` cubic-bezier(0.34, 1.35, 0.64, 1) on global.css:301 (all pages) — replace with exponential easing.
- `em-dash-overuse` 56 on /about, 9 on /technology-access — reduce em-dash saturation.
- `straggler` single-word last lines on /donate, /about — set text-wrap: pretty.

**Missing pages vs template (baseimpact-geeky):**
- No `search.astro` (directory has no search results page) — aligns with ranked improvement #2.
- No `404.astro` (no custom not-found page).

### Additional Design Skills Discovered
| Skill | Source | Purpose |
|-------|--------|---------|
| design-taste-frontend | .agents/skills | Anti-slop frontend (tasteskill) |
| frontend-design | .agents/skills | Frontend design craft |
| web-perf | .agents/skills | Web performance |
| popular-web-designs | builtin Hermes | 54 real design systems reference |

### Notes
- Base Impact uses Astro 6.2.1 on Cloudflare Workers
- Template origin: "Geeky Astro" (personal blog template, adapted)
- Dark mode previously had 1.00 contrast ratio bug (fixed in recent upgrade?)
- Product context: `PRODUCT.md` in project root
- Impeccable critique run: 2026-11-07
