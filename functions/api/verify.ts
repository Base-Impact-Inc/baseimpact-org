// Cloudflare Pages Function: /api/verify
// Handles crowdsourced verification votes.
// Security: Turnstile CAPTCHA + per-IP rate limiting + resource validation.
// Votes are signals for review and NEVER delete or hide a listing automatically.

interface Env {
  baseimpact_verify: D1Database;
  TURNSTILE_SECRET?: string;
}

const MAX_VOTES_PER_HOUR = 10;

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
      vote?: string;
      turnstile_token?: string;
    };
    const resourceId = body.resource_id?.trim() ?? '';
    const vote = body.vote?.trim() ?? '';
    const turnstileToken = body.turnstile_token?.trim() ?? '';

    if (!resourceId || !['yes', 'no'].includes(vote)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate the resource exists.
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

    const clientIp = request.headers.get('cf-connecting-ip') ?? 'unknown';

    // Turnstile verification — required when the secret is configured.
    if (env.TURNSTILE_SECRET) {
      if (!turnstileToken || !(await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, clientIp))) {
        return new Response(JSON.stringify({ error: 'Verification failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Rate limiting — max N votes per IP per hour.
    const ipHash = await hashIp(clientIp);
    if (await isRateLimited(env.baseimpact_verify, ipHash, 'verify', MAX_VOTES_PER_HOUR)) {
      return new Response(JSON.stringify({ error: 'Too many votes. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.baseimpact_verify
      .prepare('INSERT INTO verifications (resource_id, vote) VALUES (?, ?)')
      .bind(resourceId, vote)
      .run();

    await env.baseimpact_verify
      .prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)')
      .bind(ipHash, 'verify')
      .run();

    // Get counts
    const result = await env.baseimpact_verify
      .prepare('SELECT vote, COUNT(*) as count FROM verifications WHERE resource_id = ? GROUP BY vote')
      .bind(resourceId)
      .all();

    const counts = { yes: 0, no: 0 };
    for (const row of result.results) {
      counts[row.vote as 'yes' | 'no'] = row.count as number;
    }

    return new Response(JSON.stringify({ ok: true, counts }), {
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
  const resourceId = url.searchParams.get('resource_id');

  if (!resourceId) {
    return new Response(JSON.stringify({ error: 'Missing resource_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await env.baseimpact_verify
    .prepare('SELECT vote, COUNT(*) as count FROM verifications WHERE resource_id = ? GROUP BY vote')
    .bind(resourceId)
    .all();

  const counts = { yes: 0, no: 0 };
  for (const row of result.results) {
    counts[row.vote as 'yes' | 'no'] = row.count as number;
  }

  return new Response(JSON.stringify(counts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
