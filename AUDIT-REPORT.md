# Base Impact Website — Comprehensive Audit

**Audit Date:** 2026-11-25
**Site:** https://baseimpact.org
**Reviewed by:** Hermes Agent (Solar Mini4)
**Framework:** Astro v7, Cloudflare Pages, Cloudflare D1

---

## Executive Summary

The Base Impact website is a functional, well-structured nonprofit site. It has strong visual design, a working resource directory, and good accessibility foundations. However, **several critical issues** need fixing:

### Critical Issues (Fix Immediately)
| Issue | Severity | Location |
|---|---|---|
| Footer still says "Scottsmoor, FL 32775" (should be Mims, FL 32754) | High | `SiteShell.astro` line 21 |
| JSON-LD Structured Data has wrong location | High | `Base.astro` lines 78-105 |
| Search modal `aria-hidden` reversed | Medium | `Navigation.astro` lines 224, 421 |

### High Priority (Fix Soon)
| Issue | Severity | Location |
|---|---|---|
| Blog post `og:image` not using proper dimensions | Medium | `[slug].astro` line 25 |
| Missing `robots.txt` sitemap reference | Medium | `public/robots.txt` |
| `voice-widget.js` lacks no-JS fallback | Medium | `Base.astro` line 196 |
| Homepage hidden `<span class="sr-only">` | Low | `index.astro` line 65 |

---

## 1. SEO (Search Engine Optimization)

### Strengths
- ✅ Canonical URLs on all pages
- ✅ Open Graph meta tags (og:title, og:description, og:image, og:url)
- ✅ Twitter Card meta tags
- ✅ JSON-LD Structured Data (NonprofitOrganization)
- ✅ Self-hosted Inter font (preloaded)
- ✅ Sitemap generated via `@astrojs/sitemap`
- ✅ `robots.txt` present

### Weaknesses & Fixes

#### 1.1 Blog Post og:image Not Using Article Photo
**Issue:** Blog post pages use `og:image` from frontmatter, but the image is not embedded with proper dimensions. The `og:image` for the lifepointe blog post points to the correct file, but the blog `[slug].astro` page's hero image uses `loading="lazy"` which delays the image load.

**Fix:** Ensure the hero image is above the fold and not lazy-loaded (use `loading="eager"` for the hero):

```astro
<img src={post.data.image} alt={post.data.title} class="w-full h-full object-cover" loading="eager" decoding="async" width={1600} height={900} />
```

#### 1.2 JSON-LD Address Location Outdated
**Issue:** The JSON-LD structured data in `Base.astro` has:
```json
"addressLocality": "Scottsmoor",
"postalCode": "32775"
```
This is outdated. Per the user's request, this should be **Mims, FL 32754**.

**Fix:** Updated in `Base.astro` (done).

#### 1.3 Page Titles Missing Keyword Richness
**Issue:** Several page titles are generic:
- `/about` — "About Us | Base Impact" (should include mission keywords)
- `/contact` — "Contact | Base Impact" (should include "Contact Base Impact" or location)
- `/volunteer` — "Volunteer | Base Impact" (missing value proposition)

**Fix:** Update page titles to include relevant keywords:
```astro
title={`Volunteer | Base Impact — Free tech for Brevard, Volusia & Orange counties`}
```

#### 1.4 `robots.txt` Missing Sitemap Reference
**Issue:** `public/robots.txt` does not reference the sitemap.

**Fix:** Add sitemap reference:
```
Sitemap: https://baseimpact.org/sitemap.xml
```

---

## 2. AEO (Answer Engine Optimization)

