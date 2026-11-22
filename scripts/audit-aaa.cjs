const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE_URL || "https://baseimpact.org";
const PAGES = [
  `${BASE}/`,
  `${BASE}/directory`,
  `${BASE}/programs/resource-guide`,
  `${BASE}/blog/lifepointe-scam-awareness`,
  `${BASE}/blog/navy-build-parts-outreach`,
  `${BASE}/contact`,
  `${BASE}/donate`,
];

async function audit() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  const allResults = [];

  for (const url of PAGES) {
    console.log(`Auditing: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2500);
      await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.4/axe.min.js' });
      
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2aaa', 'wcag21aaa', 'best-practice'] },
            resultTypes: ['violations', 'incomplete', 'passes']
          }, (err, results) => resolve(results));
        });
      });

      allResults.push({ url, results, error: null });
      
      const v = results.violations;
      const inc = results.incomplete;
      console.log(`  Violations: ${v.length}, Incomplete: ${inc.length}`);
      for (const viol of v) {
        console.log(`    [${viol.impact.toUpperCase()}] ${viol.id}: ${viol.description.substring(0, 100)}...`);
        for (const node of viol.nodes.slice(0, 2)) {
          console.log(`      Target: ${node.target}`);
        }
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      allResults.push({ url, results: null, error: e.message });
    }
  }

  await browser.close();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = `/home/ubuntu/.hermes/cache/scratch/a11y-aaa-audit-${timestamp}.json`;
  fs.writeFileSync(outPath, JSON.stringify({ timestamp, pages: allResults }, null, 2));
  console.log(`\nSaved to: ${outPath}`);

  // Summary
  console.log('\n=== AAA VIOLATION SUMMARY ===');
  for (const r of allResults) {
    if (r.results && r.results.violations.length > 0) {
      console.log(`\n${r.url}:`);
      for (const viol of r.results.violations) {
        console.log(`  [${viol.impact.toUpperCase()}] ${viol.id}: ${viol.description}`);
      }
    }
  }
}

audit().catch(console.error);