// Cloudflare Pages Function: /api/volunteer-signup
// Handles volunteer shift signups from the Events page

interface Env {
  baseimpact_verify: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const name = (formData.get('name') as string | null)?.trim() ?? '';
    const contact = (formData.get('contact') as string | null)?.trim() ?? '';
    const shift = (formData.get('shift') as string | null)?.trim() ?? '';
    const notes = (formData.get('notes') as string | null)?.trim() ?? '';

    if (!name || !contact || !shift) {
      return new Response(JSON.stringify({ error: 'Name, contact, and shift are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.baseimpact_verify
      .prepare('INSERT INTO volunteer_signups (name, contact, shift, notes) VALUES (?, ?, ?, ?)')
      .bind(name, contact, shift, notes || null)
      .run();

    const url = new URL(request.url);
    return Response.redirect(`${url.origin}/events?signedup=1`, 303);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