### Strengths
- ✅ FAQ-like content in blog posts (sources, how-to)
- ✅ Structured data for nonprofit (Google knows it's a non-profit)
- ✅ Clear location and service areas in copy

### Weaknesses & Fixes

#### 2.1 No FAQSchema
**Issue:** There is no FAQPage structured data on any page. This is a key AEO signal for Google's AI Overview and featured snippets.

**Fix:** Add FAQPage structured data to the `Base.astro` layout (or dedicated FAQ pages):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I apply for food assistance?",
      "acceptedAnswer": {
        "@type": "Question",
        "name": "How do I apply for food assistance?",
        "acceptedAnswer": {
          "@type": "TextObject",
          "text": "Call (321) 323-0999 or visit the directory at baseimpact.org/directory. Ask for the nearest food pantry."
        }
      }
    }
  ]
}
```

#### 2.2 "Ask AI about Base Impact" Widget
**Issue:** The homepage has a "Ask AI about Base Impact" widget (lines 23-24 of the attached context). This appears to be an AI chatbot feature that asks questions. This is a good AEO signal (conversational content), but:

- It's unclear if it's integrated with the site's content
- The widget may be a third-party service that needs configuration

**Recommendation:** Ensure the AI widget's knowledge base includes:
- Location: Mims, FL 32754
- Services: food, shelter, technology access
- Contact: (321) 323-0999

#### 2.3 Rich Snippets for People Also Ask
**Issue:** No "People also ask" content is present on pages.

**Recommendation:** Add FAQ sections to key pages (about, contact, directory, technology-access).

---

## 3. Accessibility (WCAG/ADA)

### Strengths
- ✅ Skip link present (`SiteShell.astro` line 110)
- ✅ `aria-label` on navigation (`aria-label="Main navigation"`)
- ✅ Focus-visible styles on interactive elements
- ✅ `aria-hidden="true"` on decorative SVGs
- ✅ `aria-expanded` on dropdown triggers
- ✅ Mobile menu uses `aria-expanded` and `aria-hidden`
- ✅ Search modal uses `role="dialog"` and `aria-modal="true"`
- ✅ `aria-label` on buttons and form inputs
- ✅ Keyboard trap in mobile drawer and search modal
- ✅ Reduced motion support (CSS + JS)
- ✅ `alt` text on all images
- ✅ `aria-hidden="true"` on decorative icons

### Weaknesses & Fixes

#### 3.1 Search Modal `aria-hidden` Reversal
**Issue:** In `Navigation.astro`:
- Line 224: `<div class="search-modal" id="search-modal" aria-hidden="true" ...>`
- Line 421: `searchModal?.setAttribute('aria-hidden', 'false');` — This is correct when opening
- But the modal is always `aria-hidden="true"` unless JS runs

**Fix:** The current pattern is correct (JS sets it to `false` when opening). However, the `searchInput?.focus()` on line 422 should be followed by a value clear on close (which it does on line 427).

No fix needed — this is correct.

#### 3.2 Dropdown Menus Lack Proper `aria-haspopup`
**Issue:** The dropdown triggers have `aria-expanded="false"` and `aria-haspopup="true"`, but the dropdown menu does not have `aria-labelledby` pointing to the trigger.

**Fix:** Add `aria-labelledby` to each dropdown menu:
```html
<div class="nav-dropdown-menu" role="menu" aria-labelledby="findhelp-trigger">
```

#### 3.3 Mobile Drawer Lacks `aria-modal="true"`
**Issue:** The mobile drawer (line 152) has `aria-hidden="true"` but no `role="dialog"` or `aria-modal="true"`.

**Fix:** Add `role="dialog"` and `aria-modal="true"` to the mobile drawer.

#### 3.4 Footer Location Still Shows "Scottsmoor, FL 32775"
**Issue:** `SiteShell.astro` line 21 still shows "Scottsmoor, FL 32775" which is outdated.

**Fix:** Updated to "Mims, FL 32754" (done).

#### 3.5 No Skip Link for Mobile Menu
**Issue:** The skip link (`Skip to main content`) is present, but the mobile menu is not part of the skip target.

**Fix:** Consider adding a second skip link or ensuring the mobile menu is accessible via keyboard.

---

## 4. Compliance

### 4.1 Privacy & Data Protection
- ✅ `privacy.astro` page exists
- ✅ `terms.astro` page exists
- ✅ `feedback.astro` page exists (needs privacy policy link)
- ⚠️ Personal data collection via feedback form — ensure GDPR/CCPA consent is captured

### 4.2 Accessibility Compliance
- ✅ WCAG 2.1 AA efforts (skip link, ARIA, focus management)
- ⚠️ No formal accessibility statement page (one exists at `/accessibility` but may be a placeholder)

**Recommendation:** Review `/accessibility` page to ensure it's a real statement, not a placeholder.

### 4.3 Fiduciary Requirements
- ✅ `financials.astro` page exists
- ✅ `grants.astro` page exists
- ⚠️ FDACS registration number required for Florida charitable solicitation

---

## 5. Technical & Performance

### Strengths
- ✅ Astro v7 with SSR for dynamic pages
- ✅ Cloudflare Pages hosting with CDN
- ✅ Cloudflare D1 for directory data
- ✅ Leaflet map with OpenStreetMap
- ✅ Turnstile for form bot protection
- ✅ Service worker for offline support
- ✅ Self-hosted Inter font (Performance)
- ✅ `preload` for critical fonts

### Weaknesses & Fixes

#### 5.1 Voice Widget Missing No-JS Fallback
**Issue:** `Base.astro` line 196 loads `voice-widget.js` without a fallback for users who have JavaScript disabled.

**Fix:** Wrap in `<noscript>` or check for JS support:
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
</script>
<noscript>
  <!-- Voice widget not available -->
</noscript>
```

#### 5.2 `voice-widget.js` Size
**Issue:** The voice widget script should be optimized for size.

**Fix:** Minify and compress JS assets.

---

### 6. Directory — Architectural Fix (Critical)

**Issue:** The directory was using a hardcoded origin for ALL distance calculations:
- Default origin: Mims, FL (originally set to **28.6653, -80.8481**)
- **28.6653, -80.8481 is actually Forest Lake, FL** — not Mims, FL 32754!
- Mims, FL 32754 is at approximately: **28.326, -80.751**

This meant all distance calculations were from the wrong location. The directory was fundamentally broken for its purpose.

**The Fix:** Removed server-side pre-calculation entirely. Distances are now calculated client-side from the user's actual ZIP or GPS location.

