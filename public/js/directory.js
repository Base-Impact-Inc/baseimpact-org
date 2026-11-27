/**
 * Directory client — self-contained.
 *
 * Everything this script needs comes from the DOM: the server renders every
 * listing as a `.resource-item` with data attributes, and embeds the same rows
 * as JSON in `#resource-data` for the map. No external globals required.
 *
 * Simplified version: no filter sheet, no modal dialogs.
 * Just sticky filter bar, accordion chip groups, hybrid map, saved bar.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // --- Core elements ---
  const grid = $('resource-grid');
  if (!grid) return;

  const activeGrid = () => grid;
  const getItems = () => Array.from(activeGrid()?.querySelectorAll('.resource-item') || []);

  // --- Filter elements ---
  const searchInput = $('search-input');
  const searchClear = $('search-clear');
  const zipInput = $('zip-input');
  const useLocationBtn = $('use-location-btn');
  const radiusSelect = $('radius-select');
  const stateFilter = $('state-filter');
  const openNowCheckbox = $('open-now');
  const distanceModeSelect = $('distance-mode');
  const locationStatus = $('location-status');

  // --- Chips ---
  const desktopChips = Array.from(document.querySelectorAll('.chip-groups button[data-group]'));
  const allChips = [...desktopChips];

  // --- Map legend chips ---
  const mapChips = Array.from(document.querySelectorAll('.map-legend-chip, #map-legend-mobile button[data-mapgroup]'));
  mapChips.forEach(chip => {
    chip.addEventListener('click', () => filterMap(chip.getAttribute('data-mapgroup') || 'all'));
  });

  // --- View toggle ---
  const viewListBtn = $('view-list');
  const viewMapBtn = $('view-map');

  // --- Map containers ---
  const mapContainer = $('map-container');
  const mapLegend = $('map-legend');

  // --- Counts & pagination ---
  const countEl = $('results-count');
  const emptyState = $('empty-state');
  const loadMoreBtn = $('load-more');
  const pagination = $('pagination');

  // --- Saved ---
  const saveAllBtn = $('save-all-btn');
  const savedBar = $('saved-bar');
  const savedCountEl = $('saved-count');
  const exportSavedBtn = $('export-saved');
  const clearSavedBtn = $('clear-saved');

  // --- Clear filters ---
  const clearAllFiltersBtn = $('clear-all-filters');
  const clearAllFiltersBtnMobile = $('clear-all-filters-mobile');

  // --- Data ---
  let cardData = [];
  try {
    cardData = JSON.parse($('resource-data')?.textContent || '[]');
  } catch {
    cardData = [];
  }

  // --- Constants ---
  const PAGE_SIZE = 12;
  const LOCATION_KEY = 'baseimpact-location';
  const RADIUS_KEY = 'baseimpact-radius';
  const SAVED_KEY = 'baseimpact-saved';
  const RECENT_SEARCHES_KEY = 'baseimpact-recent-searches';

  const ROAD_DISTANCE_KEY = 'baseimpact-road-distance-v1';
  const ROAD_MODE_KEY = 'baseimpact-road-mode';
  const ROAD_PROFILES = { driving: 'routed-car', walking: 'routed-foot' };
  const ROAD_BASES = [
    'https://routing.openstreetmap.de',
    'https://router.project-osrm.org',
  ];
  const ROAD_LIMIT = 20;
  const ROAD_TTL_MS = 60 * 60 * 1000;
  const METERS_PER_MILE = 1609.344;

  const TRANSIT_API = 'https://otp.douglaspc.com/api/otp/route';
  const TRANSIT_CACHE_KEY = 'baseimpact-transit-v1';
  const TRANSIT_TTL_MS = 5 * 60 * 1000;
  const TRANSIT_TIMEOUT_MS = 8000;

  // --- State ---
  let visibleCount = PAGE_SIZE;
  let activeGroup = 'all';
  // Deep links such as the nav's "Crisis Help (211)" → /directory?filter=crisis
  // must preselect the same chip a user would click. Validate against the
  // rendered chips so unknown values are ignored instead of yielding an
  // empty list. syncChips()/render() at the end of init apply this state.
  const requestedFilter = (new URLSearchParams(window.location.search).get('filter') || '').trim().toLowerCase();
  if (requestedFilter && allChips.some(chip => chip.getAttribute('data-group') === requestedFilter)) {
    activeGroup = requestedFilter;
  }
  let activeState = 'all';
  let query = '';
  let openOnly = false;
  let location = null;
  let radius = 0;
  let savedIds = [];
  let recentSearches = [];
  let map = null;
  let markerLayer = null;
  let allMarkers = [];
  let mapInitialised = false;
  let currentMapGroup = 'all';
  let visibleIds = null;
  let roadMode = 'driving';
  let roadDistances = new Map();
  let roadUpgradeSeq = 0;

  // --- Init from storage ---
  try {
    savedIds = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    location = JSON.parse(sessionStorage.getItem(LOCATION_KEY) || 'null');
    const storedRadius = sessionStorage.getItem(RADIUS_KEY);
    radius = parseInt(storedRadius ?? radiusSelect?.value ?? '0', 10) || 0;
    recentSearches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    const storedMode = sessionStorage.getItem(ROAD_MODE_KEY);
    if (storedMode && Object.prototype.hasOwnProperty.call(ROAD_PROFILES, storedMode)) {
      roadMode = storedMode;
    }
  } catch {
    /* ignore malformed storage */
  }
  syncSelectors([radiusSelect], String(radius));

  // --- Helpers ---
  function syncSelectors(selectors, value) {
    selectors.forEach(s => { if (s) s.value = value; });
  }

  function syncCheckboxes(checkboxes, checked) {
    checkboxes.forEach(c => { if (c) c.checked = checked; });
  }

  function updateActiveFilterCount() {
    let count = 0;
    if (activeGroup !== 'all') count++;
    if (activeState !== 'all') count++;
    if (openOnly) count++;
    if (radius > 0) count++;
    if (location) count++;
    if (query) count++;
    // No activeFilterCountEl element anymore (was on filter sheet trigger)
  }

  function updateSavedBar() {
    if (!savedBar || !savedCountEl) return;
    const count = savedIds.length;
    savedCountEl.textContent = `${count} ${savedCountEl.dataset.label || 'saved'}`;
    const hideSavedBar = count === 0 || activeGroup !== 'saved';
    savedBar.hidden = hideSavedBar;
    savedBar.classList.toggle('hidden', hideSavedBar);
  }

  function saveRecentSearch(q) {
    if (!q || q.length < 2) return;
    recentSearches = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches)); } catch {}
  }

  // --- Distance ---
  function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  function itemDistance(item) {
    const id = item.getAttribute('data-resource-id');
    if (id && roadDistances.has(id)) return roadDistances.get(id);
    if (!location) return parseFloat(item.getAttribute('data-distance') || '9999');
    const lat = parseFloat(item.getAttribute('data-lat'));
    const lng = parseFloat(item.getAttribute('data-lng'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 9999;
    return calculateDistanceMiles(location.lat, location.lng, lat, lng);
  }

  // --- Road distances ---
  function roadCacheKey(origin, ids) {
    const o = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`;
    return `${ROAD_DISTANCE_KEY}:${roadMode}:${o}:${ids.slice(0, 50).join(',')}`;
  }

  function readRoadCache(origin, ids) {
    try {
      const raw = sessionStorage.getItem(roadCacheKey(origin, ids));
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || Date.now() - data.timestamp > ROAD_TTL_MS) return null;
      return data.distances && typeof data.distances === 'object' ? data.distances : null;
    } catch { return null; }
  }

  function writeRoadCache(origin, ids, distances) {
    try {
      sessionStorage.setItem(roadCacheKey(origin, ids), JSON.stringify({ distances, timestamp: Date.now() }));
    } catch {}
  }

  function clearRoadDistances() { roadDistances = new Map(); }

  function setDistanceStatus(ok) {
    if (!locationStatus || !location) return;
    const base = location.label ? `Showing results near ${location.label}` : '';
    const note = ok ? ` · road distance (${roadMode})` : ' · road distance unavailable, showing straight-line';
    locationStatus.textContent = base + note;
  }

  async function upgradeRoadDistances() {
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    const profile = ROAD_PROFILES[roadMode];
    if (!profile) return;

    const itemsNow = getItems();
    const candidates = itemsNow
      .filter(item => {
        const lat = parseFloat(item.getAttribute('data-lat'));
        const lng = parseFloat(item.getAttribute('data-lng'));
        return Number.isFinite(lat) && Number.isFinite(lng);
      })
      .sort((a, b) => itemDistance(a) - itemDistance(b))
      .slice(0, ROAD_LIMIT);

    if (candidates.length === 0) return;

    const ids = candidates.map(item => item.getAttribute('data-resource-id') || '');
    const seq = ++roadUpgradeSeq;

    const cached = readRoadCache(location, ids);
    if (cached) {
      ids.forEach((id, i) => { const d = cached[id]; if (Number.isFinite(d)) roadDistances.set(id, d); });
      render();
      setDistanceStatus(true);
      return;
    }

    const coords = [
      `${location.lng},${location.lat}`,
      ...candidates.map(item => `${item.getAttribute('data-lng')},${item.getAttribute('data-lat')}`),
    ].join(';');
    const destinations = candidates.map((_, i) => i + 1).join(';');
    const urls = ROAD_BASES.map(base => {
      const profile = base.includes('openstreetmap.de') ? ROAD_PROFILES[roadMode] : 'driving';
      return `${base}/${profile}/table/v1/driving/${coords}?sources=0&destinations=${destinations}&annotations=distance,duration`;
    });

    try {
      let data = null;
      let lastError = null;
      for (const url of urls) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
          const response = await fetch(url, { signal: controller.signal, referrerPolicy: 'no-referrer' });
          if (!response.ok) throw new Error(`OSRM ${response.status}`);
          const parsed = await response.json();
          if (parsed.code !== 'Ok') throw new Error(parsed.message || parsed.code || 'OSRM error');
          data = parsed;
          break;
        } catch (err) { lastError = err; }
        finally { clearTimeout(timer); }
      }
      if (!data) throw lastError || new Error('No road-distance provider available');

      const row = data.distances && data.distances[0];
      if (!Array.isArray(row)) throw new Error('OSRM returned no distance row');

      const distances = {};
      candidates.forEach((item, i) => {
        const meters = row[i];
        if (typeof meters !== 'number' || !Number.isFinite(meters)) return;
        const miles = Math.round((meters / METERS_PER_MILE) * 10) / 10;
        const id = item.getAttribute('data-resource-id') || '';
        roadDistances.set(id, miles);
        distances[id] = miles;
      });
      if (seq !== roadUpgradeSeq) return;
      writeRoadCache(location, ids, distances);
      render();
      setDistanceStatus(true);
    } catch (err) {
      if (seq !== roadUpgradeSeq) return;
      console.warn('Road-distance upgrade failed; keeping straight-line distances:', err);
      setDistanceStatus(false);
    }
  }

  // --- Filtering ---
  function matches(item) {
    const group = item.dataset.group || '';
    const name = item.dataset.name || '';
    const desc = item.dataset.desc || '';
    const tags = item.dataset.tags || '';
    const isOpen = item.dataset.open === '1';
    const itemState = item.dataset.state || '';
    const id = item.getAttribute('data-resource-id') || '';

    const matchesGroup = activeGroup === 'all' || group === activeGroup || (activeGroup === 'saved' && savedIds.includes(id));
    const matchesSearch = !query || name.includes(query) || desc.includes(query) || tags.includes(query);
    const matchesOpen = !openOnly || isOpen;
    const matchesState = activeState === 'all' || itemState === activeState;

    let distance = 9999;
    if (location) {
      distance = itemDistance(item);
      if (radius > 0 && distance > radius) return false;
    }
    return matchesGroup && matchesSearch && matchesOpen && matchesState;
  }

  // --- Render ---
  function render() {
    const itemsNow = getItems();
    const currentCountEl = countEl;
    const currentEmptyState = emptyState;
    const currentPagination = pagination;
    const currentLoadMoreBtn = loadMoreBtn;
    const currentGrid = activeGrid();

    if (!currentGrid) return;

    let matched = itemsNow.filter(matches);
    visibleIds = new Set(matched.map(item => item.getAttribute('data-resource-id')));

    if (location) {
      matched.sort((a, b) => itemDistance(a) - itemDistance(b));
      matched.forEach(item => {
        const d = itemDistance(item);
        const span = item.querySelector('.distance-miles, .resource-card-distance-value');
        if (span) span.textContent = d >= 9999 ? 'No map' : `${d.toFixed(1)} mi`;
        item.setAttribute('data-distance', String(d));
      });
      // Re-append in sorted order
      matched.forEach(item => currentGrid.appendChild(item));
    }

    const total = matched.length;
    matched.forEach((item, index) => {
      item.classList.toggle('hidden', index >= visibleCount);
    });
    itemsNow.forEach(item => {
      if (!matched.includes(item)) item.classList.add('hidden');
    });

    if (currentCountEl) currentCountEl.textContent = `${total} result${total !== 1 ? 's' : ''}`;
    if (currentEmptyState) currentEmptyState.classList.toggle('hidden', total > 0);
    if (currentGrid) currentGrid.classList.toggle('hidden', total === 0);

    const remaining = total - visibleCount;
    if (currentPagination) currentPagination.classList.toggle('hidden', total <= PAGE_SIZE);
    if (currentLoadMoreBtn) {
      currentLoadMoreBtn.disabled = remaining <= 0;
      currentLoadMoreBtn.textContent = remaining > 0 ? `Load more (${remaining} left)` : 'All results shown';
    }

    updateSavedBar();
    updateSaveButtons();
    if (mapInitialised) filterMap(currentMapGroup);
  }

  // --- Load more ---
  [loadMoreBtn].forEach(btn => {
    btn?.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      render();
    });
  });

  // --- Search ---
  let searchDebounceTimer = null;
  searchInput?.addEventListener('input', () => {
    const val = (searchInput.value || '').toLowerCase().trim();
    query = val;
    // Show/hide clear button
    if (searchClear) {
      searchClear.hidden = !val;
      searchClear.classList.toggle('visible', !!val);
    }
    visibleCount = PAGE_SIZE;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      if (query.length >= 2) saveRecentSearch(query);
      render();
    }, 150);
  });

  searchClear?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      query = '';
      searchInput.focus();
      searchClear.hidden = true;
      searchClear.classList.remove('visible');
      visibleCount = PAGE_SIZE;
      render();
    }
  });

  // --- Open now ---
  openNowCheckbox?.addEventListener('change', () => {
    openOnly = openNowCheckbox.checked;
    render();
  });

  // --- State filter ---
  stateFilter?.addEventListener('change', () => {
    activeState = stateFilter.value || 'all';
    render();
  });

  // --- Radius ---
  radiusSelect?.addEventListener('change', () => {
    radius = parseInt(radiusSelect.value || '0', 10) || 0;
    sessionStorage.setItem(RADIUS_KEY, String(radius));
    render();
  });

  // --- Distance mode ---
  distanceModeSelect?.addEventListener('change', () => {
    const next = distanceModeSelect.value;
    if (!Object.prototype.hasOwnProperty.call(ROAD_PROFILES, next)) return;
    roadMode = next;
    try { sessionStorage.setItem(ROAD_MODE_KEY, roadMode); } catch {}
    roadUpgradeSeq += 1;
    clearRoadDistances();
    render();
    upgradeRoadDistances();
  });

  // --- Chips (category filters) ---
  function syncChips() {
    allChips.forEach(chip => {
      const active = chip.getAttribute('data-group') === activeGroup;
      chip.classList.toggle('bg-fill', active);
      chip.classList.toggle('text-on-fill', active);
      chip.classList.toggle('bg-inset', !active);
      chip.classList.toggle('text-body', !active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  allChips.forEach(chip => {
    chip.addEventListener('click', () => {
      activeGroup = chip.getAttribute('data-group') || 'all';
      syncChips();
      render();
    });
  });

  // --- Saved filter toggle ---
  saveAllBtn?.addEventListener('click', () => {
    activeGroup = activeGroup === 'saved' ? 'all' : 'saved';
    syncChips();
    render();
  });

  // --- Saved bar actions ---
  exportSavedBtn?.addEventListener('click', () => {
    const itemsNow = getItems();
    const savedItems = itemsNow.filter(item => savedIds.includes(item.getAttribute('data-resource-id')));
    if (savedItems.length === 0) return;
    const headers = ['Name', 'Category', 'Address', 'Phone', 'Website', 'Distance (mi)', 'Hours', 'Tags', 'Verified'];
    const rows = savedItems.map(item => {
      const data = cardData.find(d => d.id === item.getAttribute('data-resource-id'));
      if (!data) return [];
      return [
        `"${data.name.replace(/"/g, '""')}"`,
        `"${data.category.replace(/"/g, '""')}"`,
        `"${data.address.replace(/"/g, '""')}"`,
        `"${(data.phone || '').replace(/"/g, '""')}"`,
        `"${(data.website || '').replace(/"/g, '""')}"`,
        item.getAttribute('data-distance') || '',
        `"${(data.hoursText || '').replace(/"/g, '""')}"`,
        `"${data.tags.join('; ').replace(/"/g, '""')}"`,
        data.lastVerified || '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-resources-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  clearSavedBtn?.addEventListener('click', () => {
    if (!confirm('Clear all saved resources?')) return;
    savedIds = [];
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    updateSaveButtons();
    if (activeGroup === 'saved') {
      activeGroup = 'all';
      syncChips();
    }
    render();
  });

  // --- Clear all filters ---
  function clearAllFilters() {
    activeGroup = 'all';
    activeState = 'all';
    openOnly = false;
    radius = 0;
    query = '';
    location = null;
    sessionStorage.removeItem(LOCATION_KEY);
    sessionStorage.removeItem(RADIUS_KEY);

    syncChips();
    syncSelectors([stateFilter], 'all');
    syncSelectors([radiusSelect], '0');
    syncCheckboxes([openNowCheckbox], false);
    if (searchInput) { searchInput.value = ''; }
    if (searchClear) { searchClear.hidden = true; searchClear.classList.remove('visible'); }
    if (zipInput) zipInput.value = '';
    if (locationStatus) locationStatus.textContent = '';
    if (distanceModeSelect) distanceModeSelect.value = 'driving';
    roadMode = 'driving';
    try { sessionStorage.setItem(ROAD_MODE_KEY, roadMode); } catch {}

    clearRoadDistances();
    visibleCount = PAGE_SIZE;
    currentMapGroup = 'all';
    render();
  }

  [clearAllFiltersBtn, clearAllFiltersBtnMobile].forEach(btn => {
    btn?.addEventListener('click', clearAllFilters);
  });

  // --- Save buttons ---
  function updateSaveButtons() {
    document.querySelectorAll('.save-btn, .resource-card-save').forEach(btn => {
      const id = btn.getAttribute('data-resource-id');
      const saved = savedIds.includes(id);
      btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      btn.classList.toggle('text-accent', saved);
      btn.classList.toggle('text-muted', !saved);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.save-btn, .resource-card-save');
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute('data-resource-id');
    const idx = savedIds.indexOf(id);
    if (idx >= 0) savedIds.splice(idx, 1);
    else savedIds.push(id);
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    updateSaveButtons();
    if (activeGroup === 'saved') render();
  });

  // --- Copy address ---
  document.addEventListener('click', async e => {
    const btn = e.target.closest('.copy-addr-btn, .resource-card-copy-btn');
    if (!btn) return;
    const addr = btn.getAttribute('data-copy-address') || '';
    try {
      await navigator.clipboard.writeText(addr);
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
      btn.textContent = 'Copy failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    }
  });

  // --- Location ---
  function setLocation(loc, label) {
    location = { lat: loc.lat, lng: loc.lng, label };
    sessionStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    if (locationStatus) locationStatus.textContent = label ? `Showing results near ${label} · straight-line distance (road distances load shortly)` : '';
    syncSelectors([zipInput], '');
    visibleCount = PAGE_SIZE;
    clearRoadDistances();
    render();
    upgradeRoadDistances();
    updateActiveFilterCount();
  }

  async function geocodeZip(zip) {
    const res = await fetch(`/api/geocode?zip=${encodeURIComponent(zip)}`);
    if (!res.ok) throw new Error('ZIP not found');
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  zipInput?.addEventListener('keydown', async e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const zip = zipInput.value.trim();
    if (!/^\d{5}$/.test(zip)) {
      if (locationStatus) locationStatus.textContent = 'Enter a valid 5-digit ZIP code.';
      return;
    }
    try {
      const loc = await geocodeZip(zip);
      setLocation({ lat: loc.lat, lng: loc.lng }, loc.label);
    } catch {
      if (locationStatus) locationStatus.textContent = 'Could not find that ZIP code. Please try again.';
    }
  });

  useLocationBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (locationStatus) locationStatus.textContent = 'Geolocation is not supported by your browser.';
      return;
    }
    if (locationStatus) locationStatus.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'your current location'),
      () => { if (locationStatus) locationStatus.textContent = 'Could not get your location. Enter a ZIP code instead.'; },
      { timeout: 10000 }
    );
  });

  // --- Map ---
  function buildPopup(r) {
    const base = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
    const hasCoords = r.lat && r.lng;
    const modes = hasCoords ? [
      { mode: 'walking', label: 'Walk', aria: 'Open walking directions', icon: '<svg class="inline size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="13" cy="2" r="2"/><circle cx="13" cy="18" r="2"/><path d="M13 6l-2-4h4l-2-4"/><path d="M11 11h2"/></svg>' },
      { mode: 'transit', label: 'Bus', aria: 'Open transit directions (SCAT)', icon: '<svg class="inline size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 11h18"/></svg>' },
      { mode: 'driving', label: 'Drive', aria: 'Open driving directions', icon: '<svg class="inline size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 11 3 3 3 11"/><path d="M13.5 8.5L19 2l1.5 8L23 16l-6-4-6 4 1.5 8z"/></svg>' }
    ] : [];

    const directionsHtml = modes.map(m => `
      <a href="${base}&travelmode=${m.mode}" target="_blank" rel="noreferrer"
        aria-label="${m.aria} to ${escapeHTML(r.name)}"
        class="direction-pill"
        ${m.mode === 'transit' ? `data-transit="1" data-transit-lat="${Number(r.lat)}" data-transit-lng="${Number(r.lng)}" data-transit-name="${escapeHTML(r.name)}"` : ''}
        style="display:inline-flex;align-items:center;gap:0.375rem;padding:0.375rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;text-decoration:none;color:var(--color-body);background:var(--color-card);border:1px solid var(--color-line);transition:background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;"
        onmouseover="this.style.background='var(--color-inset)';this.style.borderColor='var(--color-accent)';"
        onmouseout="this.style.background='var(--color-card)';this.style.borderColor='var(--color-line)';"
        onmousedown="this.style.transform='scale(0.96)';"
        onmouseup="this.style.transform='scale(1)';"
      >${m.icon}${m.label}</a>
    `).join('');

    return `
      <div style="min-width:200px;font-family:Inter,system-ui,sans-serif;">
        <strong style="color:#111;display:block;margin-bottom:2px;">${escapeHTML(r.name)}</strong>
        <span style="color:#555;font-size:12px;">${escapeHTML(r.address)}</span>
        ${hasCoords ? `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:8px;">${directionsHtml}</div>` : ''}
      </div>`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function initMap(container) {
    if (mapInitialised) return;
    mapInitialised = true;
    if (typeof L === 'undefined') { setTimeout(() => initMap(container), 200); return; }

    const mapInstance = L.map(container, { scrollWheelZoom: false }).setView([28.6653, -80.8481], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(mapInstance);

    const layerGroup = L.layerGroup().addTo(mapInstance);
    const bounds = [];

    cardData.forEach(r => {
      const lat = Number(r.lat), lng = Number(r.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;
      const marker = L.marker([lat, lng]);
      marker.bindPopup(buildPopup(r));
      marker._group = r.group || 'all';
      marker._data = r;
      allMarkers.push(marker);
        marker.addTo(layerGroup);
      bounds.push([lat, lng]);
    });

    if (bounds.length) mapInstance.fitBounds(bounds, { padding: [40, 40] });

    const legend = mapLegend;
    legend?.classList.remove('hidden');

    map = mapInstance; markerLayer = layerGroup;

    filterMap(currentMapGroup);
  }

  function filterMap(group) {
    currentMapGroup = group;
    const chips = mapChips;
    chips.forEach(chip => {
      const active = chip.getAttribute('data-mapgroup') === group;
      chip.classList.toggle('bg-fill', active);
      chip.classList.toggle('text-on-fill', active);
      chip.classList.toggle('bg-inset', !active);
      chip.classList.toggle('text-body', !active);
      chip.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    const layer = markerLayer;
    if (!layer) return;
    // Rebuild from the persistent marker list: removing layers while iterating
    // the layer group skips entries and permanently drops markers.
    layer.clearLayers();
    allMarkers.forEach(m => {
      const id = String(m._data?.id ?? '');
      const groupOk = group === 'all' || m._group === group;
      const listOk = !visibleIds || visibleIds.has(id);
      if (groupOk && listOk) layer.addLayer(m);
    });
  }

  // --- View Toggle (Desktop: show/hide map; Mobile: tabs) ---
  function showListView() {
    // Desktop
    mapContainer?.classList.add('hidden');
    mapLegend?.classList.add('hidden');
    grid?.classList.remove('hidden');
    pagination?.classList.remove('hidden');
    viewListBtn?.classList.add('bg-fill', 'text-on-fill');
    viewListBtn?.classList.remove('bg-inset', 'text-body');
    viewMapBtn?.classList.remove('bg-fill', 'text-on-fill');
    viewMapBtn?.classList.add('bg-inset', 'text-body');
    viewListBtn?.setAttribute('aria-selected', 'true');
    viewMapBtn?.setAttribute('aria-selected', 'false');
    mapContainer?.setAttribute('aria-hidden', 'true');

  }

  function showMapView() {
    // Desktop
    mapContainer?.classList.remove('hidden');
    mapLegend?.classList.remove('hidden');
    grid?.classList.add('hidden');
    pagination?.classList.add('hidden');
    viewMapBtn?.classList.add('bg-fill', 'text-on-fill');
    viewMapBtn?.classList.remove('bg-inset', 'text-body');
    viewListBtn?.classList.remove('bg-fill', 'text-on-fill');
    viewListBtn?.classList.add('bg-inset', 'text-body');
    viewMapBtn?.setAttribute('aria-selected', 'true');
    viewListBtn?.setAttribute('aria-selected', 'false');
    if (!mapInitialised) setTimeout(() => initMap('map-container'), 200);
    else filterMap(currentMapGroup);
    if (map) setTimeout(() => map.invalidateSize(), 250);
    mapContainer?.setAttribute('aria-hidden', 'false');

  }

  // Desktop view toggle
  viewListBtn?.addEventListener('click', showListView);
  viewMapBtn?.addEventListener('click', showMapView);

  // --- Transit ---
  let transitPanel = null, transitPanelClose = null, transitPanelStatus = null, transitPanelBody = null, transitReturnFocus = null;

  function googleTransitUrl(toLat, toLng) { return `https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLng}&travelmode=transit`; }
  function transitCacheKey(toLat, toLng) {
    const origin = location && Number.isFinite(location.lat) ? `${location.lat.toFixed(5)},${location.lng.toFixed(5)}` : 'current-location';
    return `${TRANSIT_CACHE_KEY}|${origin}>${Number(toLat).toFixed(5)},${Number(toLng).toFixed(5)}`;
  }
  function readTransitCache(key) {
    try { const raw = sessionStorage.getItem(key); if (!raw) return null; const p = JSON.parse(raw); if (!p || !p.data || Date.now() - p._t > TRANSIT_TTL_MS) return null; return p.data; } catch { return null; }
  }
  function writeTransitCache(key, data) { try { sessionStorage.setItem(key, JSON.stringify({ _t: Date.now(), data })); } catch {} }

  function closeTransitPanel() { if (!transitPanel) return; transitPanel.classList.add('hidden'); if (transitReturnFocus?.focus) transitReturnFocus.focus(); transitReturnFocus = null; }

  function ensureTransitPanel() {
    if (transitPanel) return;
    transitPanel = document.createElement('div');
    transitPanel.id = 'transit-panel';
    transitPanel.className = 'hidden';
    transitPanel.setAttribute('role', 'dialog');
    transitPanel.setAttribute('aria-modal', 'false');
    transitPanel.setAttribute('aria-labelledby', 'transit-panel-title');
    transitPanel.style.cssText = 'position:fixed;inset-inline:1rem;bottom:1rem;z-index:2000;max-width:26rem;margin-inline:auto;padding:1rem;border-radius:14px;background:var(--color-card);border:1px solid var(--color-line);box-shadow:0 12px 32px rgba(0,0,0,.18);font-family:Inter,system-ui,sans-serif;color:var(--color-body);max-height:min(70vh,34rem);overflow:auto;';
    transitPanel.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;">
        <h2 id="transit-panel-title" style="margin:0;font-size:.95rem;line-height:1.3;color:#111;">Bus routes</h2>
        <button type="button" id="transit-panel-close" aria-label="Close bus routes" style="border:0;background:transparent;font-size:1.35rem;line-height:1;cursor:pointer;padding:.125rem .375rem;color:#555;border-radius:6px;">&times;</button>
      </div>
      <p id="transit-panel-status" role="status" aria-live="polite" style="margin:.375rem 0 0;font-size:.8rem;color:#555;"></p>
      <div id="transit-panel-body" style="margin-top:.5rem;"></div>`;
    document.body.appendChild(transitPanel);
    transitPanelClose = $('transit-panel-close');
    transitPanelStatus = $('transit-panel-status');
    transitPanelBody = $('transit-panel-body');
    transitPanelClose?.addEventListener('click', closeTransitPanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !transitPanel?.classList.contains('hidden')) closeTransitPanel(); });
  }

  function renderTransitItineraries(data, destinationName, toLat, toLng) {
    const all = Array.isArray(data.itineraries) ? data.itineraries : [];
    const ranked = all.slice().sort((a, b) => {
      const aBus = (a.legs || []).some(l => l.mode !== 'WALK') ? 0 : 1;
      const bBus = (b.legs || []).some(l => l.mode !== 'WALK') ? 0 : 1;
      return aBus - bBus || a.durationMin - b.durationMin;
    });
    if (!ranked.length) { transitPanelStatus.textContent = 'No SCAT bus itinerary found for this trip.'; transitPanelBody.innerHTML = ''; return; }
    const fmtMin = n => `${Math.max(1, Math.round(n || 0))} min`;
    const fmtDist = m => { if (!m) return ''; if (m < 160) return `${Math.round(m * 3.28084)} ft`; return `${(m / METERS_PER_MILE).toFixed(1)} mi`; };
    const legLabel = leg => {
      if (leg.mode === 'WALK') return `Walk ${fmtMin(leg.durationMin)}${fmtDist(leg.distanceM) ? ` (${fmtDist(leg.distanceM)})` : ''}`;
      const route = leg.routeShortName || leg.route || 'Bus';
      let headsign = leg.headsign || '';
      if (headsign) { const esc = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); headsign = headsign.replace(new RegExp(`^${esc}\\s*[-:–]?\s*`, 'i'), ''); }
      return `${route}${headsign ? ` toward ${headsign}` : ''} · ${fmtMin(leg.durationMin)}`;
    };
    const cards = ranked.slice(0, 3).map(itin => {
      const legs = (itin.legs || []).map(leg => `<li style="display:flex;gap:.5rem;align-items:baseline;padding:.125rem 0;font-size:.8rem;color:#333;"><span aria-hidden="true" style="width:.5rem;height:.5rem;border-radius:50%;flex:none;background:${leg.mode === 'WALK' ? '#8a8a8e' : 'var(--color-accent)'};transform:translateY(-1px);"></span><span>${escapeHTML(legLabel(leg))}</span></li>`).join('');
      const transfers = itin.transfers ? `${itin.transfers} transfer${itin.transfers === 1 ? '' : 's'}` : 'no transfers';
      return `<div style="border:1px solid var(--color-line);border-radius:10px;padding:.625rem .75rem;margin-bottom:.5rem;background:var(--color-inset);"><strong style="font-size:.85rem;color:#111;">${fmtMin(itin.durationMin)}</strong><span style="font-size:.75rem;color:#555;"> · ${fmtMin(itin.walkTimeMin)} walking · ${transfers}</span><ul style="list-style:none;margin:.375rem 0 0;padding:0;">${legs}</ul></div>`;
    }).join('');
    const fallback = data.fallbackUrl || googleTransitUrl(toLat, toLng);
    transitPanelBody.innerHTML = `${cards}<a href="${fallback}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:.25rem;font-size:.8rem;font-weight:600;color:var(--color-accent);text-decoration:none;">Open in Google Maps ↗</a><p style="margin:.5rem 0 0;font-size:.72rem;color:#777;">Schedules: Space Coast Area Transit (GTFS). Times are estimates.</p>`;
    transitPanelStatus.textContent = `Bus options to ${destinationName || 'this location'} · departing now`;
  }

  async function planTransit(toLat, toLng, destinationName) {
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${toLat},${toLng}&travelmode=transit`;
    const cacheKey = transitCacheKey(toLat, toLng);
    const cached = readTransitCache(cacheKey);
    if (cached) return cached;
    const url = `${TRANSIT_API}?from=${location.lat},${location.lng}&to=${toLat},${toLng}&mode=TRANSIT,WALK`;
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(TRANSIT_TIMEOUT_MS) });
      const data = await response.json();
      const payload = { success: Boolean(data && data.success), itineraries: (data && data.itineraries) || [], fallbackUrl: (data && data.fallbackUrl) || fallbackUrl, error: (data && data.error) || '' };
      writeTransitCache(cacheKey, payload);
      return payload;
    } catch { return { success: false, itineraries: [], fallbackUrl, error: 'unavailable' }; }
  }

  async function showTransitRoutes(link) {
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    const toLat = Number(link.getAttribute('data-transit-lat'));
    const toLng = Number(link.getAttribute('data-transit-lng'));
    const name = link.getAttribute('data-transit-name') || 'this location';
    ensureTransitPanel();
    transitReturnFocus = document.activeElement;
    transitPanelBody.setAttribute('data-to-lat', String(toLat));
    transitPanelBody.setAttribute('data-to-lng', String(toLng));
    transitPanelBody.innerHTML = '';
    transitPanelStatus.textContent = `Finding SCAT bus routes to ${name}…`;
    transitPanel.classList.remove('hidden');
    transitPanelClose?.focus();
    const data = await planTransit(toLat, toLng, name);
    if (data.success && data.itineraries.length) { renderTransitItineraries(data, name, toLat, toLng); return; }
    window.open(data.fallbackUrl || googleTransitUrl(toLat, toLng), '_blank', 'noopener');
    closeTransitPanel();
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-transit]');
    if (!link) return;
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    e.preventDefault();
    showTransitRoutes(link);
  });

  // --- Print ---
  const printBtn = $('print-list');
  printBtn?.addEventListener('click', () => window.print());

  // --- Restore session ---
  if (radiusSelect && radius) radiusSelect.value = String(radius);
  if (distanceModeSelect) distanceModeSelect.value = roadMode;
  if (location && locationStatus) locationStatus.textContent = `Showing results near ${location.label} · straight-line distance (road distances load shortly)`;
  syncChips();
  updateSaveButtons();
  updateActiveFilterCount();
  updateSavedBar();

  render();
  if (location) upgradeRoadDistances();
})();