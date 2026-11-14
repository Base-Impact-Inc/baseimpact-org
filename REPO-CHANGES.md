# Base Impact — Required Repo Changes for Funding Readiness & Site Quality

## 🎯 Priority 1: Fix Critical Bugs (Blocks Core Features)

### 1.1 Directory Page 500 Error in Dev (Astro v6 Runtime)
**File:** `src/pages/directory.astro` (lines 22-28)
**Issue:** `Astro.locals.runtime.env` removed in Astro v6
**Fix:** Use Cloudflare Workers native `env` import

```astro
---
// REPLACE lines 22-28:
import { env } from 'cloudflare:workers';
// Use env.baseimpact_verify directly
const d1 = env?.baseimpact_verify;
let resources: ProcessedResource[] = [];

if (d1 && typeof d1.prepare === 'function') {
  const result = await d1.prepare('SELECT * FROM resources ORDER BY name ASC').all();
  // ... rest of processing
}
---
```

### 1.2 Contrast Bugs (WCAG AA Failures — 1.0:1)
**Files:** `/donate`, `/programs`, `/technology-access` pages
**Issue:** Text color `#133621` on background `#133621` = invisible
**Fix:** Audit all text/background combinations in `src/styles/global.css`

```css
/* In global.css — find and fix: */
.text-body { color: var(--color-body); }  /* Ensure --color-body ≠ --color-page */
/* Add explicit contrast-safe utilities: */
.contrast-safe { color: var(--color-body); background: var(--color-page); }
```

### 1.3 Missing Pages
- **Create:** `src/pages/search.astro` — Search results page for directory
- **Create:** `src/pages/404.astro` — Custom not-found page

---

## 🎯 Priority 2: OSS Funding Readiness (Required for Applications)

### 2.1 License & Contribution Files (Root)
**Create/Verify:**
```bash
# MIT License (already in repo? verify)
LICENSE.md

# Contributing guide
CONTRIBUTING.md

# Code of Conduct
CODE_OF_CONDUCT.md  # Use Contributor Covenant v2.1

# Security Policy
SECURITY.md

# Funding.yml (for GitHub Sponsors)
.github/FUNDING.yml
```

**`.github/FUNDING.yml`:**
```yaml
# GitHub Sponsors / Open Collective
open_collective: baseimpact
github: [YOUR-USERNAME]
custom: ["https://opencollective.com/baseimpact", "https://baseimpact.org/donate"]
```

### 2.2 Repository Metadata
**Update `package.json`:**
```json
{
  "name": "baseimpact-org",
  "description": "Open-source crisis resource directory & nonprofit tech platform for Brevard/Volusia/Orange counties, FL",
  "keywords": [
    "nonprofit",
    "crisis-resources",
    "resource-directory",
    "community-tech",
    "digital-inclusion",
    "astro",
    "cloudflare-workers"
  ],
  "homepage": "https://baseimpact.org",
  "repository": {
    "type": "git",
    "url": "https://github.com/[YOUR-USERNAME]/baseimpact-org.git"
  },
  "bugs": {
    "url": "https://github.com/[YOUR-USERNAME]/baseimpact-org/issues"
  },
  "license": "MIT",
  "author": "Base Impact, Inc.",
  "funding": "https://opencollective.com/baseimpact"
}
```

### 2.3 GitHub Repository Settings (Manual)
- [ ] **Description:** "Open-source crisis resource directory & nonprofit tech platform for Brevard/Volusia/Orange counties, FL"
- [ ] **Website:** `https://baseimpact.org`
- [ ] **Topics:** `nonprofit`, `crisis-resources`, `resource-directory`, `community-tech`, `digital-inclusion`, `astro`, `cloudflare-workers`, `florida`, `brevard-county`
- [ ] **License:** MIT (auto-detected from LICENSE.md)
- [ ] **Enable:** Issues, Wiki, Discussions, Projects
- [ ] **Branch Protection:** `main` — require PR reviews, status checks
- [ ] **Social Preview Image:** Upload `public/og-image.png` (1200x630)

### 2.4 Issue Templates (`.github/ISSUE_TEMPLATE/`)
```
bug_report.md
feature_request.md
resource_update.md       # For "report issue" on directory cards
partner_onboarding.md    # For new nonprofit partners
translation_request.md   # For multilingual needs
```

