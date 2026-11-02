// Cloudflare Pages Function: /api/technology-access
// Handles device/service requests from the Technology Access page

interface Env {
  baseimpact_verify: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const name = (formData.get('name') as string | null)?.trim() ?? '';
    const contact = (formData.get('contact') as string | null)?.trim() ?? '';
    const need = (formData.get('need') as string | null)?.trim() ?? '';
    const situation = (formData.get('situation') as string | null)?.trim() ?? '';
    const noId = formData.get('no_id') === 'yes' ? 1 : 0;

    if (!name || !need) {
      return new Response(JSON.stringify({ error: 'Name and need are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.baseimpact_verify
      .prepare('INSERT INTO device_requests (name, contact, need, situation, no_id) VALUES (?, ?, ?, ?, ?)')
      .bind(name, contact || null, need, situation || null, noId)
      .run();

    // Redirect back to the page with a success flag
    const url = new URL(request.url);
    return Response.redirect(`${url.origin}/technology-access?submitted=1`, 303);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
