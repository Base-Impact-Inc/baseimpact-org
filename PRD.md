# Base Impact — Website & Resource Directory
## Product Requirements Document & Technical Specification

**Version:** 1.0
**Date:** 2026-11-25
**Owner:** Solo founder / fractional CTO (Base Impact)
**Hosting:** Cloudflare Pages + Cloudflare D1
**Framework:** Astro v7, TypeScript, Tailwind-compatible CSS (no Tailwind runtime)
**Design language:** Dark-first (launchpad style), electric blue (`#1717e5`), Inter typeface, rounded-5 cards, AOS-style scroll reveals.

---

## 1. Executive Summary

Base Impact is a Florida 501(c)(3) nonprofit (pending) that connects neighbors with food, shelter, healthcare, and essentials. This document specifies the **web platform** that serves two audiences:

1. **The public-facing website** — about, impact, events, blog, donate, contact, and the resource directory.
2. **The resource directory** — a verified, distance-sorted finder for local aid.

The website is a **single Astro codebase** deployed to Cloudflare Pages. The directory is a **dedicated page** that reads from Cloudflare D1, sorts nearest-first via Haversine, and renders an interactive mobile-first UI.

---

## 2. Product Overview

### 2.1 Core Product
A charity and crisis-resource resource directory for Brevard, Volusia, and Orange counties in Florida, with statewide resources where relevant.

### 2.2 Secondary Products
- Public website (`baseimpact.org`) with blog, impact stories, events, donate, contact, and program pages.
- Blog with photo galleries (e.g., weather shelter response stories).
- Donation & wishlist system.
- Turnstile-protected contact/report form.
- Voice widget (Twilio-backed) for accessibility.

---

## 3. Users & Personas

| Persona | Description | Key Needs |
|---|---|---|
| **Neighbor in crisis** | Someone who needs food, shelter, or help tonight | Find help by ZIP, see distance, see hours, open-now status, call directly |
| **Case worker / social worker** | Uses the directory professionally, may print or export | Sort by distance, filter by category, print list, save favorites |
| **Volunteer / donor** | Wants to help Base Impact | Volunteer page, donate page, contact form |
| **Community visitor** | Touring or exploring the area | Events calendar, blog, photos |

---

## 4. Requirements

### 4.1 Functional Requirements

#### Directory – Must Have
- [ ] List all verified resources in the database
- [ ] Sort by distance from a user-supplied ZIP or current location
- [ ] Show distance (miles) to each resource
- [ ] Filter by category (Food, Shelter, Health, Money Help, Gas & Transportation)
- [ ] Filter by open-now status
- [ ] Search by keyword (name, address, tags)
- [ ] List view and map view (Leaflet + OpenStreetMap)
- [ ] Per-resource: phone call link, directions link, website link
- [ ] Save resources locally (browser `localStorage`)
- [ ] Export saved resources to CSV
- [ ] Report an issue form (Turnstile-protected, per-resource)
- [ ] Print-friendly list view
- [ ] Progressive enhancement: works without JS (server-rendered listing + links)

#### Directory – Should Have
- [ ] Click-to-zoom lightbox for photos on cards
- [ ] "Open now" badge with pulse animation
- [ ] Distance icon/legend on map
- [ ] Filter chips grouped by category
- [ ] Load-more pagination
- [ ] Saved-resources bar
- [ ] Mobile responsive (below 1024px: tabs instead of side-by-side list+map)

#### Website – Must Have
- [ ] Nav with links to key pages
- [ ] Hero section on home page
- [ ] About, mission, programs pages
- [ ] Contact form (Turnstile-protected)
- [ ] Donate page
- [ ] Volunteer page
- [ ] Events calendar
- [ ] Blog with photo galleries and video embeds
- [ ] About / philosophy / impact pages
- [ ] SEO meta tags (title, description, OG, Twitter card)
- [ ] Sitemap, robots.txt, _headers security headers
- [ ] Service worker (offline fallback)

