/**
 * Directory client — self-contained.
 *
 * Everything this script needs comes from the DOM: the server renders every
 * listing as a `.resource-item` with data attributes, and embeds the same rows
 * as JSON in `#resource-data` for the map. No external globals required.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const grid = $('resource-grid');
  if (!grid) return;

  const items = Array.from(document.querySelectorAll('.resource-item'));
  const chips = Array.from(document.querySelectorAll('#filter-chips button'));
  const mapChips = Array.from(document.querySelectorAll('.map-legend-chip'));
  const countEl = $('results-count');
  const emptyState = $('empty-state');
  const loadMoreBtn = $('load-more');
  const pagination = $('pagination');
  const viewListBtn = $('view-list');
  const viewMapBtn = $('view-map');
  const mapContainer = $('map-container');
  const mapLegend = $('map-legend');
  const searchInput = $('search-input');
  const openNowCheckbox = $('open-now');
  const stateFilter = $('state-filter');
  const zipInput = $('zip-input');
  const useLocationBtn = $('use-location-btn');
  const radiusSelect = $('radius-select');
  const locationStatus = $('location-status');
  const saveAllBtn = $('save-all-btn');
  const printListBtn = $('print-list');

  let cardData = [];
  try {
    cardData = JSON.parse($('resource-data')?.textContent || '[]');
  } catch {
    cardData = [];
  }

  const PAGE_SIZE = 12;
  const LOCATION_KEY = 'baseimpact-location';
  const RADIUS_KEY = 'baseimpact-radius';
  const SAVED_KEY = 'baseimpact-saved';

  /* Road-distance upgrade: public OSRM (no key, no hosting). Haversine stays
     as the instant sort AND as the fallback when the public server fails. */
  const ROAD_DISTANCE_KEY = 'baseimpact-road-distance-v1';
  const ROAD_MODE_KEY = 'baseimpact-road-mode';
  const ROAD_PROFILES = { driving: 'routed-car', walking: 'routed-foot' };
  const ROAD_BASES = [
    'https://routing.openstreetmap.de', // FOSSGIS: car + foot profiles
    'https://router.project-osrm.org',  // OSRM demo: fallback when FOSSGIS rate-limits
  ];
  const ROAD_LIMIT = 20;
  const ROAD_TTL_MS = 60 * 60 * 1000;
  const METERS_PER_MILE = 1609.344;

  /* Transit: SCAT schedules routed by a self-hosted OpenTripPlanner instance.
     The endpoint always returns a Google Maps transit fallback URL, so any
     failure degrades to a normal Google Maps directions link. */
  const TRANSIT_API = 'https://otp.douglaspc.com/api/otp/route';
  const TRANSIT_CACHE_KEY = 'baseimpact-transit-v1';
  const TRANSIT_TTL_MS = 5 * 60 * 1000;
  const TRANSIT_TIMEOUT_MS = 8000;

  let visibleCount = PAGE_SIZE;
  let activeGroup = 'all';
  let activeState = 'all';
  let query = '';
  let openOnly = false;
  let location = null;
  let radius = 0;
  let savedIds = [];
  let map = null;
  let markerLayer = null;
  let mapInitialised = false;
  let currentMapGroup = 'all';
  let roadMode = 'driving';
  let roadDistances = new Map();
  let roadUpgradeSeq = 0;

  try {
    savedIds = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    location = JSON.parse(sessionStorage.getItem(LOCATION_KEY) || 'null');
    radius = parseInt(sessionStorage.getItem(RADIUS_KEY) || '0', 10) || 0;
    const storedMode = sessionStorage.getItem(ROAD_MODE_KEY);
    if (storedMode && Object.prototype.hasOwnProperty.call(ROAD_PROFILES, storedMode)) {
      roadMode = storedMode;
    }
  } catch {
    /* ignore malformed storage */
  }

  /* ------------------------------------------------------------------ */
  /* Distance                                                            */
  /* ------------------------------------------------------------------ */

  function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
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

  /* ------------------------------------------------------------------ */
  /* Road distances — public OSRM, with Haversine fallback              */
  /* ------------------------------------------------------------------ */

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
    } catch {
      return null;
    }
  }

  function writeRoadCache(origin, ids, distances) {
    try {
      sessionStorage.setItem(
        roadCacheKey(origin, ids),
        JSON.stringify({ distances, timestamp: Date.now() }),
      );
    } catch {
      /* storage disabled or full — caching is best-effort */
    }
  }

  function clearRoadDistances() {
    roadDistances = new Map();
  }

  function setDistanceStatus(ok) {
    if (!locationStatus || !location) return;
    const base = location.label ? `Showing results near ${location.label}` : '';
    const note = ok
      ? ` · road distance (${roadMode})`
      : ' · road distance unavailable, showing straight-line';
    locationStatus.textContent = base + note;
  }

  async function upgradeRoadDistances() {
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    const profile = ROAD_PROFILES[roadMode];
    if (!profile) return;

    // Haversine still sorts everything instantly; upgrade only the closest few.
    const candidates = items
      .filter((item) => {
        const lat = parseFloat(item.getAttribute('data-lat'));
        const lng = parseFloat(item.getAttribute('data-lng'));
        return Number.isFinite(lat) && Number.isFinite(lng);
      })
      .sort((a, b) => itemDistance(a) - itemDistance(b))
      .slice(0, ROAD_LIMIT);

    if (candidates.length === 0) return;

    const ids = candidates.map((item) => item.getAttribute('data-resource-id') || '');
    const seq = ++roadUpgradeSeq;

    const cached = readRoadCache(location, ids);
    if (cached) {
      ids.forEach((id, i) => {
        const d = cached[id];
        if (Number.isFinite(d)) roadDistances.set(id, d);
      });
      render();
      setDistanceStatus(true);
      return;
    }

    // OSRM expects lng,lat; one origin row -> N destination columns.
    const coords = [
      `${location.lng},${location.lat}`,
      ...candidates.map((item) => `${item.getAttribute('data-lng')},${item.getAttribute('data-lat')}`),
    ].join(';');
    const destinations = candidates.map((_, i) => i + 1).join(';');
    const urls = ROAD_BASES.map((base) => {
      // The OSRM demo server only exposes the driving profile.
      const profile = base.includes('openstreetmap.de') ? ROAD_PROFILES[roadMode] : 'driving';
      return (
        `${base}/${profile}/table/v1/driving/${coords}` +
        `?sources=0&destinations=${destinations}&annotations=distance,duration`
      );
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
        } catch (err) {
          lastError = err;
        } finally {
          clearTimeout(timer);
        }
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
      if (seq !== roadUpgradeSeq) return; // a newer location/mode request won
      writeRoadCache(location, ids, distances);
      render();
      setDistanceStatus(true);
    } catch (err) {
      if (seq !== roadUpgradeSeq) return;
      console.warn('Road-distance upgrade failed; keeping straight-line distances:', err);
      setDistanceStatus(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Filtering + pagination                                              */
  /* ------------------------------------------------------------------ */

  function matches(item) {
    const group = item.dataset.group || '';
    const name = item.dataset.name || '';
    const desc = item.dataset.desc || '';
    const tags = item.dataset.tags || '';
    const isOpen = item.dataset.open === '1';
    const itemState = item.dataset.state || '';
    const id = item.getAttribute('data-resource-id') || '';

    const matchesGroup =
      activeGroup === 'all' ||
      group === activeGroup ||
      (activeGroup === 'saved' && savedIds.includes(id));
    const matchesSearch =
      !query || name.includes(query) || desc.includes(query) || tags.includes(query);
    const matchesOpen = !openOnly || isOpen;
    const matchesState = activeState === 'all' || itemState === activeState;

    let distance = 9999;
    if (location) {
      distance = itemDistance(item);
      if (radius > 0 && distance > radius) return false;
    }

    return matchesGroup && matchesSearch && matchesOpen && matchesState;
  }

  function render() {
    let matched = items.filter(matches);

    if (location) {
      matched.sort((a, b) => itemDistance(a) - itemDistance(b));
      matched.forEach((item) => {
        const d = itemDistance(item);
        const span = item.querySelector('.distance-miles');
        if (span) span.textContent = d >= 9999 ? 'No map' : `${d.toFixed(1)} mi`;
        item.setAttribute('data-distance', String(d));
      });
      matched.forEach((item) => grid.appendChild(item));
    }

    const total = matched.length;
    matched.forEach((item, index) => {
      item.classList.toggle('hidden', index >= visibleCount);
    });
    items.forEach((item) => {
      if (!matched.includes(item)) item.classList.add('hidden');
    });

    if (countEl) countEl.textContent = `${total} result${total !== 1 ? 's' : ''}`;
    if (emptyState) emptyState.classList.toggle('hidden', total > 0);
    grid.classList.toggle('hidden', total === 0);

    const remaining = total - visibleCount;
    if (pagination) pagination.classList.toggle('hidden', total <= PAGE_SIZE);
    if (loadMoreBtn) {
      loadMoreBtn.disabled = remaining <= 0;
      loadMoreBtn.textContent = remaining > 0 ? `Load more (${remaining} left)` : 'All results shown';
    }
  }

  loadMoreBtn?.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    render();
  });

  searchInput?.addEventListener('input', () => {
    query = (searchInput.value || '').toLowerCase().trim();
    visibleCount = PAGE_SIZE;
    clearTimeout(window.__searchLogTimer);
    window.__searchLogTimer = setTimeout(() => {
      if (query.length < 2) return;
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, results_count: items.length }),
      }).catch(() => {});
    }, 1500);
    render();
  });

  openNowCheckbox?.addEventListener('change', () => {
    openOnly = openNowCheckbox.checked;
    render();
  });

  stateFilter?.addEventListener('change', () => {
    activeState = stateFilter.value || 'all';
    render();
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeGroup = chip.getAttribute('data-group') || 'all';
      syncChips();
      render();
    });
  });

  function syncChips() {
    chips.forEach((chip) => {
      const active = chip.getAttribute('data-group') === activeGroup;
      chip.classList.toggle('bg-fill', active);
      chip.classList.toggle('text-on-fill', active);
      chip.classList.toggle('bg-inset', !active);
      chip.classList.toggle('text-body', !active);
    });
  }

  saveAllBtn?.addEventListener('click', () => {
    activeGroup = activeGroup === 'saved' ? 'all' : 'saved';
    syncChips();
    render();
  });

  printListBtn?.addEventListener('click', () => window.print());

  /* ------------------------------------------------------------------ */
  /* Saved list                                                          */
  /* ------------------------------------------------------------------ */

  function updateSaveBtn(btn, saved) {
    btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
    btn.classList.toggle('text-accent', saved);
    btn.classList.toggle('text-muted', !saved);
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
  }

  document.querySelectorAll('.save-btn').forEach((btn) => {
    const id = btn.getAttribute('data-resource-id');
    updateSaveBtn(btn, savedIds.includes(id));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = savedIds.indexOf(id);
      if (idx >= 0) savedIds.splice(idx, 1);
      else savedIds.push(id);
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
      updateSaveBtn(btn, savedIds.includes(id));
      if (activeGroup === 'saved') render();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Copy address                                                        */
  /* ------------------------------------------------------------------ */

  document.addEventListener('click', async (e) => {
    const btn = e.target?.closest?.('.copy-addr-btn');
    if (!btn) return;
    const addr = btn.getAttribute('data-copy-address') || '';
    try {
      await navigator.clipboard.writeText(addr);
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
      btn.textContent = 'Copy failed';
      setTimeout(() => { btn.textContent = 'Copy address'; }, 1500);
    }
  });

  /* ------------------------------------------------------------------ */
  /* Location + radius                                                   */
  /* ------------------------------------------------------------------ */

  function setLocation(loc, label) {
    location = loc;
    sessionStorage.setItem(LOCATION_KEY, JSON.stringify({ lat: loc.lat, lng: loc.lng, label }));
    if (locationStatus) locationStatus.textContent = label ? `Showing results near ${label}` : '';
    visibleCount = PAGE_SIZE;
    clearRoadDistances();
    render();
    upgradeRoadDistances();
  }

  async function geocodeZip(zip) {
    const res = await fetch(`/api/geocode?zip=${encodeURIComponent(zip)}`);
    if (!res.ok) throw new Error('ZIP not found');
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  zipInput?.addEventListener('keydown', async (e) => {
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
      (pos) => {
        setLocation(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          'your current location',
        );
      },
      () => {
        if (locationStatus) locationStatus.textContent = 'Could not get your location. Enter a ZIP code instead.';
      },
      { timeout: 10000 },
    );
  });

  radiusSelect?.addEventListener('change', () => {
    radius = parseInt(radiusSelect.value || '0', 10) || 0;
    sessionStorage.setItem(RADIUS_KEY, String(radius));
    render();
  });

  const distanceModeSelect = $('distance-mode');
  if (distanceModeSelect) {
    distanceModeSelect.value = roadMode;
    distanceModeSelect.addEventListener('change', () => {
      const next = distanceModeSelect.value;
      if (!Object.prototype.hasOwnProperty.call(ROAD_PROFILES, next)) return;
      roadMode = next;
      try {
        sessionStorage.setItem(ROAD_MODE_KEY, roadMode);
      } catch {
        /* best-effort */
      }
      roadUpgradeSeq += 1; // invalidate any in-flight request
      clearRoadDistances();
      render();
      upgradeRoadDistances();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Map                                                                 */
  /* ------------------------------------------------------------------ */

  function buildPopup(r) {
    const base = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
    const hasCoords = r.lat && r.lng;
    const modes = hasCoords
      ? [
          { mode: 'walking', label: 'Walk', "aria": 'Open walking directions', icon: '<svg class="inline size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="13" cy="2" r="2"/><circle cx="13" cy="18" r="2"/><path d="M13 6l-2-4h4l-2-4"/><path d="M11 11h2"/></svg>' },
          { mode: 'transit', label: 'Bus', "aria": 'Open transit directions (SCAT)', icon: '<svg class="inline size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 11h18"/></svg>' },
          { mode: 'driving', label: 'Drive', "aria": 'Open driving directions', icon: '<svg class="inline size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 11 3 3 3 11"/><path d="M13.5 8.5L19 2l1.5 8L23 16l-6-4-6 4 1.5 8z"/></svg>' }
        ]
      : [];

    const directionsHtml = modes.map(m => `
      <a
        href="${base}&travelmode=${m.mode}"
        target="_blank"
        rel="noreferrer"
        aria-label="${m.aria} to ${escapeHTML(r.name)}"
        class="direction-pill"
        ${m.mode === 'transit' ? `data-transit="1" data-transit-lat="${Number(r.lat)}" data-transit-lng="${Number(r.lng)}" data-transit-name="${escapeHTML(r.name)}"` : ''}
        style="
          display:inline-flex;
          align-items:center;
          gap:0.375rem;
          padding:0.375rem 0.75rem;
          border-radius:9999px;
          font-size:0.75rem;
          font-weight:600;
          text-decoration:none;
          color:var(--color-body);
          background:var(--color-card);
          border:1px solid var(--color-line);
          transition:background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
        "
        onmouseover="this.style.background='var(--color-inset)';this.style.borderColor='var(--color-accent)';"
        onmouseout="this.style.background='var(--color-card)';this.style.borderColor='var(--color-line)';"
        onmousedown="this.style.transform='scale(0.96)';"
        onmouseup="this.style.transform='scale(1)';"
      >
        ${m.icon}
        ${m.label}
      </a>
    `).join('');

    return `
      <div style="min-width:200px;font-family:Inter,system-ui,sans-serif;">
        <strong style="color:#111;display:block;margin-bottom:2px;">${escapeHTML(r.name)}</strong>
        <span style="color:#555;font-size:12px;">${escapeHTML(r.address)}</span>
        ${hasCoords ? `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:8px;">${directionsHtml}</div>` : ''}
      </div>`;
  }


  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function initMap() {
    if (mapInitialised) return;
    mapInitialised = true;
    if (typeof L === 'undefined') {
      setTimeout(initMap, 200);
      return;
    }

    map = L.map('map-container', { scrollWheelZoom: false }).setView([28.0836, -80.6081], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);
    const bounds = [];

    cardData.forEach((r) => {
      const lat = Number(r.lat);
      const lng = Number(r.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;
      const marker = L.marker([lat, lng]);
      marker.bindPopup(buildPopup(r));
      marker._group = r.group || 'all';
      marker.addTo(markerLayer);
      bounds.push([lat, lng]);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    if (mapLegend) mapLegend.classList.remove('hidden');
    mapLegend?.querySelectorAll('.map-legend-chip').forEach((chip) => {
      chip.addEventListener('click', () => filterMap(chip.getAttribute('data-mapgroup') || 'all'));
    });
    filterMap(currentMapGroup);
  }

  function filterMap(group) {
    currentMapGroup = group;
    mapChips.forEach((chip) => {
      const active = chip.getAttribute('data-mapgroup') === group;
      chip.classList.toggle('bg-fill', active);
      chip.classList.toggle('text-on-fill', active);
      chip.classList.toggle('bg-inset', !active);
      chip.classList.toggle('text-body', !active);
    });
    if (!markerLayer) return;
    markerLayer.eachLayer((layer) => {
      const show = group === 'all' || layer._group === group;
      if (show) layer.addTo(markerLayer);
      else markerLayer.removeLayer(layer);
    });
  }

  function showList() {
    mapContainer?.classList.add('hidden');
    mapLegend?.classList.add('hidden');
    grid?.classList.remove('hidden');
    pagination?.classList.remove('hidden');
    viewListBtn?.classList.add('bg-fill', 'text-on-fill');
    viewListBtn?.classList.remove('bg-inset', 'text-body');
    viewMapBtn?.classList.remove('bg-fill', 'text-on-fill');
    viewMapBtn?.classList.add('bg-inset', 'text-body');
  }

  function showMap() {
    mapContainer?.classList.remove('hidden');
    mapLegend?.classList.remove('hidden');
    grid?.classList.add('hidden');
    pagination?.classList.add('hidden');
    viewMapBtn?.classList.add('bg-fill', 'text-on-fill');
    viewMapBtn?.classList.remove('bg-inset', 'text-body');
    viewListBtn?.classList.remove('bg-fill', 'text-on-fill');
    viewListBtn?.classList.add('bg-inset', 'text-body');
    if (!mapInitialised) setTimeout(initMap, 200);
    if (map) setTimeout(() => map.invalidateSize(), 250);
  }

  /* ------------------------------------------------------------------ */
  /* Transit (SCAT schedules via self-hosted OpenTripPlanner)            */
  /* ------------------------------------------------------------------ */

  let transitPanel = null;
  let transitPanelClose = null;
  let transitPanelStatus = null;
  let transitPanelBody = null;
  let transitReturnFocus = null;

  function googleTransitUrl(toLat, toLng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLng}&travelmode=transit`;
  }

  function transitCacheKey(toLat, toLng) {
    const origin = location && Number.isFinite(location.lat)
      ? `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`
      : 'current-location';
    return `${TRANSIT_CACHE_KEY}|${origin}>${Number(toLat).toFixed(5)},${Number(toLng).toFixed(5)}`;
  }

  function readTransitCache(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data || Date.now() - parsed._t > TRANSIT_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  function writeTransitCache(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ _t: Date.now(), data }));
    } catch {
      /* storage full/blocked — caching is best-effort */
    }
  }

  function closeTransitPanel() {
    if (!transitPanel) return;
    transitPanel.classList.add('hidden');
    if (transitReturnFocus && typeof transitReturnFocus.focus === 'function') {
      transitReturnFocus.focus();
    }
    transitReturnFocus = null;
  }

  function ensureTransitPanel() {
    if (transitPanel) return;
    transitPanel = document.createElement('div');
    transitPanel.id = 'transit-panel';
    transitPanel.className = 'hidden';
    transitPanel.setAttribute('role', 'dialog');
    transitPanel.setAttribute('aria-modal', 'false');
    transitPanel.setAttribute('aria-labelledby', 'transit-panel-title');
    transitPanel.style.cssText = [
      'position:fixed', 'inset-inline:1rem', 'bottom:1rem', 'z-index:2000',
      'max-width:26rem', 'margin-inline:auto', 'padding:1rem',
      'border-radius:14px', 'background:var(--color-card,#fff)',
      'border:1px solid var(--color-line,#e3e3e8)', 'box-shadow:0 12px 32px rgba(0,0,0,.18)',
      'font-family:Inter,system-ui,sans-serif', 'color:var(--color-body,#111)',
      'max-height:min(70vh,34rem)', 'overflow:auto',
    ].join(';');

    transitPanel.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;">
        <h2 id="transit-panel-title" style="margin:0;font-size:.95rem;line-height:1.3;color:#111;">Bus routes</h2>
        <button type="button" id="transit-panel-close" aria-label="Close bus routes"
          style="border:0;background:transparent;font-size:1.35rem;line-height:1;cursor:pointer;padding:.125rem .375rem;color:#555;border-radius:6px;"
        >&times;</button>
      </div>
      <p id="transit-panel-status" role="status" aria-live="polite"
         style="margin:.375rem 0 0;font-size:.8rem;color:#555;"></p>
      <div id="transit-panel-body" style="margin-top:.5rem;"></div>
    `;

    document.body.appendChild(transitPanel);
    transitPanelClose = $('transit-panel-close');
    transitPanelStatus = $('transit-panel-status');
    transitPanelBody = $('transit-panel-body');

    transitPanelClose.addEventListener('click', closeTransitPanel);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !transitPanel.classList.contains('hidden')) {
        closeTransitPanel();
      }
    });
  }

  function renderTransitItineraries(data, destinationName, toLat, toLng) {
    const all = Array.isArray(data.itineraries) ? data.itineraries : [];
    // Prefer itineraries that actually ride the bus; keep walk-only as last resort.
    const ranked = all.slice().sort((a, b) => {
      const aBus = (a.legs || []).some((l) => l.mode !== 'WALK') ? 0 : 1;
      const bBus = (b.legs || []).some((l) => l.mode !== 'WALK') ? 0 : 1;
      return aBus - bBus || a.durationMin - b.durationMin;
    });

    if (!ranked.length) {
      transitPanelStatus.textContent = 'No SCAT bus itinerary found for this trip.';
      transitPanelBody.innerHTML = '';
      return;
    }

    const fmtMin = (n) => `${Math.max(1, Math.round(n || 0))} min`;
    const fmtDist = (m) => {
      if (!m) return '';
      if (m < 160) return `${Math.round(m * 3.28084)} ft`;
      return `${(m / METERS_PER_MILE).toFixed(1)} mi`;
    };

    const legLabel = (leg) => {
      if (leg.mode === 'WALK') {
        return `Walk ${fmtMin(leg.durationMin)}${fmtDist(leg.distanceM) ? ` (${fmtDist(leg.distanceM)})` : ''}`;
      }
      const route = leg.routeShortName || leg.route || 'Bus';
      let headsign = leg.headsign || '';
      if (headsign) {
        const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        headsign = headsign.replace(new RegExp(`^${escaped}\\s*[-:–]?\\s*`, 'i'), '');
      }
      const suffix = headsign ? ` toward ${headsign}` : '';
      return `${route}${suffix} · ${fmtMin(leg.durationMin)}`;
    };

    const cards = ranked.slice(0, 3).map((itin) => {
      const legs = (itin.legs || []).map((leg) => `
        <li style="display:flex;gap:.5rem;align-items:baseline;padding:.125rem 0;font-size:.8rem;color:#333;">
          <span aria-hidden="true" style="width:.5rem;height:.5rem;border-radius:50%;flex:none;background:${
            leg.mode === 'WALK' ? '#8a8a8e' : 'var(--color-accent,#3f3fd8)'
          };transform:translateY(-1px);"></span>
          <span>${escapeHTML(legLabel(leg))}</span>
        </li>`).join('');
      const transfers = itin.transfers
        ? `${itin.transfers} transfer${itin.transfers === 1 ? '' : 's'}`
        : 'no transfers';
      return `
        <div style="border:1px solid var(--color-line,#e3e3e8);border-radius:10px;padding:.625rem .75rem;margin-bottom:.5rem;background:var(--color-inset,#fafafa);">
          <strong style="font-size:.85rem;color:#111;">${fmtMin(itin.durationMin)}</strong>
          <span style="font-size:.75rem;color:#555;"> · ${fmtMin(itin.walkTimeMin)} walking · ${transfers}</span>
          <ul style="list-style:none;margin:.375rem 0 0;padding:0;">${legs}</ul>
        </div>`;
    }).join('');

    const fallback = data.fallbackUrl || googleTransitUrl(toLat, toLng);

    transitPanelBody.innerHTML = `
      ${cards}
      <a href="${fallback}" target="_blank" rel="noreferrer"
         style="display:inline-block;margin-top:.25rem;font-size:.8rem;font-weight:600;color:var(--color-accent,#3f3fd8);text-decoration:none;">
        Open in Google Maps ↗
      </a>
      <p style="margin:.5rem 0 0;font-size:.72rem;color:#777;">
        Schedules: Space Coast Area Transit (GTFS). Times are estimates.
      </p>
    `;
    transitPanelStatus.textContent =
      `Bus options to ${destinationName || 'this location'} · departing now`;
  }

  async function planTransit(toLat, toLng, destinationName) {
    // The Google Maps link carries both ends, so the fallback stays accurate
    // even when the routing service never answered.
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1`
      + `&origin=${location.lat},${location.lng}`
      + `&destination=${toLat},${toLng}&travelmode=transit`;
    const cacheKey = transitCacheKey(toLat, toLng);
    const cached = readTransitCache(cacheKey);
    if (cached) return cached;

    const url = `${TRANSIT_API}?from=${location.lat},${location.lng}&to=${toLat},${toLng}&mode=TRANSIT,WALK`;
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(TRANSIT_TIMEOUT_MS),
      });
      const data = await response.json();
      const payload = {
        success: Boolean(data && data.success),
        itineraries: (data && data.itineraries) || [],
        fallbackUrl: (data && data.fallbackUrl) || fallbackUrl,
        error: (data && data.error) || '',
      };
      writeTransitCache(cacheKey, payload);
      return payload;
    } catch {
      return { success: false, itineraries: [], fallbackUrl, error: 'unavailable' };
    }
  }

  async function showTransitRoutes(link) {
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
      return; // no origin known — let the plain Google Maps link handle it
    }

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
    transitPanelClose.focus();

    const data = await planTransit(toLat, toLng, name);
    if (data.success && data.itineraries.length) {
      renderTransitItineraries(data, name, toLat, toLng);
      return;
    }
    // Graceful degradation: open Google Maps transit in a new tab.
    window.open(data.fallbackUrl || googleTransitUrl(toLat, toLng), '_blank', 'noopener');
    closeTransitPanel();
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-transit]');
    if (!link) return;
    // Without a known origin we cannot query OTP; let the Google Maps link work.
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    event.preventDefault();
    showTransitRoutes(link);
  });

  viewListBtn?.addEventListener('click', showList);
  viewMapBtn?.addEventListener('click', showMap);

  /* ------------------------------------------------------------------ */
  /* Restore saved session state                                         */
  /* ------------------------------------------------------------------ */

  if (radiusSelect && radius) radiusSelect.value = String(radius);
  if (location && locationStatus) {
    locationStatus.textContent = `Showing results near ${location.label}`;
  }
  render();
  if (location) upgradeRoadDistances();
})();
