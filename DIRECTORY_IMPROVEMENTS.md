# Base Impact Resource Directory — Layout & Design Improvement Proposal

## Executive Summary

The current directory is functional and feature-rich (136+ resources, distance sorting, map, transit, road-distance upgrades, saved items, print). This proposal targets **usability, scannability, and mobile experience** while preserving all existing functionality.

---

## Current Architecture Assessment

### Strengths
- Server-rendered HTML + progressive enhancement (works without JS)
- Distance-first sorting (critical for crisis users)
- Dual view: list + Leaflet map with category filtering
- Road-distance upgrade via public OSRM (driving/walking)
- Transit directions via self-hosted OpenTripPlanner
- Offline-capable saved items (localStorage)
- Print-optimized stylesheet
- Bilingual (EN/ES) copy system

### Pain Points Identified

| Area | Issue | Impact |
|------|-------|--------|
| **Filter Bar** | 7 controls + 10 category chips = ~400px vertical on mobile | Pushes results below fold; cognitive overload |
| **Card Density** | 6 action buttons + tags + hours + description preview | Hard to scan; "Call" buried at bottom on mobile |
| **Map/List Toggle** | Binary switch; map hidden by default | Users miss map; no hybrid view |
| **Search** | No debounce indicator, no suggestions, no recent searches | Feels sluggish; no discoverability |
| **Empty States** | Generic "no results" | Doesn't guide recovery (widen radius, clear filters) |
| **Saved View** | Just a filter chip; no dedicated UX | Hard to review/manage saved items |
| **Accessibility** | Focus order unclear in cards; map not keyboard-navigable | Screen reader / keyboard users blocked |
| **Performance** | All 136+ cards in DOM at once | Slow initial paint on low-end devices |

---

## Proposed Improvements

### 1. Filter Bar Redesign — Collapsible + Sticky

**Goal:** Reduce vertical space by 60% on mobile; keep filters accessible.

```astro
<!-- Desktop: inline horizontal bar (current behavior) -->
<!-- Mobile: single "Filters" button → bottom sheet / slide-over panel -->
<div class="filter-bar sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line">
  <!-- Desktop: always visible -->
  <div class="hidden lg:flex flex-wrap items-center gap-3 p-3">
    <SearchInput /> <ZipInput /> <UseLocationBtn /> <DistanceModeSelect />
    <RadiusSelect /> <StateFilter /> <OpenNowCheckbox />
  </div>

  <!-- Mobile: trigger button -->
  <button class="lg:hidden btn-pill w-full justify-between" data-filter-toggle>
    <span>Filters</span>
    <Badge>{activeFilterCount}</Badge>
    <ChevronIcon />
  </button>
</div>

<!-- Mobile bottom sheet (portal to body) -->
<dialog id="filter-sheet" class="fixed inset-0 z-50 lg:hidden">
  <form method="dialog" class="h-full flex flex-col bg-card border-t border-line rounded-t-2xl">
    <header class="sticky top-0 flex items-center justify-between p-4 border-b border-line bg-card">
      <h2 class="text-lg font-semibold">Filters</h2>
      <button value="close" class="text-muted hover:text-body">✕</button>
    </header>
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <FilterSection title="Location">...</FilterSection>
      <FilterSection title="Category" chips={groups} />  {/* accordion-able */}
      <FilterSection title="Availability">...</FilterSection>
      <FilterSection title="Area">...</FilterSection>
    </div>
    <footer class="sticky bottom-0 p-4 border-t border-line bg-card flex gap-3">
      <button class="btn-pill flex-1" value="reset">Clear all</button>
      <button class="btn-pill flex-1 bg-fill" value="apply">Show results</button>
    </footer>
  </form>
</dialog>
```

**Key changes:**
- Sticky header on scroll (desktop + mobile)
- Mobile: single tap target opens full-screen filter sheet
- Category chips in accordion groups (Essentials / Support / Crisis / Saved)
- Active filter count badge on trigger button
- "Clear all" + "Apply" actions in sheet footer

---

### 2. Resource Card — Scannable, Action-First

**Goal:** User sees **distance → name → category → primary action** in <2 seconds.