#### Website – Should Have
- [ ] Dark/light theme toggle (or dark-only theme per design system)
- [ ] Accessible skip link
- [ ] Accessible focus states (3px ring)
- [ ] WCAG AA contrast (7:1 for text-on-fill)
- [ ] Print styles for directory
- [ ] Reduced-motion support
- [ ] HTTPS-only, no hotlinking protection on assets
- [ ] Ready for multi-domain routing (4 Cloudflare domains)

### 4.2 Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Lighthouse ≥ 90 for performance, ≥ 95 for accessibility, LCP < 2.5s |
| **SEO** | Descriptive title + meta description on every page; canonical URLs |
| **Accessibility** | WCAG 2.1 AA minimum; skip link; keyboard navigation; focus rings; aria labels |
| **Security** | Cloudflare WAF, CSP headers, Turnstile bot protection on forms, no hotlinking |
| **Maintainability** | TypeScript everywhere; Astro components; design tokens in CSS vars |
| **Reliability** | Directory falls back to static snapshot when D1 is unreachable |
| **Browser support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 5. Design System

### 5.1 Palette

| Role | Token | Value | Usage |
|---|---|---|---|
| Page background | `--color-page` | `#000000` | Page background, darkest |
| Card background | `--color-card` | `#111111` | Card surfaces |
| Inset background | `--color-inset` | `#1c1c1c` | Less prominent surfaces, inputs |
| Band background | `--color-band` | `#0a0a0a` | Hero backgrounds |
| Body text | `--color-body` | `#ffffff` | Primary text |
| Muted text | `--color-muted` | `#b9b9bf` | Secondary text |
| Faint text | `--color-faint` | `#a8a8ac` | Labels, captions |
| Primary accent | `--color-accent` | `#1717e5` | Primary actions, links |
| Signal accent | `--color-signal` | `#4d4df0` | Focus rings, selection |
| Positive | `--color-positive` | `#198754` | Open now badge, success |
| Caution | `--color-caution` | `#ffc107` | Soon badge, caution |
| Critical | `--color-critical` | `#dc3545` | Closed badge, errors |
| Link text (on dark) | `--color-link` | `#a3a3f7` | Hyperlinks on dark surfaces |

### 5.2 Typography

- **Font family:** Inter (self-hosted, `/fonts/inter-v12-*.woff2`)
- **Display font:** Inter bold, oversized
- **Type scale:**
  - `--step-small`: `0.8125rem`
  - `--step-body`: `1.0625rem`
  - `--step-lead`: `1.25rem`
  - `--step-head`: `2rem`
  - `--step-display`: `3.25rem` (clamped up to `7.5rem`)

### 5.3 Spacing & Layout

- **Container max-width:** `72rem` (`.max-w-6xl`)
- **Page padding:** `1rem` mobile, `2rem` tablet, `3rem` desktop
- **Card border-radius:** `--radius-xl` (`1.5rem`) on cards
- **Button radius:** `9999px` (pill) for actions, `var(--radius-lg)` on cards

### 5.4 Components

- **Buttons:** `.btn`, `.btn-primary`, `.btn-light`, `.btn-outline-light`, `.btn-black`
- **Cards:** `.lp-card`, `.resource-card` (directory), `.bg-card`
- **Badges:** `.badge`, `.status-badge` (open/soon/closed)
- **Forms:** input, select, textarea (all styled with border-line, bg-card)
- **Lightbox:** `.lightbox` (full-screen click-to-zoom for images)
- **Dialog:** `<dialog>` element for report form
- **Toast:** `.toast` for notifications

---

## 6. Directory Specification

### 6.1 Architecture

```
┌─────────────────────────────────────────────┐
│  src/pages/directory.astro                  │
│  - loads resources from D1 (fallback: snapshot)
│  - processes: Haversine sort, availability
│  - passes processed resources to DirectoryApp
└──────────────────────┬──────────────────────┘
                       │
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│ DirectoryApp │  ─────────────────►  │ ResourceCard │
│ (.astro)     │                      │ (.astro)     │
│ - filter UI  │                      │ - card JSX   │
│ - results    │                      │ - status     │
│ - map        │                      │ - lightbox   │
└──────────────┘                    └──────────────┘
       ▲                                   ▲
       │  JSON                          │  renders
       │  (mapData)                     │  per resource
       ▼
┌──────────────┐
│  public/js/  │
│  directory.js│  ← progressive enhancement JS
│  report.js   │
└──────────────┘
```