### 2.5 PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## Description
## Type: [ ] Bug [ ] Feature [ ] Docs [ ] Refactor [ ] Translation
## Testing: [ ] Manual [ ] Unit [ ] Integration [ ] Accessibility
## Screenshots (if UI):
## Related Issue: #
## Checklist:
- [ ] Lint passes (`npm run astro check`)
- [ ] Build passes (`npm run build`)
- [ ] No contrast regressions
- [ ] Mobile tested
- [ ] Spanish locale updated (if content changed)
```

---

## 🎯 Priority 3: OSS Maintainer Signal (Boosts Eligibility)

### 3.1 Add External Contributors (This Week)
```bash
# Ask 3 people to submit small PRs:
1. Fix typo in Spanish translations
2. Add one resource to brevard.ts
3. Update README with deployment instructions
4. Add 404.astro page
5. Fix contrast bug on one page
```
**Goal:** 3+ merged PRs from external contributors in last 90 days

### 3.2 Publish NPM Package (Dependent Repos Signal)
**Create:** `packages/baseimpact-resources/` — reusable resource directory logic
```json
{
  "name": "@baseimpact/resources",
  "version": "0.1.0",
  "description": "Resource directory types, logic, and data for Base Impact",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "license": "MIT",
  "repository": "https://github.com/[YOUR-USERNAME]/baseimpact-org",
  "publishConfig": { "access": "public" }
}
```
**Exports:** `types.ts`, `logic.ts`, `links.ts`, county data files
**Use:** Other communities `npm i @baseimpact/resources` → configure counties → deploy

### 3.3 GitHub Actions (CI/CD Visibility)
**Create:** `.github/workflows/ci.yml`
```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run astro check
      - run: npm run build
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx @axe-core/cli http://localhost:4321 --dir dist --save
```

---

## 🎯 Priority 4: Website Improvements (From Design Audit)

### 4.1 Navigation Simplification (12+ items → 4 groups)
**File:** `src/components/nav.tsx` / `src/layouts/Base.astro`
**New Structure:**
```
[Logo]  [Find Help]  [Programs]  [Volunteer]  [Donate]  [About]  [Support]  [211 Button]
         ↓              ↓           ↓           ↓         ↓        ↓        ↓
      Directory    Tech Access   Volunteer   Donate    About    Privacy  Crisis CTA
      Guide        Digital Skills  Signup    Ways to   Contact  Terms    (always visible)
      Crisis       Nonprofit Tech  Stories   Help      Financials
      211/988
```

### 4.2 Floating "Get Help Now" CTA
**Create:** `src/components/CrisisCTA.astro`
```astro
---
---\<style>
  .crisis-cta {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 100;
    display: none;
  }
  .crisis-cta.visible { display: flex; }
  @media (prefers-reduced-motion: reduce) {
    .crisis-cta { transition: none; }
  }
</style>
<a href="tel:211" class="crisis-cta rounded-full bg-gold p-3 shadow-lg hover:scale-105 transition-transform" aria-label="Call 211 for immediate help">
  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
</a>
<script>
  window.addEventListener('scroll', () => {
    document.querySelector('.crisis-cta').classList.toggle('visible', window.scrollY > 400);
  });
