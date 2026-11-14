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

  try {
    savedIds = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    location = JSON.parse(sessionStorage.getItem(LOCATION_KEY) || 'null');
    radius = parseInt(sessionStorage.getItem(RADIUS_KEY) || '0', 10) || 0;
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
    if (!location) return parseFloat(item.getAttribute('data-distance') || '9999');
    const lat = parseFloat(item.getAttribute('data-lat'));
    const lng = parseFloat(item.getAttribute('data-lng'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 9999;
    return calculateDistanceMiles(location.lat, location.lng, lat, lng);
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
    render();
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

  /* ------------------------------------------------------------------ */
  /* Map                                                                 */
  /* ------------------------------------------------------------------ */

  function buildPopup(r) {
    const dest = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
    const directions = r.mobileOnly
      ? ''
      : `<a href="${dest}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:6px;background:#1717e5;color:#fff;padding:4px 10px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">Directions</a>`;
    return `
      <div style="min-width:200px;font-family:Inter,system-ui,sans-serif;">
        <strong style="color:#111;display:block;margin-bottom:2px;">${escapeHTML(r.name)}</strong>
        <span style="color:#555;font-size:12px;">${escapeHTML(r.address)}</span>
        ${directions}
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
})();
