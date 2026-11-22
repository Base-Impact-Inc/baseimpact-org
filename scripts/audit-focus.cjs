// Per-element focus-indicator probe: an element "has a visible focus indicator" if focusing
// it changes outline / box-shadow / border-color / background vs its unfocused state.
// Usage: node scripts/audit-focus.cjs [baseUrl]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:4321';
const DEFAULT_PAGES = ['/', '/directory', '/contact', '/donate', '/blog/lifepointe-scam-awareness', '/accessibility'];
const PAGES = process.env.ROUTES_FILE ? JSON.parse(require('fs').readFileSync(process.env.ROUTES_FILE, 'utf8')) : DEFAULT_PAGES;

const PROPS = ['outlineWidth', 'outlineStyle', 'outlineColor', 'boxShadow', 'borderColor', 'backgroundColor', 'color'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = {};
  for (const path of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const res = await page.evaluate((PROPS) => {
      const sels = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';
      const els = [...document.querySelectorAll(sels)].filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !e.disabled;
      });
      const snap = (el) => {
        const c = getComputedStyle(el);
        const o = {};
        PROPS.forEach(p => o[p] = c[p]);
        return o;
      };
      const rows = [];
      for (const el of els) {
        const before = snap(el);
        el.focus();
        const after = snap(el);
        const changed = PROPS.filter(p => before[p] !== after[p]);
        const r = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        rows.push({
          tag,
          label: (el.getAttribute('aria-label') || (el.textContent || '').replace(/\s+/g, ' ').trim() || el.placeholder || el.value || '').slice(0, 36),
          href: el.getAttribute('href'),
          cls: (el.className || '').toString().slice(0, 40),
          changed,
          outline: after.outlineStyle !== 'none' ? after.outlineWidth + ' ' + after.outlineColor : '',
          shadow: after.boxShadow !== 'none' ? after.boxShadow.slice(0, 50) : '',
          visible: r.width > 0 && r.height > 0
        });
        el.blur();
      }
      return { total: rows.length, rows };
    }, PROPS);

    const noIndicator = res.rows.filter(r => !r.changed.length);
    out[path] = {
      interactiveCount: res.total,
      noVisibleFocusChange: noIndicator.length,
      offenders: noIndicator.slice(0, 12),
      samples: res.rows.slice(0, 6).map(r => ({ tag: r.tag, label: r.label, changed: r.changed, outline: r.outline, shadow: r.shadow }))
    };
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
  const fails = Object.entries(out).filter(([, v]) => v.noVisibleFocusChange > 0);
  console.log('\n=== FOCUS INDICATOR GAPS ===');
  if (!fails.length) console.log('none — every interactive element changes appearance on focus');
  fails.forEach(([p, v]) => console.log('GAP', p, v.noVisibleFocusChange + '/' + v.interactiveCount, JSON.stringify(v.offenders.slice(0, 6))));
  process.exit(fails.length ? 1 : 0);
})();
