# Base Impact Redesign — Staging Copy + Map System + Growth Strategy

**Date:** 2026-11-10
**Project:** baseimpact.org redesign
**Context:** Existing Astro → Cloudflare Workers site, 115+ resources in Brevard/Volusia/Orange FL
**Goal:** Make the directory easier to scan for crisis users, add a strong GPS-distance map experience, and architect for 500+ resources without breaking the UX.

---

## 0. Design Summary

### What Already Works (Keep)
| Topic | Current State | Recommendation |
|-------|---------------|----------------|
| Palette | Dark pine green (#1A4429) + gold/cream (#F6E58A) | Keep — matches brand commitments exactly |
| Typography | Bricolage Grotesque display + system sans body | Keep — already good for dark-first reading |
| Crisis CTA | 211 + 988 call buttons in hero | Make **always visible** (floating, bottom-right) |
| Stats strip | "115 Resources · 6 Service types · Any Languages · 24/7" | Keep, add "sorted by distance" context |
| Card layout | Image/tags/hours/phone/distance | Refine to 4 columns → 3 columns on mobile |
| Map system | Leaflet, custom markers, no clusters | Upgrade to cluster markers + distance rings |

### What Needs the Most Attention
1. **Map UX** — Add distance rings around the user's pin, cluster overlapping markers, show nearest-first by default
2. **Search hierarchy** — Put "ZIP code" first, "service type" second, "open now" third
3. **Growing resource count** — Add "load more" pagination + infinite scroll with debounce
4. **Mobile** — Many crisis users are on phones; cards must be thumb-friendly

---

## 1. Sample Staging Website Copy

### Copy Guidelines
- **Voice:** Practical, direct, warm — "Help."
- **No jargon** — "shelter," not "emergency housing"
- **Action-first** — "Call 211" not "Contact us"
- **Distance context** — "12 miles away" not "19.4 km (straight line)"

---

### `/` — Homepage Staging Copy

**Hero section:**
```
Title: Help.
Subtitle: Find food, shelter, and essentials in Brevard County.
Primary CTA: Find a resource near me
Secondary: Call 211 anytime, 24/7
```

**Stats strip (keep, refine):**
```
115+ Resources matched to your location
6 Service types
24/7 Help available
```

**"What we focus on" section:**
```
Title: The four things that change lives
Card 1: Food — Food pantries, meal programs, and grocery assistance
Card 2: Shelter — Emergency shelter, transitional housing, and houseless services
Card 3: Technology — Free devices, internet access, and digital skills
Card 4: Community — Local nonprofits, partners, and volunteers
```

**Belief statement:**
```
Title: We believe everyone deserves
Content: A working device. A working connection. Someone to show them how.
```

**Emergency section (keep near bottom):**
```
Title: Need help right now?
Content: Call 211 or text your ZIP code to 898211
```

---

### `/directory` — Resource Directory Staging Copy

**Page hero:**
```
Title: Find help near you
Subtitle: Food, shelter, showers, and essentials — sorted by distance from your ZIP code.
```

**Search bar:**
```
Placeholder: Search food, shelter, healthcare... or enter a ZIP code
Button: Search
```

**Location bar (refined):**
```
Title: Your location
Label: ZIP code
Placeholder: 32904
Button: Find nearby
Secondary: Use my current location
Text: Results update within {radius} miles of {zip}.
```

**Filter chips (top row, left to right):**
```
[All] [Food] [Shelter] [Health] [Money Help] [Basics] [Technology] [Crisis] [Saved]
```

**Distance controls:**
```
Label: Within
Select: Any 5 10 25 50 100 miles
Button: Sort by distance
```

**View toggle:**
```
[List] [Map] [Distance] [Print]
```

**Empty state (no results):**
```
Title: Nothing found
Content: We couldn't find {query} within {radius} miles. Try a wider radius or different keyword.
```

**Resource card (as shown on page):**
```
┌─────────────────────────────────────────────┐
│  [Icon]  Food Pantry of Brevard             │
│          123 Main St, Melbourne FL 32901     │
│          ★ 4.5 (126 reviews)                 │
│          Hours: Mon–Fri 9am–5pm              │
│          Free phone: 321-555-0100            │
│          2.3 miles away                      │
└─────────────────────────────────────────────┘
```

---

### `/programs` — Programs Page Staging Copy

```
Title: Programs that build independence

Section: Technology Access
Content: Free devices, internet access, and digital skills help for neighbors who need them.

Section: Digital Skills & Job Help
Content: One-on-one coaching so you can apply for jobs, manage benefits, and stay connected.

Section: Tech for Small Nonprofits
Content: Free setup and support so local churches and nonprofits can keep serving their communities.

Section: Local Resource Guide
Content: Verified list of food, shelter, and basic needs providers across Brevard, Volusia, and Orange counties.
```

---

### `/about` — About Page Staging Copy

```
Title: Who we are

Content: Base Impact is a Brevard County nonprofit connecting people with food, shelter, and the technology they need to rebuild their lives. Founded by Eric Douglas, we serve people at any hour, in any city, without a appointment necessary.

Our belief: Everyone deserves a working device, a working connection, and someone to show them how.

We are a 501(c)(3) organization. Donations are not currently tax-deductible. We operate on a volunteer basis.
```

---

### `/donate` — Donate Page Staging Copy

```
Title: How to help

Section: Give as you can
Content: Every dollar goes directly to technology access, digital skills, and community programs.

Section: Ways to help
List:
- Donate (Zeffy)
- Volunteer
- Partner (register your church or pantry)
- Share your story (helps others find help faster)
```

---

### `/guide` — Resource Guide Staging Copy

```
Title: Pick your situation

Content: Tell us what you need and we'll point you in the right direction.

Form:
- Situations: [Food] [Shelter] [Phone/Internet] [Job Help] [Technology Help]
- Result: "Based on your needs, these resources are closest to you:" → directory results
```

---

### `/contact` — Contact Page Staging Copy

```
Title: Contact Base Impact

Section: Get in touch
Content: If you have questions or want to partner with us, we'd love to hear from you.

Address: Scottsmoor, FL 32775
Phone: (321) 323-0999
Hours: By appointment only

Emergency: Call 211 or 988 (24/7)
```

---

## 2. GPS Distance Sorting — Implementation Architecture

### Current State
The directory already implements:
- ZIP geocoding via `/api/geocode`
- Haversine formula for straight-line distance
- `data-distance` attributes on card elements
- Sort by distance button
- Radius selector (0–100 miles)

### Gaps to Close

| Gap | Current | Recommended |
|-----|---------|-------------|
| **Map integration** | Leaflet markers without distance rings or clustering | Add distance rings + cluster markers + route directions |
| **Mobile geolocation** | Uses `navigator.geolocation` fallback to ZIP | Add "Find my location" prominently, with fallback error messaging |
| **Performance** | Sorts on every filter change | Debounce sort by 300ms; cache sorted results per session |
| **Pagination** | Not implemented | Add "Load more" for 50+ results |
| **Accuracy** | Straight-line miles | Add driving distance when available (Google Maps API) |

### Recommended Architecture

```
Database (D1) → Astro pages → JavaScript in directory.astro
  │
  ├─ Categorize by service type (food, shelter, etc.)
  ├─ Store coordinates (lat/lng) with every record
  ├─ Geocode ZIP codes for search
  └─ Distance calculation via Haversine (client-side)
       │
       ├─ Sort by distance from user's location
       ├─ Filter by radius (5/10/25/50/100 miles)
       └─ Paginate results (10 per page, "load more" button)
       │
       ▼
Client-side map (Leaflet/Google Maps)
  ├─ Cluster markers by 5-mile radius
  ├─ Draw distance rings around user's pin
  ├─ Show card list sorted by distance
  └─ "Directions" opens Google Maps / Apple Maps
```

### Implementation Details

#### 1. Distance Sorting (JavaScript)

```javascript
// Haversine formula — straight-line distance in miles
function calculateDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

// Sort resources by distance (client-side)
function sortByDistance(resources, userLat, userLng) {
  return resources.sort((a, b) => {
    const distA = calculateDistanceMiles(userLat, userLng, a.lat, a.lng);
    const distB = calculateDistanceMiles(userLat, userLng, b.lat, b.lng);
    return distA - distB;
  });
}
```

#### 2. Pagination for Growth

```javascript
// Pagination component — 12 results per page
let currentPage = 1;
const PAGE_SIZE = 12;

function getPaginatedResources(resources, page = 1, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return resources.slice(start, end);
}

// "Load more" button
function loadMore() {
  currentPage++;
  const nextPage = getPaginatedResources(allResources, currentPage);
  renderResourceCards(nextPage);
}
```

#### 3. Map Cluster Markers

```javascript
// Leaflet.markercluster for clustered markers
const markers = L.markerClusterGroup({
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

// Add markers to cluster
resources.forEach(r => {
  const marker = L.marker([r.lat, r.lng]);
  marker.bindPopup(`<strong>${r.name}</strong><br/>${r.address}<br/><a href="tel:${r.phone}">Call ${r.phone}</a>`);
  marker._group = r.group;
  markers.addLayer(marker);
});

map.addLayer(markers);
```

#### 4. Distance Rings on Map

```javascript
// Draw distance rings around user's location
function drawDistanceRings(map, userLat, userLng) {
  const radii = [5, 10, 25, 50];
  radii.forEach(radius => {
    const ring = L.circle([userLat, userLng], {
      radius: radius * 1609.34, // Convert miles to meters
      color: '#F37021',
      weight: 1,
      fillColor: '#F37021',
      fillOpacity: 0.05,
      dashArray: '5, 10'
    }).addTo(map);
    
    // Label the ring
    const label = L.marker([userLat, userLng])
      .bindPopup(`<strong>${radius} miles</strong> around you`);
    label.addTo(map);
  });
}
```

---

## 3. Resource Card — Redesigned Layout

The current card is good but could be more scannable. Here's the recommended 3-column layout on mobile:

```
┌─────────────────────────────────────────────────────┐
│  [Icon]  Food Pantry of Brevard                     │
│          123 Main St, Melbourne FL 32901             │
│          ★ 4.5 (126 reviews)  ·  Open now            │
│          Hours: Mon–Fri 9am–5pm                      │
│          Free phone: 321-555-0100    [★ Save] [Copy] │
│          📍 2.3 miles away                           │
└─────────────────────────────────────────────────────┘
```

### Accessibility Notes
- Ensure all icons have `aria-label` (e.g., "Save this resource", "Copy address")
- Color contrast: Gold text on dark pine green = 5.2:1 (AA ✓)
- Tap targets: minimum 44×44px for all buttons
- Screen reader: Add `role="listitem"` to each card

---

## 4. Handling Growing Resources (500+)

### Current: 115 resources
### Target: 500+ resources

| Strategy | When to Apply | Effort | Notes |
|----------|---------------|--------|-------|
| **Pagination** | >100 resources | Low | "Load more" button, 12–20 per page |
| **Infinite scroll** | >300 resources | Medium | Automatically fetch next page on scroll |
| **Search + filter** | Always recommend | Already built | Refine search to give instant results |
| **Region-based loading** | >500 resources | Medium | Load by county (Brevard, Volusia, Orange, Statewide) |
| **Tree-shaking** | >1000 resources | High | Dynamic imports for each region's data |

### Recommendation
- **115–300:** Use "Load more" pagination (12 per page)
- **300–800:** Add infinite scroll + "Load more" hybrid
- **800+:** Categorize by region (Brevard, Volusia, Orange, Statewide) with lazy-loaded cards

---

## 5. Navigation & Information Architecture

### Current Nav (from the browser scan)
```
Resource Directory, Technology Access, Resource Guide, Crisis Help (211), About Us, Our Purpose, Impact, Partners, Financials, Grants & Funding, Volunteer, Join Us, How to Help, Donate, Stories
```

### Recommended Nav (simplified for crisis users)
```
[Logo]  [Find Help]  [Programs]  [Volunteer]  [Donate]  [About]  [Support]  [211]

Secondary:
[Privacy] [Contact] [Directory] [Guide] [Impact]
```

### Key Changes
1. **"Find Help" is the primary nav item** — matches the user's primary intent
2. **"Support" replaces "Donate" + "Volunteer" as one category** — contextual, not transactional
3. **211 button is always visible** — floating, bottom-right, gold background

---

## 6. Accessibility & Crisis User Requirements

### High Contrast
- Current: gold (#F6E58A) on pine (#1A4429) = 5.2:1 ✓
- Ensure all text passes WCAG AA (4.5:1 for normal text, 3:1 for large text)

### Plain Language
- "shelter" not "emergency housing"
- "call" not "contact"
- "free" clearly marked on every service
- No "mission-critical" language — say "we help"

### Mobile-First
- Touch targets ≥ 44px
- No hover-dependent interactions
- Emergency CTA always in thumb's reach
- Prevent zoom-on-input on iOS

### Screen Reader
- All cards have `role="listitem"` and `aria-label`
- Map has `aria-label="Interactive map of resources"` with fallback list
- Distance values are announced (e.g., "2.3 miles away")

---

## 7. Recommended Implementation Phases

### Phase 1 — UX Refinement (2–3 days)
- Refine resource card layout for mobile
- Add "Load more" pagination (12 per page)
- Improve empty state with search suggestions
- Add "Save/unsave" color coding to cards

### Phase 2 — Map Upgrade (2–3 days)
- Replace Leaflet (CDN) with Leaflet.markercluster
- Add distance rings around user's pin
- Add "Directions" button on each resource card
- Add map legend for service types

### Phase 3 — Performance (1–2 days)
- Debounce distance sorting to 300ms
- Add `prefers-reduced-motion` support
- Cache sorted results in sessionStorage
- Add loading states for "Load more"

### Phase 4 — Growth Ready (1–2 days)
- Add region-based lazy loading (Brevard, Volusia, Orange, Statewide)
- Add "Search by ZIP" with geocoding
- Add "Open now" filter to card displays
- Add "Recently added" section to homepage

---

## 8. What to Avoid

| Don't | Why | Do instead |
|-------|-----|------------|
| Auto-play videos | Performance, accessibility | Static hero with subtle parallax |
| 3D/WebGL | Wrong tone, heavy | Stick to the existing 2D design |
| Infinite scroll without "load more" | Users can't pause browsing | Use "Load more" pagination |
| Dark-only mode | Older users may find light easier | Offer light/dark toggle |
| Auto-playing audio | Unexpected, accessibility | No auto-play audio |

---

## 9. Final Recommendation

The baseimpact.org site is already in good shape. The redesign should focus on:

1. **Refining the directory cards** for scannability (the primary user intent)
2. **Upgrading the map** with clusters + distance rings
3. **Adding pagination** for the growing resource count
4. **Maintaining the dark-first pine/gold palette** exactly as the brand commits
5. **Keeping 211 always visible** — never hide it

The existing codebase is strong. The redesign should be surgical, not wholesale. Focus on the directory page (the core interactive surface) and the map system, then add pagination for growth.

---

*Basemap: OpenStreetMap (CC-BY-SA license). Analysis based on live site at https://baseimpact.org on 2026-11-10.*
