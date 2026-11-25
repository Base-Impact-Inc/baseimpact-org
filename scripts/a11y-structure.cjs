// Screen-reader proxy: Chrome accessibility tree (CDP) — headings, landmarks, names, live regions.
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';
const PAGES = ['/', '/directory', '/contact', '/donate', '/accessibility'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const out = [];

  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const r = (n) => n.role && n.role.value;
    const nm = (n) => (n.name ? n.name.value : '');

    // getFullAXTree returns a flat array whose order is not guaranteed to be
    // document order. Build the parent/child tree and walk it depth-first so
    // heading order reflects what a screen reader actually traverses.
    const children = new Map();
    for (const n of nodes) {
      if (n.parentId == null) continue;
      if (!children.has(n.parentId)) children.set(n.parentId, []);
      children.get(n.parentId).push(n);
    }
    const headings = [];
    const walk = (node) => {
      // `ignored` nodes are often just layout wrappers (e.g. Astro's
      // <Fragment> hosts) that sit *between* a landmark and its headings.
      // Pruning them here made the walk skip every heading, so recurse
      // through them and only skip counting the ignored node itself.
      if (!node.ignored && r(node) === 'heading') {
        const levelProp = node.properties && node.properties.find((p) => p.name === 'level');
        headings.push({ level: levelProp ? levelProp.value.value : 0, name: nm(node) });
      }
      for (const child of children.get(node.nodeId) || []) walk(child);
    };
    for (const n of nodes) if (n.parentId == null) walk(n);

    const landmarks = [...new Set(nodes.filter((n) => ['banner', 'main', 'contentinfo', 'navigation', 'complementary', 'search', 'form'].includes(r(n))).map(r))];
    const unnamed = nodes.filter((n) => ['textbox', 'button', 'link', 'combobox', 'checkbox', 'radio', 'switch', 'menuitem'].includes(r(n)) && !nm(n)).map((n) => ({ role: r(n), ignored: !!n.ignored }));
    const imgs = nodes.filter((n) => r(n) === 'image' || r(n) === 'img');
    const live = nodes.filter((n) => n.properties && n.properties.some((p) => p.name === 'live')).map((n) => ({ role: r(n), live: n.properties.find((p) => p.name === 'live').value.value, atomic: n.properties.find((p) => p.name === 'atomic') && n.properties.find((p) => p.name === 'atomic').value.value, name: nm(n).slice(0, 40) }));
    const ignoredInteractive = nodes.filter((n) => n.ignored && ['textbox', 'button', 'link', 'combobox'].includes(r(n))).length;

    // heading order: no skipped levels, exactly one h1
    const levels = headings.map((h) => h.level);
    let orderOk = true;
    for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) orderOk = false;
    const h1 = levels.filter((l) => l === 1).length;

    const violations = [];
    if (h1 !== 1) violations.push(`expected exactly 1 h1, found ${h1}`);
    if (!orderOk) violations.push('heading levels skip a step: ' + levels.join(','));
    if (!landmarks.includes('main')) violations.push('no main landmark');
    if (!landmarks.includes('banner')) violations.push('no banner landmark');
    if (!landmarks.includes('contentinfo')) violations.push('no contentinfo landmark');
    if (unnamed.filter((u) => !u.ignored).length) violations.push(`${unnamed.filter((u) => !u.ignored).length} interactive elements have no accessible name`);
    if (ignoredInteractive) violations.push(`${ignoredInteractive} interactive elements are ignored by the AX tree`);

    out.push({ path, headings: levels.join(','), h1, landmarks, unnamedCount: unnamed.filter((u) => !u.ignored).length, images: imgs.length, imagesNamed: imgs.filter((i) => nm(i)).length, liveRegions: live, violations });
    console.log(`\n${path}`);
    console.log(`  headings: ${levels.join(',')}  (h1=${h1})`);
    console.log(`  landmarks: ${landmarks.join(', ')}`);
    console.log(`  images: ${imgs.length} named: ${imgs.filter((i) => nm(i)).length}`);
    console.log(`  unnamed interactive: ${unnamed.filter((u) => !u.ignored).length}  ignored interactive: ${ignoredInteractive}`);
    console.log(`  live regions: ${live.length ? JSON.stringify(live) : 'none'}`);
    console.log(`  violations=${violations.length}`);
    for (const v of violations) console.log('    - ' + v);
  }

  await browser.close();
  const total = out.reduce((n, r) => n + r.violations.length, 0);
  console.log(`\n=== STRUCTURE CHECK: ${out.length} pages, ${total} violation(s) ===`);
  require('fs').writeFileSync(
    '/home/ubuntu/.hermes/cache/scratch/a11y-structure-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json',
    JSON.stringify({ base: BASE, pages: out }, null, 2)
  );
  process.exit(total ? 1 : 0);
})();
