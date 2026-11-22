const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'https://baseimpact.org';
const PAGES = ['/', '/directory', '/contact', '/donate'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      document.body.style.zoom = '2';
      const sw = document.documentElement.scrollWidth;
      const cw = document.documentElement.clientWidth;
      const overflow = sw > cw + 1;
      const offenders = [];
      if (overflow) {
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > cw + 2 && rect.width > 0) {
            offenders.push({ tag: el.tagName, cls: String(el.className).slice(0, 80), right: Math.round(rect.right) });
          }
        });
      }
      document.body.style.zoom = '';
      return { zoomScrollWidth: sw, clientWidth: cw, overflow, offenders: offenders.slice(0, 5) };
    });
    console.log(path, JSON.stringify(r));
  }
  await browser.close();
})();
