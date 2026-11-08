// Cloudflare Pages Function: /api/analytics
// Logs anonymized search queries so we know what people look for but cannot find.
// No location, no IP, no personal data is stored — only the query text and result count.

interface Env {
  baseimpact_verify: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as { query?: string; results_count?: number };
    const query = body.query?.trim() ?? '';
    const resultsCount = typeof body.results_count === 'number' ? body.results_count : 0;

    if (!query || query.length < 2 || query.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only log the query text and count — never location, IP, or any identifier.
    await env.baseimpact_verify
      .prepare('INSERT INTO search_logs (query, results_count) VALUES (?, ?)')
      .bind(query, resultsCount)
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
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

  try {
    // Aggregate: how often each query was searched, and the average result count.
    const result = await env.baseimpact_verify
      .prepare(
        `SELECT query,
                COUNT(*) AS search_count,
                AVG(results_count) AS avg_results,
                MAX(created_at) AS last_searched
         FROM search_logs
         GROUP BY query
         ORDER BY search_count DESC, last_searched DESC
         LIMIT ?`
      )
      .bind(limit)
      .all();

    return new Response(JSON.stringify({ searches: result.results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', searches: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
