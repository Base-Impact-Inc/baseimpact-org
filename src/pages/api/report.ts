/**
 * /api/report — resource issue reports.
 *
 * Astro API route rather than a Pages Function, because this site deploys as a
 * Cloudflare Worker via `wrangler deploy`; `functions/` is not routed there.
 * Same behaviour as the original: Turnstile when a secret is configured,
 * per-IP hourly rate limit, and validation that the listing actually exists.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const ISSUE_TYPES = new Set([
  'wrong-phone',
  'wrong-address',
  'wrong-hours',
  'closed-or-moved',
  'not-real-resource',
  'other',
]);

const MAX_REPORTS_PER_HOUR = 5;

type CfEnv = {
  baseimpact_verify?: D1Database;
  TURNSTILE_SECRET?: string;
};

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function json(data: unknown, status = 200): Promise<Response> {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const cf = env as unknown as CfEnv;
  try {
    const body = (await request.json()) as {
      resource_id?: string;
      resource_name?: string;
      issue_type?: string;
      details?: string;
      email?: string;
      turnstile_token?: string;
    };

    const resourceId = body.resource_id?.trim() ?? '';
    const resourceName = body.resource_name?.trim() ?? '';
    const issueType = body.issue_type?.trim() ?? '';
    const details = body.details?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const turnstileToken = body.turnstile_token?.trim() ?? '';

    if (!resourceId || !issueType) return json({ error: 'Resource and issue type are required' }, 400);
    if (!ISSUE_TYPES.has(issueType)) return json({ error: 'Invalid issue type' }, 400);

    const db = cf.baseimpact_verify;
    if (!db) return json({ error: 'Server error' }, 500);

    const resource = await db.prepare('SELECT id FROM resources WHERE id = ?').bind(resourceId).first();
    if (!resource) return json({ error: 'Resource not found' }, 404);

    const clientIp = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';

    if (cf.TURNSTILE_SECRET) {
      if (!turnstileToken || !(await verifyTurnstile(turnstileToken, cf.TURNSTILE_SECRET, clientIp))) {
        return json({ error: 'Verification failed' }, 403);
      }
    }

    const ipHash = await hashIp(clientIp);
    const limitRow = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM rate_limits
         WHERE ip_hash = ? AND action = ? AND created_at > datetime('now', '-1 hour')`,
      )
      .bind(ipHash, 'report')
      .first<{ count: number }>();
    if ((limitRow?.count ?? 0) >= MAX_REPORTS_PER_HOUR) {
      return json({ error: 'Too many reports. Please try again later.' }, 429);
    }

    await db
      .prepare(
        'INSERT INTO resource_reports (resource_id, resource_name, issue_type, details, email) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(resourceId, resourceName || resourceId, issueType, details || null, email || null)
      .run();

    await db.prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)').bind(ipHash, 'report').run();

    return json({ ok: true });
  } catch {
    return json({ error: 'Server error' }, 500);
  }
};

export const GET: APIRoute = async ({ url }) => {
  const cf = env as unknown as CfEnv;
  const status = url.searchParams.get('status') || 'all';
  try {
    const db = cf.baseimpact_verify;
    if (!db) return json({ error: 'Server error', reports: [] }, 500);

    let sql = 'SELECT * FROM resource_reports';
    const binds: string[] = [];
    if (status !== 'all') {
      sql += ' WHERE status = ?';
      binds.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const stmt = db.prepare(sql);
    const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
    return json({ reports: result.results || [] });
  } catch {
    return json({ error: 'Server error', reports: [] }, 500);
  }
};
