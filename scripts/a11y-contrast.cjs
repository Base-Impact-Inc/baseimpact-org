// Strict text-contrast audit for WCAG AA/AAA.
//
// Why this exists alongside axe: axe's color-contrast(-enhanced) check treats
// ratios below its `minThreshold` (4.5 for normal text) as "pass" because it
// assumes such nodes are non-text artifacts. Real UI text with a 1.2:1 ratio is
// still a failure. This script computes every visible text node's contrast
// against its resolved (alpha-blended, gradient-aware) background.
//
// Usage:
//   BASE_URL=http://127.0.0.1:4321 ROUTES_FILE=/tmp/routes.json \
//     node scripts/a11y-contrast.cjs [report-out.json]
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';
const ROUTES_FILE = process.env.ROUTES_FILE || '/tmp/routes.json';
const OUT = process.argv[2] || '/home/ubuntu/.hermes/cache/scratch/a11y-contrast-report.json';

const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8'));

const PAGE_FN = () => {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'SVG', 'NOSCRIPT', 'IFRAME', 'CANVAS']);
  const cache = new Map();

  function parseColor(str) {
    if (!str) return null;
    str = String(str).trim();
    let m = str.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i);
    if (m) {
      let a = m[4] === undefined ? 1 : parseFloat(m[4]) / (String(m[4]).includes('%') ? 100 : 1);
      return { r: +m[1], g: +m[2], b: +m[3], a };
    }
    m = str.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      let h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
      if (h.length === 8) {
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16),
          a: parseInt(h.slice(6, 8), 16) / 255,
        };
      }
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
    }
    return null;
  }

  function channel(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance({ r, g, b }) {
    return 0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);
  }
  function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }
  function blendOver(fg, bg) {
    const a = fg.a === undefined ? 1 : fg.a;
    return {
      r: fg.r * a + bg.r * (1 - a),
      g: fg.g * a + bg.g * (1 - a),
      b: fg.b * a + bg.b * (1 - a),
      a: 1,
    };
  }
  function rgbStr(c) {
    return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
  }

  // Walk ancestors, then compose from outermost to innermost, tracking every
  // gradient as a set of alternative backgrounds.
  function resolveBackgrounds(el) {
    const chain = [];
    let node = el;
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      chain.unshift({ node, cs });
      node = node.parentElement;
    }
    const alternatives = [];
    let current = { r: 0, g: 0, b: 0, a: 1 }; // page base black
    let sawGradient = false;
    let uncertain = null;

    for (const { node, cs } of chain) {
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        const stops = [];
        const re = /rgba?\(\s*[\d.]+[,\s]+[\d.]+[,\s]+[\d.]+(?:[,\s/]+[\d.]+%?)?\s*\)|#[0-9a-f]{3,8}/gi;
        for (const m of bi.matchAll(re)) {
          const c = parseColor(m[0]);
          if (c) stops.push(c);
        }
        if (stops.length) {
          sawGradient = true;
          // Each stop becomes an alternative: stop over current, then remaining
          // solid layers above are applied later to all alternatives.
          const next = alternatives.length ? alternatives.slice() : [current];
          alternatives.length = 0;
          for (const base of next) {
            for (const stop of stops) alternatives.push(blendOver(stop, base));
          }
          current = alternatives[0];
          continue;
        }
      }
      const bg = parseColor(cs.backgroundColor);
      if (bg && bg.a > 0) {
        if (alternatives.length) {
          for (let i = 0; i < alternatives.length; i++) alternatives[i] = blendOver(bg, alternatives[i]);
          current = alternatives[0];
        } else {
          current = blendOver(bg, current);
        }
      }
      const op = parseFloat(cs.opacity);
      if (op < 1 && !uncertain) uncertain = `${node.tagName}.${String(node.className).slice(0, 30)} opacity:${op}`;
    }
    return { backgrounds: alternatives.length ? alternatives : [current], gradient: sawGradient, uncertain };
  }

  function selectorFor(el) {
    const parts = [];
    let n = el;
    for (let i = 0; i < 5 && n && n.nodeType === 1; i++) {
      let s = n.tagName.toLowerCase();
      if (n.id) s += '#' + n.id;
      const cls = String(n.className || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
      if (cls) s += '.' + cls;
      parts.unshift(s);
      n = n.parentElement;
    }
    return parts.join(' > ');
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      let p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
      if (p.closest('script,style,template,svg,noscript')) return NodeFilter.FILTER_REJECT;
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return NodeFilter.FILTER_REJECT;
      const r = p.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const rows = new Map();
  let node;
  while ((node = walker.nextNode())) {
    const el = node.parentElement;
    const cs = getComputedStyle(el);
    const fg = parseColor(cs.color) || { r: 255, g: 255, b: 255, a: 1 };
    const { backgrounds, gradient, uncertain } = resolveBackgrounds(el);
    const px = parseFloat(cs.fontSize);
    const weight = parseFloat(cs.fontWeight) || 400;
    const pt = px * 0.75;
    const large = pt >= 18 || (weight >= 700 && pt >= 14);
    const best = Math.max(...backgrounds.map((bg) => contrast(blendOver(fg, bg), bg)));
    const worst = Math.min(...backgrounds.map((bg) => contrast(blendOver(fg, bg), bg)));
    const key = `${selectorFor(el)}|${cs.color}|${rgbStr(backgrounds[0])}|${node.nodeValue.trim().slice(0, 40)}`;
    if (!rows.has(key)) {
      rows.set(key, {
        element: selectorFor(el),
        text: node.nodeValue.trim().slice(0, 80),
        color: cs.color,
        bg: backgrounds.map(rgbStr),
        ratio_best: +best.toFixed(2),
        ratio_worst: +worst.toFixed(2),
        font_px: px,
        font_weight: weight,
        large_text: large,
        gradient: gradient,
        uncertain_opacity: uncertain,
        expected: large ? 4.5 : 7,
        count: 1,
      });
    } else {
      rows.get(key).count += 1;
    }
  }
  return [...rows.values()];
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = { base: BASE, generated_at: new Date().toISOString(), pages: [] };

  for (const route of routes) {
    const url = BASE + route;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(700);
      const rows = await page.evaluate(PAGE_FN);
      const fails = rows.filter((r) => r.ratio_worst < r.expected);
      const aaFails = rows.filter((r) => r.ratio_worst < (r.large_text ? 3 : 4.5));
      report.pages.push({
        route,
        final_url: page.url(),
        redirected: page.url() !== url,
        title: await page.title(),
        status: 'ok',
        text_nodes_checked: rows.length,
        aaa_failures: fails.length,
        aa_failures: aaFails.length,
        fails: fails.sort((a, b) => a.ratio_worst - b.ratio_worst),
      });
      console.log(`${route}  checked=${rows.length} aaaFail=${fails.length} aaFail=${aaFails.length}`);
    } catch (e) {
      report.pages.push({ route, status: 'error', error: String(e).slice(0, 300) });
      console.log(`${route}  ERROR ${String(e).slice(0, 120)}`);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
  const totalA = report.pages.reduce((n, p) => n + (p.aaa_failures || 0), 0);
  const totalAA = report.pages.reduce((n, p) => n + (p.aa_failures || 0), 0);
  console.log(`\nTOTAL AAA failures: ${totalA}, AA failures: ${totalAA}`);
  console.log('Report:', OUT);
  await browser.close();
})();