</script>
```

### 4.3 Search Page (`src/pages/search.astro`)
- Receives query params from directory
- Server-side filters resources
- Returns paginated results
- SEO-friendly URLs: `/search?q=food&zip=32904&radius=10`

### 4.4 Photo Integration (7 Identified Photos)
**Copy from:** `/home/eric/Pictures/Photos for BaseImpact/`
**To:** `public/assets/photos/`
**Update:** Impact story frontmatter with `image: '/assets/photos/filename.jpg'`

---

## 🎯 Priority 5: Multilingual & Accessibility

### 5.1 Spanish Locale Completeness
- [ ] All directory strings translated
- [ ] All impact stories have Spanish versions
- [ ] All program pages have `/es/` equivalents
- [ ] `src/data/spanish-translations.ts` covers 100% of UI strings

### 5.2 Haitian Creole / Portuguese (Post-Cohere Grant)
- [ ] Add `ht/` and `pt/` locales (Astro i18n)
- [ ] Translate top 20 resources + crisis CTAs first
- [ ] Use Cohere grant to fund professional translation

### 5.3 WCAG AA Checklist
- [ ] Contrast ≥ 4.5:1 all text (fix 1.0:1 bugs first)
- [ ] Focus visible on all interactive elements
- [ ] Skip link at top of page
- [ ] ARIA labels on all icon-only buttons
- [ ] `prefers-reduced-motion` respected (disable parallax, stagger)
- [ ] Touch targets ≥ 44×44px
- [ ] Form labels associated with inputs

---

## 🎯 Priority 6: Analytics & Impact Measurement

### 6.1 Privacy-First Analytics
**Replace/augment:** Cloudflare Web Analytics (already free, no cookies)
**Add:** Custom events for:
```javascript
// Directory interactions
'resource_viewed', 'resource_called', 'resource_mapped', 'resource_saved', 'resource_reported'
'filter_changed', 'radius_changed', 'view_toggled', 'search_submitted'
// Crisis CTA
'crisis_cta_clicked', 'crisis_cta_shown'
// Impact
'story_read', 'story_shared', 'donate_clicked', 'volunteer_clicked'
```

### 6.2 Impact Dashboard (Internal)
**Create:** `/admin/impact` (password-protected Cloudflare Worker)
- Directory visits by ZIP code
- Resources viewed/called/mapped
- Crisis CTA clicks
- Stories read
- Partner resource updates submitted

---

## 📋 IMPLEMENTATION ORDER (Next 2 Weeks)

| Week | Day | Task | Files |
|------|-----|------|-------|
| 1 | Mon | Fix directory 500 error | `directory.astro` |
| 1 | Mon | Fix contrast bugs | `global.css`, affected pages |
| 1 | Tue | Create 404.astro, search.astro | New pages |
| 1 | Wed | Add LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, FUNDING.yml | Root + `.github/` |
| 1 | Thu | Update package.json metadata, GitHub repo settings | `package.json`, GitHub UI |
| 1 | Fri | Create issue/PR templates, CI workflow | `.github/` |
| 2 | Mon | Floating Crisis CTA component | New component + Base layout |
| 2 | Tue | Navigation restructuring | `nav.tsx`, `Base.astro` |
| 2 | Wed | Photo integration + story updates | `public/assets/photos/`, story frontmatter |
| 2 | Thu | Spanish locale audit + gaps | `spanish-translations.ts`, all pages |
| 2 | Fri | External contributor PRs (3 people) | Coordinate with partners |

---

## 🔗 QUICK COMMANDS

```bash
# 1. Create legal folder structure
mkdir -p /home/eric/projects/baseimpact-org/legal/{incorporation,ein,fdacs,bank,governance/{board-resolutions,directors,meeting-minutes},501c3-application,fiscal-sponsorship,insurance,compliance}

# 2. Create GitHub templates
mkdir -p /home/eric/projects/baseimpact-org/.github/{ISSUE_TEMPLATE,workflows}

# 3. Fix directory.astro runtime issue
# Edit lines 22-28 to use: import { env } from 'cloudflare:workers';

# 4. Run build to verify
cd /home/eric/projects/baseimpact-org && npm run build

# 5. Check accessibility
npx @axe-core/cli http://localhost:4321 --dir dist

# 6. Deploy preview
wrangler pages deploy dist --project-name=baseimpact-staging
```

---

## ✅ FUNDING APPLICATION CHECKLIST (Repo Signals)

| Signal | Required For | Status | Action |
|--------|--------------|--------|--------|
| MIT License | All OSS programs | ✅ | Verify `LICENSE.md` exists |
| Public repo | All OSS programs | ✅ | GitHub public |
| Recent commits (30 days) | Codex, [PERSON_NAME], Copilot | ✅ | Keep active |
| External contributors (90 days) | [PERSON_NAME] (20+), Copilot | ❌ | Recruit 3 PRs this week |
| Dependent repos/packages | [PERSON_NAME] (500+ deps) | ❌ | Publish `@baseimpact/resources` |
| Stars/Forks | General visibility | Current: check | Ask partners to star |
| CI/CD passing | Professional signal | ❌ | Add GitHub Actions |
| Issue templates | Community health | ❌ | Add templates |
| Code of Conduct | [PERSON_NAME], Mozilla, NLnet | ❌ | Add Contributor Covenant |
| Security Policy | [PERSON_NAME], OpenSSF | ❌ | Add SECURITY.md |
| Funding.yml | GitHub Sponsors | ❌ | Add to `.github/` |

---

## 🎯 YOUR NEXT ACTIONS (Priority Order)

1. **TODAY**: Fix `directory.astro` runtime import (blocks dev)
2. **TODAY**: Fix contrast bugs on `/donate`, `/programs`, `/technology-access`
3. **TODAY**: Create `legal/` folder, scan existing docs
4. **THIS WEEK**: Apply to Open Collective Foundation (fiscal sponsor)
5. **THIS WEEK**: File Form 1023-EZ ($275)
6. **THIS WEEK**: Submit Codex for OSS + [PERSON_NAME] for OSS applications
7. **THIS WEEK**: Recruit 3 external PRs (ask Rock Church, CoC, dev friends)
8. **THIS WEEK**: Add GitHub templates, CI, Funding.yml
9. **NEXT WEEK**: Navigation restructure + Crisis CTA + Search page
10. **NEXT WEEK**: Photo integration + Spanish audit
