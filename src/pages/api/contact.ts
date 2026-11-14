/**
 * /api/contact — general contact form.
 *
 * The page posts application/x-www-form-urlencoded (plain HTML form), so this
 * reads formData rather than JSON. Inserts into contact_messages and redirects
 * back to the page with ?sent=1 so the browser never lands on raw JSON.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

type CfEnv = {
  baseimpact_verify?: D1Database;
  TURNSTILE_SECRET?: string;
};

const MAX_PER_HOUR = 10;

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function json(data: unknown, status = 200): Promise<Response> {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
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

    if (!name || !message) return json({ error: 'Name and message are required' }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email address' }, 400);

    const db = cf.baseimpact_verify;
    if (!db) return json({ error: 'Server error' }, 500);

    const clientIp = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';

    if (cf.TURNSTILE_SECRET && !(await checkTurnstile(turnstileToken, cf.TURNSTILE_SECRET, clientIp))) {
      return json({ error: 'Verification failed' }, 403);
    }

    const ipHash = await hashIp(clientIp);
    const limitRow = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM rate_limits
         WHERE ip_hash = ? AND action = ? AND created_at > datetime('now', '-1 hour')`,
      )
      .bind(ipHash, 'contact')
      .first<{ count: number }>();
    if ((limitRow?.count ?? 0) >= MAX_PER_HOUR) return json({ error: 'Too many messages. Please try again later.' }, 429);

    await db
      .prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
      .bind(name.slice(0, 200), email.slice(0, 200) || null, message.slice(0, 4000))
      .run();
    await db.prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)').bind(ipHash, 'contact').run();

    return new Response(null, { status: 303, headers: { Location: '/contact?sent=1' } });
  } catch {
    return json({ error: 'Server error' }, 500);
  }
};
