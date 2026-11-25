// Accessible form-submission checks: every form confirms what happened in an
// announced live region, errors use role="alert", and no modal auto-closes.
// External APIs are intercepted so no real mail/message is sent.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';

async function intercept(context, url, status, body, extraHeaders = {}) {
  await context.route(url, (route) => route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
    headers: { ...extraHeaders, 'access-control-allow-origin': '*' },
  }));
}

// Deterministic Turnstile stand-in: the real widget needs a public origin and a
// valid sitekey, neither of which a local preview guarantees. Render a hidden
// cf-turnstile-response field so native validation behaves exactly as in prod.
async function stubTurnstile(context) {
  await context.route(/challenges\.cloudflare\.com\/.*\/api\.js/, (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'window.turnstile={ready:function(cb){cb();},render:function(el,opts){var i=document.createElement("input");i.type="hidden";i.name="cf-turnstile-response";i.value="TESTTOKEN";el.appendChild(i);if(opts&&opts.callback)opts.callback("TESTTOKEN");},reset:function(){},execute:function(){}};',
  }));
  await context.route('**/cdn-cgi/challenge-platform/**', (route) => route.fulfill({ status: 204, body: '' }));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  // 1. Contact form — success confirmation announced in role="status".
  {
    const ctx = await browser.newContext();
    await stubTurnstile(ctx);
    await intercept(ctx, '**/api/contact', 200, { ok: true });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/contact`, { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await p.fill('#name', 'Test Person');
    await p.fill('#email', 'test@example.org');
    await p.fill('#message', 'Accessibility form test.');
    await p.click('#contact-submit');
    await p.waitForFunction(() => document.querySelector('#form-status')?.textContent.includes('sent'), null, { timeout: 8000 });
    const r = await p.evaluate(() => {
      const s = document.querySelector('#form-status');
      return { text: s.textContent.trim(), role: s.getAttribute('role'), live: s.getAttribute('aria-live'), focused: document.activeElement === s, cls: s.className };
    });
    results.push({ case: 'contact-success', pass: r.focused && r.role === 'status' && /sent/.test(r.text) && r.cls.includes('alert-success'), ...r });
    await ctx.close();
  }

  // 2. Contact form — error is announced with role="alert".
  {
    const ctx = await browser.newContext();
    await stubTurnstile(ctx);
    await intercept(ctx, '**/api/contact', 400, { ok: false, code: 'missing', message: 'Please fill in your name and your message before sending.' });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/contact`, { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await p.fill('#name', 'Test Person');
    await p.fill('#email', 'test@example.org');
    await p.fill('#message', 'Trigger server validation error.');
    await p.click('#contact-submit');
    await p.waitForFunction(() => document.querySelector('#form-status')?.getAttribute('role') === 'alert', null, { timeout: 8000 });
    const r = await p.evaluate(() => {
      const s = document.querySelector('#form-status');
      return { text: s.textContent.trim(), role: s.getAttribute('role'), live: s.getAttribute('aria-live'), focused: document.activeElement === s, cls: s.className };
    });
    results.push({ case: 'contact-error-announced', pass: r.role === 'alert' && /fill in/.test(r.text) && r.focused, ...r });
    await ctx.close();
  }

  // 3. Share-your-story — confirmation announced.
  {
    const ctx = await browser.newContext();
    await stubTurnstile(ctx);
    await intercept(ctx, '**/api/stories', 200, { success: true, message: 'Story submitted for review' });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/share-your-story`, { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await p.fill('#story-name', 'Test Person');
    await p.fill('#story-email', 'test@example.org');
    await p.fill('#story-text', 'A test story used only for accessibility verification.');
    await p.check('#story-consent');
    await p.click('#storyForm button[type="submit"]');
    await p.waitForFunction(() => document.querySelector('#form-status')?.textContent.includes('Thank you'), null, { timeout: 8000 });
    const r = await p.evaluate(() => {
      const s = document.querySelector('#form-status');
      return { text: s.textContent.trim(), role: s.getAttribute('role'), live: s.getAttribute('aria-live'), visible: getComputedStyle(s).display !== 'none' };
    });
    results.push({ case: 'story-confirmation', pass: r.role === 'status' && r.live === 'polite' && /Thank you/.test(r.text) && r.visible, ...r });
    await ctx.close();
  }

  // 4. Directory report dialog — confirmation, stays open, focus returns.
  {
    const ctx = await browser.newContext();
    await stubTurnstile(ctx);
    await intercept(ctx, '**/api/report', 200, { ok: true });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/directory`, { waitUntil: 'load' });
    await p.waitForSelector('.report-issue-btn', { timeout: 20000 });
    await p.waitForTimeout(1200);
    const opener = await p.$('.report-issue-btn');
    await opener.click();
    await p.waitForTimeout(500);
    const opened = await p.evaluate(() => document.querySelector('#report-dialog')?.open);
    await p.selectOption('#report-issue-type', { index: 1 }).catch(() => {});
    await p.fill('#report-details', 'Accessibility test report.');
    await p.click('#report-submit');
    await p.waitForFunction(() => document.querySelector('#report-status')?.textContent.includes('received'), null, { timeout: 8000 });
    await p.waitForTimeout(2500); // old code closed the dialog after 1.8s
    const stillOpen = await p.evaluate(() => document.querySelector('#report-dialog')?.open);
    const statusInfo = await p.evaluate(() => ({ role: document.querySelector('#report-status').getAttribute('role'), text: document.querySelector('#report-status').textContent.trim() }));
    await p.click('#report-cancel');
    await p.waitForTimeout(400);
    const focusBack = await p.evaluate(() => document.activeElement === document.querySelector('.report-issue-btn'));
    results.push({ case: 'report-dialog-persistent-and-focus-return', pass: opened && stillOpen && statusInfo.role === 'status' && /received/.test(statusInfo.text) && focusBack, opened, stillOpen, ...statusInfo, focusBack });
    await ctx.close();
  }

  // 5. Technology Access — plain POST redirects back to a role="status" banner.
  {
    const ctx = await browser.newContext();
    await stubTurnstile(ctx);
    await ctx.route('**/api/technology-access', (route) => route.fulfill({ status: 303, headers: { location: '/technology-access?submitted=1' }, body: '' }));
    const p = await ctx.newPage();
    await p.goto(`${BASE}/technology-access`, { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await p.fill('#name', 'Test Person');
    await p.selectOption('#need', 'laptop');
    await p.click('button[type="submit"]');
    await p.waitForURL(/submitted=1/, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const el = [...document.querySelectorAll('[role="status"]')].find((e) => /received/i.test(e.textContent));
      return { url: location.pathname + location.search, found: !!el, text: el && el.textContent.trim() };
    });
    results.push({ case: 'technology-access-post-redirect-status', pass: /submitted=1/.test(r.url) && r.found && /received/i.test(r.text || ''), ...r });
    await ctx.close();
  }

  // 6. Events volunteer signup — plain POST redirects back to a role="status" banner.
  {
    const ctx = await browser.newContext();
    await stubTurnstile(ctx);
    await ctx.route('**/api/volunteer-signup', (route) => route.fulfill({ status: 303, headers: { location: '/events?signedup=1' }, body: '' }));
    const p = await ctx.newPage();
    await p.goto(`${BASE}/events`, { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await p.fill('#vname', 'Test Person');
    await p.fill('#vcontact', 'test@example.org');
    await p.selectOption('#vshift', { index: 1 });
    await p.click('form[action="/api/volunteer-signup"] button[type="submit"]');
    await p.waitForURL(/signedup=1/, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const el = [...document.querySelectorAll('[role="status"]')].find((e) => /signup/i.test(e.textContent));
      return { url: location.pathname + location.search, found: !!el, text: el && el.textContent.trim() };
    });
    results.push({ case: 'events-signup-post-redirect-status', pass: /signedup=1/.test(r.url) && r.found && /signup/i.test(r.text || ''), ...r });
    await ctx.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 1));
  const failed = results.filter((r) => !r.pass);
  console.log(`\n=== FORM CHECKS: ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) { console.log(JSON.stringify(failed, null, 1)); process.exit(1); }
})();
