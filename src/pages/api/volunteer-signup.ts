/**
 * /api/volunteer-signup — volunteer shift signup form on the events page.
 *
 * Reads the plain HTML form (form-urlencoded) and stores it in
 * volunteer_signups, then redirects back with ?signed=1.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

type CfEnv = {
  baseimpact_verify?: D1Database;
  TURNSTILE_SECRET?: string;
};

const SHIFTS = new Set([
  'monday-bridge',
  'monday-bingo',
  'thursday-lifepointe',
  'saturday-fumc',
  'any',
]);
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
    const contact = String(form.get('contact') ?? '').trim();
    const shift = String(form.get('shift') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();
    const turnstileToken = String(form.get('cf-turnstile-response') ?? '').trim();

    if (!name || !contact || !shift) return json({ error: 'Name, contact, and shift are required' }, 400);
    if (!SHIFTS.has(shift)) return json({ error: 'Invalid shift' }, 400);

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
      .bind(ipHash, 'volunteer_signup')
      .first<{ count: number }>();
    if ((limitRow?.count ?? 0) >= MAX_PER_HOUR) return json({ error: 'Too many signups. Please try again later.' }, 429);

    await db
      .prepare('INSERT INTO volunteer_signups (name, contact, shift, notes) VALUES (?, ?, ?, ?)')
      .bind(name.slice(0, 200), contact.slice(0, 200), shift, notes.slice(0, 2000) || null)
      .run();
    await db.prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)').bind(ipHash, 'volunteer_signup').run();

    return new Response(null, { status: 303, headers: { Location: '/events?signedup=1' } });
  } catch {
    return json({ error: 'Server error' }, 500);
  }
};