### 6.2 Data Model

#### `Resource` (database row)
| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Organization name |
| `category` | Category | e.g., "Food Banks" |
| `address` | string | Street address |
| `lat` | number | Latitude |
| `lng` | number | Longitude |
| `phone` | string | Contact phone |
| `website` | string (optional) | Main site |
| `serviceUrl` | string (optional) | Specific service page |
| `description` | string | Full description |
| `hoursText` | string | Human-readable hours |
| `schedule` | object | Day → [[open, close]] ranges |
| `tags` | string[] | Searchable tags |
| `partnerType` | string | e.g., "Verified Non-Profit" |
| `capacityStatus` | string | e.g., "Normal Supply" |
| `group` | HelpGroup | e.g., "food" |
| `services` | HelpService[] | Food, Faith, Charity |
| `county` | County | Brevard/Volusia/Orange/Statewide |
| `city` | string (optional) | City for filtering |
| `state` | string (optional) | e.g., "FL" |
| `lastVerified` | string (optional) | ISO date |
| `eligibility` | string (optional) | Plain-language availability |
| `documents` | string (optional) | What to bring |
| `languages` | string[] (optional) | Non-English support |
| `accessibility` | string (optional) | Access notes |
| `mobileOnly` | boolean (optional) | No physical address |

#### `Availability` (derived)
| Field | Values |
|---|---|
| `status` | `OPEN`, `SOON`, `CLOSED`, `UNKNOWN` |
| `label` | Human-readable, e.g., "Open now · closes in ~2h" |

### 6.3 User Journey

1. **Visit** `/directory/`
2. **See** hero with count + source label
3. **Search** by keyword, ZIP, or use current location
4. **Filter** by category, open-now, or state
5. **View** results as list or map
6. **Click** a card to see details:
   - Distance badge ("How far 0.4 mi")
   - Open-now badge (pulsing, if open)
   - Address + hours
   - Collapsible description
   - Call / Map / Web buttons
   - Save button
7. **Save** resources for later (localStorage)
8. **Export** saved resources as CSV
9. **Report** an issue (Turnstile, per-resource)

### 6.4 Filtering & Sorting

- **Default:** nearest-first, OPEN resources first, then SOON, then CLOSED/UNKNOWN
- **Distance:** Haversine formula, 3958.8 mi Earth radius, rounded to 1 decimal
- **Radius filter:** 5 / 10 / 25 / 50 / 100 miles
- **State filter:** dropdown of unique states in dataset
- **Open-now:** checkbox toggles OPEN-only results
- **Search:** debounced 150ms, matches name, address, description, tags
- **Categories:** Food Banks, Churches & Faith-Based, Charity Free Services, Shelters & Housing, Showers & Hygiene, Gas & Transportation Assistance

### 6.5 Map View

- **Library:** Leaflet 1.9.4 + OpenStreetMap tiles
- **Markers:** colored by `group` (food, shelter, health, money, gas, basics, crisis, technology)
- **Popup:** resource name, address, direction buttons (Walk / Bus / Drive)
- **Legend:** toggle groups on/off
- **Responsive:** side panel on desktop (≥1024px), bottom sheet on mobile

### 6.6 Accessibility

- `role="search"` on filter bar
- `aria-live="polite"` on results count and saved bar
- `aria-pressed` on save buttons
- `aria-selected` on view-toggle and map legend chips
- Keyboard: Escape closes dialog, Enter submits forms
- Skip link in SiteShell
- Focus ring: 3px solid `--color-signal`

---

## 7. Website Specification

### 7.1 Page Inventory

