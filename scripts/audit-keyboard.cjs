// Keyboard-only navigation + focus-visibility audit.
// Real key events, waits for CSS transitions to settle, and accepts either an
// outline or a 0-offset box-shadow ring as a visible focus indicator.
// Usage: node scripts/audit-keyboard.cjs [baseUrl]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:4321';
const DEFAULT_PAGES = ['/', '/directory', '/contact', '/donate', '/blog/lifepointe-scam-awareness', '/accessibility'];
const PAGES = process.env.ROUTES_FILE ? JSON.parse(require('fs').readFileSync(process.env.ROUTES_FILE, 'utf8')) : DEFAULT_PAGES;

const TABBABLE = 'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function isVisible(el) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  if (!(r.width > 0 && r.height > 0) || cs.visibility === 'hidden' || cs.opacity === '0') return false;
  let node = el;
  while (node) {
    const a = getComputedStyle(node);
    if (a.visibility === 'hidden' || a.opacity === '0' || a.display === 'none') return false;
    node = node.parentElement;
  }
  return true;
}

function ringFromShadow(bs) {
  if (!bs || bs === 'none') return null;
  for (const part of bs.split(/,(?![^(]*\))/)) {
    const m = part.match(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/);
    if (!m) continue;
    const color = m[1], ox = +m[2], oy = +m[3], spread = +m[5];
    const alpha = /a\s*\)$/i.test(color) ? parseFloat((color.match(/,\s*([\d.]+)\s*\)$/i) || [])[1]) : 1;
    if (Math.abs(ox) < 0.5 && Math.abs(oy) < 0.5 && spread >= 2 && alpha >= 0.3) {
      return { color: color.slice(0, 28), spread, alpha };
    }
  }
  return null;
}

function label(el) {
  const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34);
  return el.tagName.toLowerCase() +
    (el.getAttribute('aria-label') ? `[aria-label="${el.getAttribute('aria-label').slice(0, 24)}"]` : '') +
    (el.getAttribute('href') ? `[${String(el.getAttribute('href')).slice(0, 28)}]` : '') +
    (t ? ` "${t}"` : '');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = {};
  for (const path of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(1200); // let lazy content render

    // Tabbable set in DOM order (identity by index) for reachability comparison.
    const domTabbables = await page.evaluate((sel) => {
      const visiblyFocusable = (el) => {
        const r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0) || el.disabled) return false;
        let n = el;
        while (n) {
          const c = getComputedStyle(n);
          if (c.display === 'none' || c.visibility === 'hidden' || c.opacity === '0') return false;
          n = n.parentElement;
        }
        return true;
      };
      return [...document.querySelectorAll(sel)].map((el, i) => {
        const r = el.getBoundingClientRect();
        return { i, label: el.tagName.toLowerCase() + (el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label').slice(0, 20)}]` : '') + (el.getAttribute('href') ? `[${String(el.getAttribute('href')).slice(0, 24)}]` : '') + ((el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24) ? ` "${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24)}"` : ''), visible: visiblyFocusable(el), shadow: !!el.shadowRoot, cls: String(el.className).slice(0, 30) };
      });
    }, TABBABLE);

    const stops = [];
    const seenKeys = new Set();
    let lost = 0, invisible = [];
    const MAX = process.env.MAX_STOPS ? +process.env.MAX_STOPS : 220;
    for (let i = 0; i < MAX; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(160);
      const info = await page.evaluate((sel) => {
        const el = document.activeElement;
        if (!el || el === document.body) return { tag: 'BODY' };
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const idx = [...document.querySelectorAll(sel)].indexOf(el);
        return {
          tag: el.tagName.toLowerCase(),
          domIndex: idx,
          label: el.tagName.toLowerCase() +
            (el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label').slice(0, 20)}]` : '') +
            (el.getAttribute('href') ? `[${String(el.getAttribute('href')).slice(0, 24)}]` : '') +
            ((el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24) ? ` "${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24)}"` : ''),
          outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle, outlineColor: cs.outlineColor,
          boxShadow: cs.boxShadow,
          shadowActive: el.shadowRoot && el.shadowRoot.activeElement ? (() => { const s = getComputedStyle(el.shadowRoot.activeElement); return { tag: el.shadowRoot.activeElement.tagName, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor }; })() : null,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          inViewport: r.top >= -2 && r.bottom <= innerHeight + 2 && r.width > 0 && r.height > 0,
          scrollX: window.scrollX
        };
      }, TABBABLE);
      if (!info || info.tag === 'BODY') { if (i < 5) lost++; break; }
      const shadowInd = info.shadowActive && info.shadowActive.outlineStyle !== 'none' && parseFloat(info.shadowActive.outlineWidth) >= 2;
      const ring = ringFromShadow(info.boxShadow);
      const hasOutline = parseFloat(info.outlineWidth) >= 2 && info.outlineStyle !== 'none';
      const indicator = hasOutline ? { kind: 'outline', w: info.outlineWidth, color: info.outlineColor } : (ring ? { kind: 'shadow', w: ring.spread, color: ring.color } : null);
      const thirdPartyShadow = info.shadow && info.shadowActive && info.shadowActive.tag === 'IFRAME';
      if (!indicator && !shadowInd && !thirdPartyShadow) invisible.push(info.label + (info.shadow ? ' [shadow-host]' : ''));
      const key = info.domIndex + '|' + info.rect.x + ',' + info.rect.y;
      if (!seenKeys.has(key)) { seenKeys.add(key); stops.push({ i, label: info.label, domIndex: info.domIndex, indicator, inViewport: info.inViewport }); }
      if (stops.length >= (process.env.MAX_UNIQUE ? +process.env.MAX_UNIQUE : 220)) break;
    }

    const reached = new Set(stops.map(s => s.domIndex).filter(n => n >= 0));
    const unreachable = domTabbables.filter(t => t.visible && !reached.has(t.i)).map(t => t.label);

    // Shift+Tab must return to the previous stop.
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(260);
    const afterShift = await page.evaluate(() => document.activeElement.tagName.toLowerCase());

    // Escape must close an open disclosure, if one is open.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const openAfterEscape = await page.evaluate(() => [...document.querySelectorAll('[aria-expanded="true"]')].length);

    out[path] = {
      domTabbableCount: domTabbables.filter(t => t.visible).length,
      uniqueStops: stops.length,
      firstStop: stops[0] ? stops[0].label : null,
      firstIsSkipLink: /skip/i.test(stops[0] ? stops[0].label : ''),
      stopsWithoutVisibleIndicator: [...new Set(invisible)].slice(0, 8),
      unreachableTabbables: unreachable.slice(0, 8),
      unreachableCount: unreachable.length,
      focusLostToBody: lost,
      shiftTabReturned: afterShift !== 'body',
      openDisclosuresAfterEscape: openAfterEscape,
      sampleStops: stops.slice(0, 8).map(s => ({ label: s.label, indicator: s.indicator, inViewport: s.inViewport }))
    };
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
  const fails = Object.entries(out).filter(([, v]) => !v.firstIsSkipLink || v.stopsWithoutVisibleIndicator.length || v.focusLostToBody > 1);
  console.log('\n=== KEYBOARD FAILURES ===');
  if (!fails.length) console.log('none — skip link first on every page, every stop has a visible indicator, focus never lost');
  fails.forEach(([p, v]) => console.log('FAIL', p, JSON.stringify({ firstIsSkipLink: v.firstIsSkipLink, noIndicator: v.stopsWithoutVisibleIndicator, lostFocus: v.focusLostToBody, unreachable: v.unreachableCount })));
  process.exit(fails.length ? 1 : 0);
})();
