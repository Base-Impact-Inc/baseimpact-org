/**
 * /api/analytics — anonymized search logging.
 *
 * Stores only the query text and result count; never location, IP, or any
 * identifier. Astro API route so it runs on the deployed Cloudflare Worker.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

type CfEnv = { baseimpact_verify?: D1Database };

async function json(data: unknown, status = 200): Promise<Response> {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const cf = env as unknown as CfEnv;
  try {
    const body = (await request.json()) as { query?: string; results_count?: number };
    const query = body.query?.trim() ?? '';
    const resultsCount = typeof body.results_count === 'number' ? body.results_count : 0;

    if (!query || query.length < 2 || query.length > 200) {
      return json({ error: 'Invalid query' }, 400);
    }

    const db = cf.baseimpact_verify;
    if (!db) return json({ error: 'Server error' }, 500);

    await db.prepare('INSERT INTO search_logs (query, results_count) VALUES (?, ?)').bind(query, resultsCount).run();

    return json({ ok: true });
  } catch {
    return json({ error: 'Server error' }, 500);
  }
};

export const GET: APIRoute = async ({ url }) => {
  const cf = env as unknown as CfEnv;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
  try {
    const db = cf.baseimpact_verify;
    if (!db) return json({ error: 'Server error', searches: [] }, 500);

    const result = await db
      .prepare(
        `SELECT query,
                COUNT(*) AS search_count,
                AVG(results_count) AS avg_results,
                MAX(created_at) AS last_searched
         FROM search_logs
         GROUP BY query
         ORDER BY search_count DESC, last_searched DESC
         LIMIT ?`,
      )
      .bind(limit)
      .all();

    return json({ searches: result.results || [] });
  } catch {
    return json({ error: 'Server error', searches: [] }, 500);
  }
};
