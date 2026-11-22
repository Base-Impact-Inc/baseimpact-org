// Structural accessibility audit (keyboard / screen-reader facing) via CDP Accessibility tree.
// Usage: node scripts/audit-structure.cjs [baseUrl]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:4321';
const DEFAULT_PAGES = [
  '/', '/directory', '/programs/resource-guide', '/contact',
  '/blog/lifepointe-scam-awareness', '/donate', '/privacy', '/accessibility'
];
const pages = process.env.ROUTES_FILE ? JSON.parse(require('fs').readFileSync(process.env.ROUTES_FILE, 'utf8')) : DEFAULT_PAGES;

function walk(node, byId, fn, depth = 0) {
  fn(node, depth);
  (node.childIds || []).forEach(id => { const c = byId[id]; if (c) walk(c, byId, fn, depth + 1); });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = {};
  for (const path of pages) {
    const page = await browser.newPage();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Accessibility.enable');
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const byId = {};
    nodes.forEach(n => { byId[n.nodeId] = n; });
    const root = nodes.find(n => n.role && n.role.value === 'RootWebArea') || nodes[0];

    // true tree order (childIds walk), not the flat serialization order
    const treeHeadings = [], treeLandmarks = new Set(), exposedImages = [], unnamedImages = [];
    walk(root, byId, (n) => {
      const role = n.role && n.role.value;
      if (role === 'heading') {
        const lvl = (n.properties || []).find(p => p.name === 'level');
        treeHeadings.push({ level: lvl ? lvl.value.value : null, name: (n.name && n.name.value || '').slice(0, 40) });
      }
      if (['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form', 'region'].includes(role)) {
        treeLandmarks.add(role + (n.name && n.name.value ? ':' + n.name.value.slice(0, 20) : ''));
      }
      if (['image', 'img'].includes(role) && !n.ignored) {
        exposedImages.push((n.name && n.name.value || '').slice(0, 40));
      }
    });

    // heading level sequence (skipped levels = WCAG 1.3.1 failure)
    let skipped = [];
    let prev = 0;
    for (const h of treeHeadings) {
      const lvl = h.level;
      if (!lvl) { skipped.push('no-level:' + h.name); continue; }
      if (prev && lvl > prev + 1) skipped.push(`H${prev}->H${lvl} ("${h.name}")`);
      prev = Math.max(prev, lvl);
    }
    const first = treeHeadings[0];

    // unnamed exposed images (decorative icons must be aria-hidden, informative ones need alt)
    unnamedImages.push(...exposedImages.filter(n => !n));

    // html lang
    const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
    // aria-live regions
    const live = await page.evaluate(() => [...document.querySelectorAll('[aria-live],[role=alert],[role=status],[role=log]')]
      .map(e => (e.getAttribute('role') || 'aria-live=' + e.getAttribute('aria-live'))));

    report[path] = {
      headings: treeHeadings.length,
      headingOrder: treeHeadings.map(h => 'H' + h.level).join(','),
      firstHeading: first ? 'H' + first.level + ' "' + first.name + '"' : null,
      startsWithH1: !!first && first.level === 1,
      skippedLevels: skipped,
      landmarks: [...treeLandmarks].sort(),
      hasMain: [...treeLandmarks].some(l => l === 'main'),
      exposedImages: exposedImages.length,
      unnamedImages: unnamedImages.length,
      htmlLang: lang,
      liveRegions: live
    };
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 1));
  const fails = Object.entries(report).filter(([, v]) =>
    !v.startsWithH1 || v.skippedLevels.length || !v.hasMain || v.unnamedImages || !v.htmlLang);
  console.log('\n=== STRUCTURE FAILURES ===');
  if (!fails.length) console.log('none — all pages start with H1, no skipped levels, main landmark + lang present, no unnamed images');
  fails.forEach(([p, v]) => console.log('FAIL', p, JSON.stringify({
    startsWithH1: v.startsWithH1, skipped: v.skippedLevels, main: v.hasMain, unnamedImages: v.unnamedImages, lang: v.htmlLang
  })));
  process.exit(fails.length ? 1 : 0);
})();
