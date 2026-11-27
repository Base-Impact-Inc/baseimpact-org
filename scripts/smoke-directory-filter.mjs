/**
 * Directory filter smoke test.
 *
 * Run: node scripts/smoke-directory-filter.mjs
 * Optional: BASE_URL=https://baseimpact.org node scripts/smoke-directory-filter.mjs
 *
 * Requires Chrome at /usr/bin/google-chrome and a Playwright install
 * (local devDependency or the global @playwright/cli install).
 */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = await import('/home/eric/.npm-global/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'));
}

const base = process.env.BASE_URL || 'https://baseimpact.org';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
// Turnstile 110200 is expected in local `astro dev` without a site key.
page.on('pageerror', (e) => { const m = String(e); if (!m.includes('110200')) errors.push(m); });

const state = async () => page.evaluate(() => ({
  count: Number((document.querySelector('#results-count')?.textContent || '').match(/\d+/)?.[0] || 0),
  visible: document.querySelectorAll('.resource-item:not(.hidden)').length,
  groups: [...new Set(Array.from(document.querySelectorAll('.resource-item:not(.hidden)')).map((el) => el.dataset.group))],
  pressed: document.querySelector('.chip-groups button[data-group="crisis"]')?.getAttribute('aria-pressed'),
}));

let failed = false;
const check = (label, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${detail}`);
  if (!ok) failed = true;
};

// 1. Deep link used by the nav's "Crisis Help (211)" item.
await page.goto(`${base}/directory/?filter=crisis&v=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
let s = await state();
check('?filter=crisis preselects and filters', s.count > 0 && s.count < 228 && s.groups.length === 1 && s.groups[0] === 'crisis' && s.pressed === 'true',
  `count=${s.count}, groups=${JSON.stringify(s.groups)}, chipPressed=${s.pressed}`);

// 2. A normal chip click still filters from a clean load.
await page.goto(`${base}/directory/?v=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
const before = (await state()).count;
await page.locator('.chip-groups button[data-group="food"]').first().click();
await page.waitForTimeout(300);
s = await state();
check('Food chip filters the list', before > s.count && s.groups.length === 1 && s.groups[0] === 'food',
  `before=${before}, after=${s.count}, groups=${JSON.stringify(s.groups)}`);

check('no unexpected page errors', errors.length === 0, JSON.stringify(errors));
await browser.close();
process.exit(failed ? 1 : 0);
