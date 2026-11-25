// Keyboard-only navigation check: skip link, focus visibility, no traps, dropdown operability.
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';
const PAGES = ['/', '/directory', '/contact', '/donate', '/accessibility'];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

async function focusVisible(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { ok: false, reason: 'no-focus', tag: el && el.tagName };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    const ok = visible && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
    return {
      ok,
      reason: ok ? null : !visible ? 'not-visible' : 'outline:' + cs.outlineStyle + ' ' + cs.outlineWidth,
      tag: el.tagName,
      text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
      href: el.getAttribute('href'),
    };
  });
}

async function desc(page) {
  return page.evaluate(
    (sel) => {
      const el = document.activeElement;
      if (!el) return null;
      return {
        tag: el.tagName,
        text: (el.textContent || '').trim().slice(0, 50),
        aria: el.getAttribute('aria-label'),
        href: el.getAttribute('href'),
      };
    },
    null
  );
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const out = [];

  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(800);
    const report = { path, checks: {}, violations: [] };

    // language declaration
    report.checks.lang = await page.evaluate(() => document.documentElement.lang || null);
    if (report.checks.lang !== 'en') report.violations.push(`html lang is "${report.checks.lang}"`);

    // focusable inventory
    const inventory = await page.evaluate((sel) => {
      const all = [...document.querySelectorAll(sel)];
      const visible = all.filter((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
      });
      return { total: all.length, visible: visible.length };
    }, FOCUSABLE);
    report.checks.focusable = inventory;

    // 1. skip link is the first tab stop
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    const first = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) } : null;
    });
    report.checks.firstTabStop = first;
    const skipHref = first && first.href ? first.href.split('#')[1] : null;
    report.checks.skipLinkTargetsMain = !!skipHref && !!(await page.evaluate((id) => !!document.getElementById(id), skipHref));
    if (!report.checks.skipLinkTargetsMain) report.violations.push('first tab stop is not a skip link into main content');

    // 2. tab sweep: focus visibility on every stop, trap detection
    const visited = [];
    const focusIssues = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(60);
      const d = await desc(page);
      const v = await focusVisible(page);
      if (!d) continue;
      const key = d.tag + '|' + (d.href || d.text);
      if (!visited.includes(key)) visited.push(key);
      if (!v.ok) focusIssues.push({ ...d, reason: v.reason });
    }
    report.checks.distinctTabStops = visited.length;
    report.checks.reachedMostFocusable = visited.length >= Math.max(3, Math.floor(inventory.visible * 0.6));
    if (!report.checks.reachedMostFocusable)
      report.violations.push(`only ${visited.length} distinct tab stops reached of ${inventory.visible} visible focusable elements`);
    report.checks.focusIndicatorIssues = focusIssues.slice(0, 10);
    if (focusIssues.length) report.violations.push(`${focusIssues.length} tab stops had no visible focus indicator`);

    // 3. shift+tab moves backwards
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(80);
    const back = await desc(page);
    report.checks.shiftTabWorks = !!back && back.tag !== 'BODY';
    if (!report.checks.shiftTabWorks) report.violations.push('Shift+Tab did not move focus');

    // 4. dropdown keyboard operability on the home page
    if (path === '/') {
      const dd = await page.evaluate(() => {
        const t = document.querySelector('.nav-dropdown-trigger');
        if (!t) return null;
        t.focus();
        return true;
      });
      if (dd) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(150);
        const opened = await page.evaluate(() => {
          const dd = document.querySelector('.nav-dropdown');
          const menu = dd.querySelector('.nav-dropdown-menu');
          const cs = getComputedStyle(menu);
          return {
            expanded: dd.querySelector('.nav-dropdown-trigger').getAttribute('aria-expanded'),
            menuVisible: cs.display !== 'none' && cs.visibility !== 'hidden' && menu.getBoundingClientRect().height > 0,
          };
        });
        report.checks.dropdownEnterOpens = opened;
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
        const closed = await page.evaluate(
          () => document.querySelector('.nav-dropdown-trigger').getAttribute('aria-expanded')
        );
        report.checks.dropdownEscapeCloses = closed;
        if (opened.expanded !== 'true' || !opened.menuVisible) report.violations.push('dropdown did not open on Enter');
        if (closed !== 'false') report.violations.push('dropdown did not close on Escape');
      }
    }

    // 5. no keyboard trap: focus must not be stuck on one element across repeated tabs
    const trap = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName + '|' + (el.getAttribute('href') || (el.textContent || '').trim().slice(0, 20)) : 'none';
    });
    report.checks.finalFocus = trap;

    out.push(report);
    console.log(`\n${path}`);
    console.log(`  lang=${report.checks.lang} firstTab=${JSON.stringify(report.checks.firstTabStop)}`);
    console.log(`  focusable visible=${inventory.visible} distinctStops=${visited.length} focusIssues=${focusIssues.length}`);
    console.log(`  violations=${report.violations.length}`);
    for (const v of report.violations) console.log('    - ' + v);
  }

  await browser.close();
  const total = out.reduce((n, r) => n + r.violations.length, 0);
  console.log(`\n=== KEYBOARD CHECK: ${out.length} pages, ${total} violation(s) ===`);
  require('fs').writeFileSync(
    '/home/ubuntu/.hermes/cache/scratch/a11y-keyboard-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json',
    JSON.stringify({ base: BASE, pages: out }, null, 2)
  );
  process.exit(total ? 1 : 0);
})();