```astro
<article class="resource-card group relative bg-card border border-line rounded-2xl overflow-hidden transition-shadow hover:shadow-border-hover">
  <!-- 1. Distance badge — TOP LEFT, always visible -->
  <div class="absolute top-3 left-3 z-10">
    <span class="distance-badge bg-fill/90 text-on-fill text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
      {distText}
    </span>
  </div>

  <!-- 2. Open-now indicator — TOP RIGHT -->
  {isOpen && (
    <div class="absolute top-3 right-3 z-10">
      <span class="open-badge bg-positive/90 text-on-positive text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <span class="w-1.5 h-1.5 rounded-full bg-on-positive animate-pulse"></span>
        Open now
      </span>
    </div>
  )}

  <div class="p-4 sm:p-5">
    <!-- Header row: category chips + save -->
    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
          {resource.category} · {resource.partnerType}
        </p>
        <h3 class="font-display text-base sm:text-lg font-semibold leading-snug text-body break-words">
          {resource.name}
        </h3>
      </div>
      <SaveButton resourceId={resource.id} class="shrink-0" />
    </div>

    <!-- Tags (max 3 + overflow) -->
    <div class="flex flex-wrap gap-1.5 mb-3" aria-label="Services offered">
      {resource.tags.slice(0, 3).map(tag => (
        <span class="tag bg-inset text-muted text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
      ))}
      {resource.tags.length > 3 && (
        <span class="tag text-faint text-xs font-medium">+{resource.tags.length - 3} more</span>
      )}
    </div>

    <!-- 3. Primary actions — PROMINENT, thumb-friendly -->
    <div class="action-bar flex flex-wrap gap-2 mb-3" role="group" aria-label="Primary actions">
      {hasPhone && (
        <a href={telHref(phone)} class="action-btn primary flex-1 min-w-[84px] min-h-11 flex items-center justify-center gap-1.5 bg-fill text-on-fill text-sm font-semibold rounded-xl hover:bg-fill-hover transition-colors">
          <PhoneIcon class="size-4" /> Call
        </a>
      )}
      {hasWeb && (
        <a href={webUrl} target="_blank" rel="noreferrer" class="action-btn secondary flex-1 min-w-[84px] min-h-11 flex items-center justify-center gap-1.5 border border-line bg-card text-body text-sm font-semibold rounded-xl hover:bg-inset transition-colors">
          <GlobeIcon class="size-4" /> {webLabel}
        </a>
      )}
      {canNavigate && (
        <a href={directionsHref(resource.address)} target="_blank" rel="noreferrer" class="action-btn secondary flex-1 min-w-[84px] min-h-11 flex items-center justify-center gap-1.5 border border-line bg-card text-body text-sm font-semibold rounded-xl hover:bg-inset transition-colors">
          <MapPinIcon class="size-4" /> Map
        </a>
      )}
    </div>

    <!-- 4. Secondary info row: address + hours -->
    <div class="info-row grid gap-3 sm:grid-cols-2 text-sm">
      <div class="address-block">
        <p class="text-faint uppercase tracking-wider text-xs mb-0.5">Address</p>
        <address class="text-muted break-words flex items-start gap-1.5">
          <MapPinIcon class="size-4 shrink-0 mt-0.5 text-faint" />
          <span>{resource.address}</span>
          <CopyAddressButton address={resource.address} class="ml-auto text-link hover:underline text-xs" />
        </address>
      </div>
      <div class="hours-block">
        <p class="text-faint uppercase tracking-wider text-xs mb-0.5">Hours</p>
        <p class="text-muted">{resource.hoursText || 'Call for hours'}</p>
      </div>
    </div>

    <!-- 5. Description preview (collapsible on mobile) -->
    <details class="description-preview mt-3" open>
      <summary class="text-xs text-faint cursor-pointer flex items-center gap-1 select-none">
        <span>Details</span>
        <ChevronDownIcon class="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <p class="mt-2 text-sm text-muted line-clamp-3">{resource.description}</p>
    </details>

    <!-- 6. Footer: status + report -->
    <div class="card-footer flex items-center justify-between mt-4 pt-3 border-t border-line/40">
      <StatusBadge avail={resource.nextAvail} />
      <ReportIssueButton resourceId={resource.id} resourceName={resource.name} class="text-xs text-muted hover:text-accent underline underline-offset-2" />
      <span class="text-xs text-faint">Verified {formatDate(resource.lastVerified)}</span>
    </div>
  </div>
</article>
```

**Key changes:**
| Before | After |
|--------|-------|
| Distance buried in middle | **Distance badge top-left (sticky on scroll)** |
| 6 equal buttons | **Primary: Call/Map/Web** — Secondary: Bus/Walk in overflow menu |
| Save button in header | **Save stays top-right** (muscle memory) |
| Hours stacked | **Address + Hours side-by-side** on ≥640px |
| Description always visible | **Collapsible `<details>`** — reduces card height 30% |
| Report at bottom | **Report in footer** with verification date |

---

### 3. Hybrid List/Map View — Split Pane on Desktop

**Goal:** Map always visible on desktop; mobile keeps toggle but adds "Nearby on map" link per card.

