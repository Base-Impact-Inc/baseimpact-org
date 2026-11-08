import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as { name?: string; email?: string; story?: string; consent?: boolean };
    const { name, email, story, consent } = body;

    if (!name || !email || !story || !consent) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Access D1 binding via cloudflare:workers
    let db: any;
    try {
      const { env } = await import('cloudflare:workers');
      db = env?.baseimpact_verify;
    } catch {
      db = undefined;
    }

    if (db) {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS stories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          story TEXT NOT NULL,
          consent INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `).run();

      await db.prepare(
        'INSERT INTO stories (name, email, story, consent) VALUES (?, ?, ?, ?)'
      ).bind(name, email, story, consent ? 1 : 0).run();
    }

    return new Response(JSON.stringify({ success: true, message: 'Story submitted for review' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to submit story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};