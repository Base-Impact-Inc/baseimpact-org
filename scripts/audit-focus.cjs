// Focus-indicator audit using REAL keyboard navigation.
//
// Why not el.focus(): Chromium only matches :focus-visible for keyboard-driven
// focus, and this site draws its rings with :focus-visible. Programmatic focus
// therefore reports a false gap on every link. Here we reveal disclosure panels
// first, then walk the actual Tab order and inspect each stop's ring.
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:4321';
const DEFAULT_PAGES = ['/', '/directory', '/contact', '/donate', '/blog/lifepointe-scam-awareness', '/accessibility'];
const PAGES = process.env.ROUTES_FILE ? JSON.parse(require('fs').readFileSync(process.env.ROUTES_FILE, 'utf8')) : DEFAULT_PAGES;
const TABBABLE = 'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = {};
  for (const path of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Reveal disclosure panels so their links are genuinely visible/focusable.
    await page.evaluate(() => {
      document.querySelectorAll('[aria-expanded="false"]').forEach((b) => { try { b.click(); } catch { /* ignore */ } });
      document.querySelectorAll('details').forEach((d) => { d.open = true; });
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });

    const domTabbables = await page.evaluate((sel) => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0) || el.disabled) return false;
        let n = el;
        while (n) { const c = getComputedStyle(n); if (c.display === 'none' || c.visibility === 'hidden' || c.opacity === '0') return false; n = n.parentElement; }
        return true;
      };
      return [...document.querySelectorAll(sel)].map((el, i) => ({ i, visible: vis(el), label: el.tagName.toLowerCase() + (el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label').slice(0, 20)}]` : '') + ((el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24) ? ` "${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24)}"` : '') }));
    }, TABBABLE);

    const seen = new Set(), stops = [], invisible = [];
    for (let i = 0; i < 220; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(140);
      const info = await page.evaluate((sel) => {
        const el = document.activeElement;
        if (!el || el === document.body) return { tag: 'BODY' };
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName, label: (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 36),
          idx: [...document.querySelectorAll(sel)].indexOf(el),
          outline: cs.outlineStyle !== 'none' ? cs.outlineWidth + ' ' + cs.outlineColor : '', shadow: cs.boxShadow !== 'none' ? cs.boxShadow.slice(0, 40) : '',
          empty: el.children.length === 0 && !el.id && !String(el.className).trim(),
          rect: { x: Math.round(r.x), y: Math.round(r.y) },
        };
      }, TABBABLE);
      if (!info || info.tag === 'BODY') break;
      const hasRing = parseFloat(info.outline) >= 2 || /rgb|rgba/.test(info.shadow);
      if (!hasRing && !info.empty) invisible.push(`${info.tag} "${info.label}"`);
      const key = info.idx + '|' + info.rect.x + ',' + info.rect.y;
      if (!seen.has(key)) { seen.add(key); stops.push(info); }
      if (stops.length >= 220) break;
    }

    const reached = new Set(stops.map((s) => s.idx).filter((n) => n >= 0));
    const unreachable = domTabbables.filter((t) => t.visible && !reached.has(t.i)).map((t) => t.label);
    out[path] = {
      interactiveCount: domTabbables.filter((t) => t.visible).length,
      stopsReached: stops.length,
      noVisibleFocusChange: [...new Set(invisible)].length,
      offenders: [...new Set(invisible)].slice(0, 12),
      unreachableTabbables: unreachable.slice(0, 8),
      unreachableCount: unreachable.length,
      sampleStops: stops.slice(0, 6).map((s) => ({ tag: s.tag, label: s.label, outline: s.outline, shadow: s.shadow })),
    };
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
  const fails = Object.entries(out).filter(([, v]) => v.noVisibleFocusChange > 0 || v.unreachableCount > 0);
  console.log('\n=== FOCUS INDICATOR GAPS ===');
  if (!fails.length) console.log('none — every reached stop has a visible ring, every visible control is reachable by keyboard');
  fails.forEach(([p, v]) => console.log('GAP', p, 'noIndicator', v.noVisibleFocusChange, 'unreachable', v.unreachableCount, JSON.stringify(v.offenders.slice(0, 6))));
})();