| Page | Type | Purpose |
|---|---|---|
| `/` | Static | Home, hero, key stats, CTA |
| `/about` | Static | Mission, history, team |
| `/programs` | Static | Programs: food, shelter, tech, digital skills |
| `/impact` | Static | Impact stories, data |
| `/blog` | Static | Blog listing |
| `/blog/[slug]` | Static | Individual blog post (hero image, tags) |
| `/events` | Static | Events with calendar integration |
| `/directory` | Client | Resource directory (prerender=false) |
| `/contact` | Static | Contact form (Turnstile) |
| `/donate` | Static | Donation flow |
| `/wishlist` | Static | Wishlist items for supplies |
| `/volunteer` | Static | Volunteer signup |
| `/photos` | Static | Photo gallery |
| `/guide` | Static | Tech guide |
| `/id-and-phone` | Static | ID/phone help (digital inclusion) |
| `/socials` | Static | Social media links |
| `/privacy` | Static | Privacy policy |
| `/terms` | Static | Terms of service |
| `/feedback` | Static | Feedback form |
| `/reports` | Static | Impact reports |
| `/grants` | Static | Grants info |
| `/grants/ai-toolkit` | Static | AI toolkit (grants subpage) |
| `/ai-hardware-campaign` | Static | AI hardware campaign (funder/manufacturer ask, linked from grants + blog) |
| `/log` | Static | Blog log |
| `/share-your-story` | Static | Story submission |
| `/accessibility` | Static | Accessibility statement |
| `/connect` | Static | Connect page |
| `/how-to-help` | Static | How to help |
| `/search` | Static | Site search |

### 7.2 Design Patterns

- **Home page:** hero with display-4 typography, stats row, CTA buttons
- **Page shell:** `SiteShell` provides consistent header, footer, skip link
- **Blog posts:** hero image (`aspect-ratio: 16/9`), article content in `prose-content` class
- **Resource cards:** consistent layout across directory
- **Call-to-action:** sticky sections with "Donate", "Volunteer", "Contact"

### 7.3 SEO & Metadata

- **Title:** `{page-title} — Base Impact`
- **Meta description:** Page-specific, concise
- **OG tags:** `og:type`, `og:url`, `og:title`, `og:description`, `og:image`
- **Twitter cards:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- **Canonical URL:** `https://baseimpact.org{path}`
- **Sitemap:** Auto-generated via `@astrojs/sitemap`

### 7.4 Asset Strategy

- **Fonts:** Inter (self-hosted, `public/fonts/`)
- **Images:** Served from `/assets/`, optimized (max 1600px wide, progressive JPEG, q82)
- **JS:** Leaflet CDN (leaflet.css + leaflet.js), service worker (`/sw.js`), voice widget (`/voice-widget.js`)
- **CSS:** Single `global.css` (~140KB, ~2600 lines) with design tokens, utilities, component styles, print styles

---

## 8. Technical Architecture

### 8.1 Stack

| Layer | Technology |
|---|---|
| Framework | Astro v7 (SSR, `prerender=false` for dynamic pages) |
| Language | TypeScript 6 |
| Styling | CSS custom properties (design tokens), no Tailwind runtime |
| Hosting | Cloudflare Pages |
| Database | Cloudflare D1 (SQLite) |
| Map | Leaflet 1.9.4 + OpenStreetMap |
| Forms | Turnstile (bot protection) |
| SEO | `@astrojs/sitemap` |
| Service worker | Custom `/sw.js` |

### 8.2 Build & Deploy

- **Command:** `npm run build` → `astro build` → outputs to `dist/client/`
- **Adapter:** `@astrojs/cloudflare` (cloudflare_pages)
- **Node requirement:** `>=26.12.1`
- **Prerender:** Static pages prerendered; `/directory` has `prerender=false` (server-rendered per request)
- **Deploy:** Git push → Cloudflare Pages CI builds automatically

### 8.3 Directory Data Pipeline

1. **Seed:** `npm run db:seed` → `scripts/seed-resources.mjs` upserts D1
2. **Load:** `loadResources()` reads from D1 (or falls back to bundled `ALL_RESOURCES` snapshot)
3. **Process:** `processResources(origin, maxDistance, options)` adds `distanceMiles` + `nextAvail`, filters by category/tag/query/open-now/saved
4. **Sort:** OPEN → SOON → CLOSED → UNKNOWN, then nearest-first
5. **Render:** `DirectoryApp.astro` maps `ProcessedResource[]` to cards + map data
6. **Enhance:** `directory.js` adds client-side filtering, map interaction, saved resources