```astro
<!-- Desktop: split view -->
<div class="hidden lg:grid lg:grid-cols-[1fr_420px] gap-4">
  <!-- List panel (scrollable) -->
  <div class="list-panel overflow-y-auto max-h-[calc(100vh-14rem)] pb-20">
    <ResourceGrid resources={filtered} />
  </div>

  <!-- Map panel (sticky) -->
  <aside class="map-panel sticky top-20 h-[calc(100vh-12rem)] rounded-2xl overflow-hidden border border-line bg-card">
    <MapLegend class="sticky top-0 z-10 bg-card/95 backdrop-blur p-3 border-b border-line" />
    <div id="map-container" class="h-full" />
  </aside>
</div>

<!-- Mobile: toggle + per-card map link -->
<div class="lg:hidden">
  <div class="view-toggle flex gap-2 mb-4" role="tablist">
    <button role="tab" data-view="list" class="btn-pill flex-1 bg-fill" aria-selected="true">List</button>
    <button role="tab" data-view="map" class="btn-pill flex-1" aria-selected="false">Map</button>
  </div>
  <div id="mobile-list" role="tabpanel">...</div>
  <div id="mobile-map" role="tabpanel" hidden>...</div>
</div>

<!-- Per-card map link (mobile only) -->
{canNavigate && (
  <a href={directionsHref(resource.address)} target="_blank" rel="noreferrer"
     class="lg:hidden block text-center py-2 text-sm font-medium text-link hover:underline border-t border-line/40 mt-2">
    Open in Maps →
  </a>
)}
```

**Key changes:**
- Desktop: **Side-by-side** — list scrolls, map stays sticky
- Map legend always visible (sticky top)
- Mobile: retains toggle but each card has "Open in Maps" quick link
- Map initializes lazily (IntersectionObserver) to save resources

---

### 4. Search UX Upgrade

```astro
<div class="search-wrapper relative">
  <label for="search-input" class="sr-only">Search resources</label>
  <input
    type="search"
    id="search-input"
    placeholder="Search by name, service, or keyword…"
    autocomplete="off"
    aria-autocomplete="list"
    aria-controls="search-suggestions"
    class="w-full rounded-xl border-line px-4 py-3 pl-10 pr-10 bg-page text-body"
  />
  <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-faint size-5" />
  <button
    type="button"
    id="search-clear"
    class="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-body hidden"
    aria-label="Clear search"
  >
    <XIcon class="size-5" />
  </button>

  <!-- Suggestions dropdown (populated from resource names/tags) -->
  <datalist id="search-suggestions">
    {allSearchTerms.map(term => <option value={term} />)}
  </datalist>

  <!-- Recent searches (localStorage) -->
  <div id="recent-searches" class="absolute top-full left-0 right-0 mt-1 bg-card border border-line rounded-xl shadow-lg hidden z-20 p-2">
    <p class="text-xs text-faint px-2 py-1">Recent searches</p>
    {recentSearches.map(q => (
      <button type="button" class="w-full text-left px-3 py-2 text-sm text-body hover:bg-inset rounded-lg" data-recent-search={q}>
        {q}
      </button>
    ))}
  </div>
</div>
```

**Behavior:**
- Debounced (300ms) → updates results count live
- `<datalist>` for instant tag/name completion (no JS needed)
- Recent searches (last 5) persist in localStorage
- Clear button appears when input has value
- Keyboard: `Esc` clears, `↓` opens suggestions

---

### 5. Empty State — Actionable Guidance

```astro
<div id="empty-state" class="empty-state hidden" role="status" aria-live="polite">
  <svg class="size-16 mx-auto text-line/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="8" x2="14" y2="14" />
    <line x1="14" y1="8" x2="8" y2="14" />
  </svg>
  <h3 class="text-lg font-semibold mt-4 text-body">No resources found</h3>
  <p class="text-muted mt-1">Try one of these:</p>
  <ul class="mt-4 space-y-2 text-sm text-muted text-left max-w-xs mx-auto">
    <li class="flex items-center gap-2"><span class="size-5 rounded-full bg-inset flex items-center justify-center"><CheckIcon class="size-3 text-positive" /></span> Widen the distance radius</li>
    <li class="flex items-center gap-2"><span class="size-5 rounded-full bg-inset flex items-center justify-center"><CheckIcon class="size-3 text-positive" /></span> Clear category filters</li>
    <li class="flex items-center gap-2"><span class="size-5 rounded-full bg-inset flex items-center justify-center"><CheckIcon class="size-3 text-positive" /></span> Uncheck "Open now"</li>
    <li class="flex items-center gap-2"><span class="size-5 rounded-full bg-inset flex items-center justify-center"><CheckIcon class="size-3 text-positive" /></span> Search a different keyword</li>
  </ul>
  <button type="button" id="clear-all-filters" class="btn-pill mt-6 bg-fill text-on-fill">Clear all filters</button>
</div>
```

