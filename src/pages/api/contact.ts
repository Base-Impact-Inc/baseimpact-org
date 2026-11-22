/**
 * /api/contact — general contact form.
 *
 * The page posts application/x-www-form-urlencoded (plain HTML form). This
 * endpoint answers two ways:
 *   - fetch() from the page sends `Accept: application/json` and gets JSON, so
 *     the message renders inline in the form (WCAG 3.3.1 / 3.3.3).
 *   - a plain browser POST (JavaScript disabled) gets a small, self-contained
 *     HTML result page with the same message and a link back to the form, so
 *     nobody ever lands on a raw `{"error":...}` document.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

type CfEnv = {
  baseimpact_verify?: D1Database;
  TURNSTILE_SECRET?: string;
};

const MAX_PER_HOUR = 10;

const MESSAGES: Record<string, string> = {
  missing: 'Please fill in your name and your message before sending.',
  email: 'That email address does not look right — please check it and try again.',
  verify: 'The spam check did not complete. Please try sending the message again.',
  rate: 'You have sent several messages recently. Please wait about an hour, then try again.',
  server: 'Something went wrong on our side. Please try again in a few minutes.',
};

const STATUS: Record<string, number> = {
  missing: 400,
  email: 400,
  verify: 403,
  rate: 429,
  server: 500,
};

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** Minimal, accessible standalone result page for the no-JavaScript path. */
function htmlResult(title: string, message: string, ok: boolean): Response {
  const fg = ok ? '#14532d' : '#7f1d1d';
  const bg = ok ? '#f0fdf4' : '#fef2f2';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} - Base Impact</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a; }
  main { max-width: 34rem; margin: 0 auto; padding: 4rem 1.25rem; }
  h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
  .notice { border: 1px solid ${fg}; background: ${bg}; color: ${fg}; border-radius: .5rem; padding: .9rem 1rem; margin: 1.25rem 0; }
  a { color: #1d4ed8; }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p class="notice">${message}</p>
  <p><a href="/contact">Return to the contact form</a></p>
</main>
</body>
</html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function fail(request: Request, code: string): Response {
  const message = MESSAGES[code] ?? MESSAGES.server;
  const status = STATUS[code] ?? 500;
  if ((request.headers.get('accept') ?? '').includes('application/json')) {
    return json({ ok: false, code, message }, status);
  }
  return htmlResult('Message not sent', message, false);
}

function success(request: Request): Response {
  if ((request.headers.get('accept') ?? '').includes('application/json')) {
    return json({ ok: true }, 200);
  }
  return htmlResult('Message sent', 'Thanks — your message was sent. We reply within a few business days.', true);
}

async function checkTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const cf = env as unknown as CfEnv;
  try {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();
    const turnstileToken = String(form.get('cf-turnstile-response') ?? '').trim();

    if (!name || !message) return fail(request, 'missing');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(request, 'email');

    const db = cf.baseimpact_verify;
    if (!db) return fail(request, 'server');

    const clientIp = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';

    if (cf.TURNSTILE_SECRET && !(await checkTurnstile(turnstileToken, cf.TURNSTILE_SECRET, clientIp))) {
      return fail(request, 'verify');
    }

    const ipHash = await hashIp(clientIp);
    const limitRow = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM rate_limits
         WHERE ip_hash = ? AND action = ? AND created_at > datetime('now', '-1 hour')`,
      )
      .bind(ipHash, 'contact')
      .first<{ count: number }>();
    if ((limitRow?.count ?? 0) >= MAX_PER_HOUR) return fail(request, 'rate');

    await db
      .prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
      .bind(name.slice(0, 200), email.slice(0, 200) || null, message.slice(0, 4000))
      .run();
    await db.prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)').bind(ipHash, 'contact').run();

    return success(request);
  } catch {
    return fail(request, 'server');
  }
};