### 8.4 Security

- **Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, CSP
- **Cache:** HTML `max-age=0, must-revalidate`; assets `max-age=31536000, immutable`
- **Forms:** Turnstile widget for human verification
- **Hotlinking:** Cloudflare prevents direct hotlinking of asset URLs

---

## 9. Acceptance Criteria

### Directory Page
- [ ] Page loads with server-rendered listing of all resources
- [ ] Distance sort works (nearest first)
- [ ] ZIP search geocodes and centers map
- [ ] "Use my location" uses browser geolocation
- [ ] Category filters show/hide cards
- [ ] Open-now checkbox filters to OPEN only
- [ ] State dropdown filters by state
- [ ] Search filters by keyword (debounced 150ms)
- [ ] List view shows cards; map view shows Leaflet map with markers
- [ ] Clicking a card shows details (phone, hours, address)
- [ ] Save button stores to localStorage
- [ ] Saved bar shows count; export CSV works
- [ ] Report dialog opens with Turnstile; form submits
- [ ] Print button triggers `window.print()`
- [ ] Responsive: mobile tabs (list/map), desktop side-by-side
- [ ] Fallback: shows snapshot when D1 unreachable

### Blog Post
- [ ] Hero image renders with `aspect-ratio: 16/9` and `min-height: 320px`
- [ ] og:image uses article's own photo (not generic)
- [ ] All gallery images present with proper alt text
- [ ] Video embeds load (YouTube)
- [ ] Mobile responsive

### SEO & Performance
- [ ] Sitemap generated with all pages
- [ ] No 404s for existing routes
- [ ] LCP < 2.5s on typical connection
- [ ] All pages have title + meta description

---

## 10. Future Enhancements (Out of Scope)

- Multi-site / multi-domain routing (4 Cloudflare domains)
- Localization (Spanish translations)
- Offline PWA (`/offline` page)
- Admin dashboard for managing resources
- API for third-party integrations
- AI toolkit (grants/partner)
- Email notifications for open-now changes
- SMS integration

---

## 11. Appendix: Key File Overview

| File | Purpose |
|---|---|
| `src/pages/directory.astro` | Directory page (server-rendered, prerender=false) |
| `src/components/DirectoryApp.astro` | Main directory UI component |
| `src/components/ResourceCard.astro` | Resource card component |
| `src/components/SiteShell.astro` | Shared site shell (nav, footer, skip link) |
| `src/lib/resources/types.ts` | TypeScript types (Resource, ProcessedResource, Availability) |
| `src/lib/resources/logic.ts` | Distance sorting, availability, filtering logic |
| `src/lib/resources/load.ts` | D1 loading with snapshot fallback |
| `src/lib/resources/data/*.ts` | Resource data by region |
| `src/styles/global.css` | Design tokens, utilities, components, print styles |
| `src/pages/[slug].astro` | Blog post page (hero image, og:image) |
| `src/layouts/Base.astro` | Common HTML head, og:image, service worker |
| `public/js/directory.js` | Progressive enhancement JS for directory |
| `public/js/report.js` | Report dialog logic |
| `public/sw.js` | Service worker |
| `public/_headers` | Cloudflare security & cache headers |

---

## 12. Immediate Action Items

1. **Verify directory renders** — run `npm run build` and check `/directory` output on a deployed environment
2. **Test with real D1** — run `npm run db:seed:local` and verify `loadResources()` reads correctly
3. **Check mobile layout** — test `/directory` on a phone (below 1024px)
4. **Validate og:image** — confirm `https://baseimpact.org/assets/iws-shelter-1.jpg` loads for blog posts
5. **Check Lighthouse** — run the performance/accessibility audit on production
6. **Verify all external links** — check that all phone, website, and map links resolve correctly