---

### 6. Saved Items — Dedicated Management View

```astro
<!-- When "Saved" chip active, show management bar -->
<div id="saved-bar" class="hidden lg:hidden mb-4 p-3 bg-inset rounded-xl border border-line flex items-center justify-between">
  <p class="text-sm text-muted">{savedCount} saved</p>
  <div class="flex gap-2">
    <button id="export-saved" class="btn-pill text-sm px-3">Export CSV</button>
    <button id="clear-saved" class="btn-pill text-sm px-3 border border-line bg-card">Clear all</button>
  </div>
</div>

<!-- Export CSV includes: name, category, address, phone, website, distance, hours, tags, verified date -->
```

---

### 7. Accessibility Hardening

| Component | Fix |
|-----------|-----|
| **Resource cards** | `role="article"`, `aria-labelledby="card-{id}-name"`, focus order: name → primary actions → secondary info |
| **Map** | Keyboard navigation: `Tab` to map, arrow keys pan, `+`/`-` zoom, `Enter` on marker opens popup |
| **Filter sheet** | `inert` on background, focus trap, `Esc` closes, restore focus to trigger |
| **Search** | `aria-live="polite"` on results count, `aria-controls` links input to grid |
| **Distance badge** | `aria-label="2.3 miles away"` (not just "2.3 mi") |
| **Save button** | `aria-pressed` toggles, `aria-label="Save {name} for later"` |
| **Color contrast** | All text ≥ 4.5:1; badges use tinted backgrounds with on-tint text (already in CSS) |

---

### 8. Performance — Virtualized Grid

For 136+ resources, render only visible + buffer:

```javascript
// In directory.js — replace full render with virtualized approach
const VIRTUAL_BUFFER = 6; // render 6 above/below viewport
const CARD_HEIGHT_ESTIMATE = 280; // px, updated after first layout

function renderVirtual() {
  const matched = items.filter(matches);
  const scrollTop = grid.parentElement.scrollTop;
  const viewportHeight = grid.parentElement.clientHeight;
  const startIdx = Math.max(0, Math.floor(scrollTop / CARD_HEIGHT_ESTIMATE) - VIRTUAL_BUFFER);
  const endIdx = Math.min(matched.length, startIdx + Math.ceil(viewportHeight / CARD_HEIGHT_ESTIMATE) + VIRTUAL_BUFFER * 2);

  // Render only [startIdx, endIdx) with placeholder divs for spacing
  // Use CSS grid with `grid-template-rows: repeat(N, auto 1fr)` trick or
  // absolute-positioned items with transform: translateY()
}
```

**Simpler alternative (CSS-only):** Use `content-visibility: auto` on `.resource-item`:

```css
.resource-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 280px; /* estimated height */
}
```

Browser skips layout/paint for off-screen cards. Zero JS changes.

---

### 9. Category Chip Groups — Organized Taxonomy

Current: 10 flat chips. Proposed: accordion groups.

```astro
<nav class="chip-groups" aria-label="Filter by type of help">
  <details class="chip-group" open>
    <summary class="chip-group-title text-xs font-semibold uppercase tracking-wider text-faint px-2 py-1">
      Essentials
    </summary>
    <div class="chip-row flex flex-wrap gap-2 px-2 pb-2">
      {['food', 'shelter', 'health'].map(g => <Chip group={g} label={t[g]} />)}
    </div>
  </details>
  <details class="chip-group">
    <summary class="chip-group-title text-xs font-semibold uppercase tracking-wider text-faint px-2 py-1">
      Support
    </summary>
    <div class="chip-row flex flex-wrap gap-2 px-2 pb-2">
      {['money', 'gas', 'basics', 'technology'].map(g => <Chip group={g} label={t[g]} />)}
    </div>
  </details>
  <details class="chip-group">
    <summary class="chip-group-title text-xs font-semibold uppercase tracking-wider text-faint px-2 py-1">
      Crisis & Saved
    </summary>
    <div class="chip-row flex flex-wrap gap-2 px-2 pb-2">
      {['crisis', 'saved'].map(g => <Chip group={g} label={t[g]} />)}
    </div>
  </details>
</nav>

<style>
  .chip-group summary { cursor: pointer; list-style: none; }
  .chip-group summary::-webkit-details-marker { display: none; }
  .chip-group summary::after { content: '▾'; font-size: 0.6em; margin-left: 0.5rem; transition: transform 0.2s; }
  .chip-group[open] summary::after { transform: rotate(180deg); }
  .chip-group:not([open]) .chip-row { display: none; }
</style>
```