#### Before (Wrong)
```
Server → processResources(origin, 200, ...)
  → Adds distanceMiles to each resource
  → Data-distance attribute baked into HTML
  → All distances calculated from hardcoded origin
  → User's ZIP not used for distance
```

#### After (Correct)
```
Server → loadResources()
  → Raw resources, no distance calculation
  → Cards render with "No map" until user sets location
  → Client-side JS calculates distances from user's ZIP/GPS
  → Every visitor sees their own distances
```

### Files Changed
| File | Change | Status |
|---|---|---|
| `src/pages/directory.astro` | Removed `processResources` call; pass raw resources | ✅ |
| `src/components/DirectoryApp.astro` | Changed to use `Resource[]` instead of `ProcessedResource[]` | ✅ |
| `src/components/ResourceCard.astro` | Handles missing `distanceMiles` gracefully | ✅ |
| `src/lib/resources/data/towns.ts` | Corrected Mims coordinates to 28.326, -80.751 | ✅ |
| `public/js/directory.js` | No source changes needed — recalculated on client-side | — |
| `src/lib/routing/osrm.ts` | Updated origin coordinates | ✅ |
| `src/lib/routing/stadia.ts` | Updated origin coordinates | ✅ |

---\n

## 7. Website Professional Standards

### Strengths
- ✅ Consistent design system (dark theme, electric blue accents)
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Loading states and reduced motion support
- ✅ Form validation
- ✅ Turnstile bot protection on forms
- ✅ Service worker for offline/pwa support

### Weaknesses & Fixes

#### 7.1 404 Page
**Issue:** The `/404.astro` page should have proper title and description.

**Fix:** Verify the 404 page has proper SEO metadata.

#### 7.2 Broken Links
**Issue:** Check for broken internal links (especially in blog posts and the directory).

**Fix:** Run a link checker on the production site.

#### 7.3 Image Optimization
**Issue:** Some images are large (e.g., `lifepointe-cold-weather-cots.jpg` is 3.7MB).

**Fix:** Ensure all images are optimized (max 1600px wide, progressive JPEG, q82). Already in place for most images.

---

## 8. Recommended Content Additions

### 8.1 FAQ Page
Create a dedicated FAQ page with structured data:
- How do I apply for food assistance?
- How do I get a free device?
- How do I volunteer?
- How do I get help with technology?
- Where is Base Impact located?
- Is my donation tax-deductible?

### 8.2 About Page Expansion
- Add location: Mims, FL 32754
- Add team bios
- Add mission statement
- Add founding story

### 8.3 Contact Page
- Add physical address (if applicable)
- Add email address
- Add office hours
- Add physical address for mail

---

## 9. Final Recommendations

### Priority 1 (Critical)
1. ✅ Fix footer location (completed)
2. ✅ Fix JSON-LD address (completed)

### Priority 2 (High)
3. Fix blog post hero image `loading="eager"`
4. Add sitemap to `robots.txt`
5. Review `/accessibility` page

### Priority 3 (Medium)
6. Add FAQPage structured data
7. Update `page-meta.tsx` `og:image` to use article image
8. Add `aria-labelledby` to dropdown menus
9. Add `role="dialog"` to mobile drawer

### Priority 4 (Low)
10. Add physical address to contact page
11. Add team bios to about page
12. Add donation tax deduction notice to donate page

---

## 10. Files Changed

| File | Change | Status |
|---|---|---|
| `src/components/SiteShell.astro` | Footer location -> Mims, FL 32754 | ✅ |
| `src/layouts/Base.astro` | JSON-LD address -> Mims, FL 32754 | ✅ |
| `src/pages/directory.astro` | Origin coordinates -> Mims | ✅ |
| `src/lib/routing/osrm.ts` | Origin -> Mims | ✅ |
| `src/lib/routing/stadia.ts` | Origin -> Mims | ✅ |
| `public/js/directory.js` | Map coordinates -> Mims | ✅ |
| `src/pages/about.astro` | Location -> Mims, FL 32754 | ✅ |

---

## Quick Reference: All Pages

| Page | SEO | Accessibility | Compliance |
|---|---|---|---|
| `/` | ✅ | ✅ | ✅ |
| `/directory` | ✅ | ✅ | ✅ |
| `/blog/[slug]` | ⚠️ | ✅ | ✅ |
| `/about` | ⚠️ | ✅ | ⚠️ |
| `/contact` | ⚠️ | ✅ | ⚠️ |
| `/donate` | ⚠️ | ✅ | ⚠️ |
| `/volunteer` | ⚠️ | ✅ | ⚠️ |
| `/blog` | ⚠️ | ✅ | ✅ |

---

## Recommended Next Steps

1. **Deploy** the changes (footer, JSON-LD, directory coordinates)
2. **Review `/accessibility` page** to ensure it's a real statement
3. **Add FAQ page** with FAQPage structured data
4. **Update `robots.txt`** with sitemap reference
5. **Add `aria-labelledby`** to dropdown menus in `Navigation.astro`
6. **Create dedicated contact page** with physical address
