// Cloudflare Pages Function: /api/report
// Lets visitors report a resource that is wrong, closed, or not real.
// Security: Turnstile CAPTCHA + per-IP rate limiting + resource validation.
// Reports are stored for human review and NEVER auto-delete a listing.

interface Env {
  baseimpact_verify: D1Database;
  TURNSTILE_SECRET?: string;
}

const ISSUE_TYPES = new Set([
  'wrong-phone',
  'wrong-address',
  'wrong-hours',
  'closed-or-moved',
  'not-real-resource',
  'other',
]);

const MAX_REPORTS_PER_HOUR = 5;

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
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

async function isRateLimited(
  env: D1Database,
  ipHash: string,
  action: string,
  maxPerHour: number
): Promise<boolean> {
  const row = await env
    .prepare(
      `SELECT COUNT(*) AS count FROM rate_limits
       WHERE ip_hash = ? AND action = ? AND created_at > datetime('now', '-1 hour')`
    )
    .bind(ipHash, action)
    .first<{ count: number }>();
  return (row?.count ?? 0) >= maxPerHour;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as {
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

    if (!resourceId || !issueType) {
      return new Response(JSON.stringify({ error: 'Resource and issue type are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ISSUE_TYPES.has(issueType)) {
      return new Response(JSON.stringify({ error: 'Invalid issue type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate the resource actually exists before accepting a report.
    const resource = await env.baseimpact_verify
      .prepare('SELECT id FROM resources WHERE id = ?')
      .bind(resourceId)
      .first();
    if (!resource) {
      return new Response(JSON.stringify({ error: 'Resource not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Turnstile verification — required when the secret is configured.
    const clientIp = request.headers.get('cf-connecting-ip') ?? 'unknown';
    if (env.TURNSTILE_SECRET) {
      if (!turnstileToken || !(await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, clientIp))) {
        return new Response(JSON.stringify({ error: 'Verification failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Rate limiting — max N reports per IP per hour.
    const ipHash = await hashIp(clientIp);
    if (await isRateLimited(env.baseimpact_verify, ipHash, 'report', MAX_REPORTS_PER_HOUR)) {
      return new Response(JSON.stringify({ error: 'Too many reports. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.baseimpact_verify
      .prepare(
        'INSERT INTO resource_reports (resource_id, resource_name, issue_type, details, email) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(resourceId, resourceName || resourceId, issueType, details || null, email || null)
      .run();

    await env.baseimpact_verify
      .prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)')
      .bind(ipHash, 'report')
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'all';

  try {
    let sql = 'SELECT * FROM resource_reports';
    const binds: string[] = [];
    if (status !== 'all') {
      sql += ' WHERE status = ?';
      binds.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const stmt = env.baseimpact_verify.prepare(sql);
    const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();

    return new Response(JSON.stringify({ reports: result.results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', reports: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