---

### 10. Print View — Enhanced

Current print.css hides interactive elements. Add:

```css
@media print {
  /* Show QR code for each resource linking to live page */
  .resource-item::after {
    content: '';
    display: block;
    width: 1.5in;
    height: 1.5in;
    background: url('/api/qr?url=' + attr(data-permalink)) center/cover;
    margin-top: 0.5rem;
  }

  /* Include map thumbnail for resources with coordinates */
  .resource-item[data-has-map]::before {
    content: '📍 ' attr(data-distance) ' away';
    display: block;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
}
```

---

## Implementation Priority

| Phase | Tasks | Effort | Risk |
|-------|-------|--------|------|
| **1 — Quick wins** | Content-visibility, empty state, search clear button, chip groups accordion | Low | None |
| **2 — Card redesign** | New ResourceCard.astro (distance badge, action bar, collapsible description) | Medium | Visual regression testing needed |
| **3 — Filter bar** | Sticky header, mobile bottom sheet, active count badge | Medium | Focus management in dialog |
| **4 — Hybrid map** | Desktop split pane, lazy map init, per-card map links | Medium | Leaflet CSS conflicts |
| **5 — Saved UX** | Management bar, CSV export | Low | None |
| **6 — Accessibility** | ARIA audit, keyboard map nav, focus traps | Medium | Testing with screen readers |
| **7 — Performance** | Virtualized grid or content-visibility | Low | Layout shift if estimates wrong |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/DirectoryApp.astro` | Filter bar restructure, hybrid map layout, search enhancements, empty state, saved bar |
| `src/components/ResourceCard.astro` | Complete redesign (see proposal) |
| `public/js/directory.js` | Virtual rendering, filter sheet logic, map lazy init, hybrid view sync, search debounce + suggestions |
| `src/styles/global.css` | New utilities: `.distance-badge`, `.open-badge`, `.action-btn`, `.chip-group`, `.filter-sheet`, print QR |
| `src/lib/resources/types.ts` | Add `permalink` field for print QR codes (optional) |

---

## Testing Checklist

- [ ] Mobile: filter sheet opens/closes, focus returns to trigger
- [ ] Mobile: sticky filter bar doesn't overlap results
- [ ] Desktop: split pane — list scrolls, map sticky
- [ ] Map: keyboard navigation (Tab, arrows, +/-, Enter)
- [ ] Cards: distance badge visible at all scroll positions
- [ ] Cards: primary actions reachable by thumb (bottom third of screen)
- [ ] Search: debounce works, suggestions appear, recent searches persist
- [ ] Empty state: "Clear all filters" button works
- [ ] Saved: count badge updates, export CSV downloads valid file
- [ ] Print: QR codes render, URLs visible, no interactive chrome
- [ ] Screen reader: NVDA/VoiceOver announces filter changes, card structure
- [ ] Reduced motion: all animations disabled
- [ ] High contrast: all text readable, borders visible

---

## Migration Strategy

1. **Branch** from `main` → `feature/directory-redesign`
2. **Phase 1** commits: CSS utilities + empty state + chip groups (no JS changes)
3. **Phase 2** commits: ResourceCard redesign (visual only, same data props)
4. **Phase 3** commits: DirectoryApp restructure + filter sheet + hybrid map
5. **Phase 4** commits: directory.js virtual rendering + search + map lazy init
6. **Visual regression**: Playwright screenshots at 375px, 768px, 1440px
7. **Accessibility audit**: axe-core + manual screen reader pass
8. **Deploy to staging** → stakeholder review → merge to main

---

## Appendix: Design Token Reference

```css
/* New tokens for directory (add to :root in global.css) */
--distance-badge-bg: var(--color-fill);
--distance-badge-text: var(--color-on-fill);
--open-badge-bg: var(--color-positive);
--open-badge-text: var(--color-on-positive);
--action-primary-bg: var(--color-fill);
--action-primary-text: var(--color-on-fill);
--action-primary-hover: var(--color-fill-hover);
--action-secondary-bg: var(--color-card);
--action-secondary-border: var(--color-line);
--action-secondary-hover: var(--color-inset);
--filter-sheet-bg: var(--color-card);
--filter-sheet-border: var(--color-line);
--chip-group-title: var(--color-faint);
```

---

*Prepared for Base Impact resource directory redesign. All proposals preserve existing D1 backend, bilingual copy, and progressive-enhancement architecture.*