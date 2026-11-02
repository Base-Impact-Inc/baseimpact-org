// Cloudflare Pages Function: /api/resources
// Returns directory resources from D1, optionally filtered by county and group

interface Env {
  baseimpact_verify: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const county = url.searchParams.get('county');
  const group = url.searchParams.get('group');

  let sql = 'SELECT * FROM resources';
  const binds: string[] = [];
  const conditions: string[] = [];
  if (county) { conditions.push('county = ?'); binds.push(county); }
  if (group && group !== 'all') { conditions.push('help_group = ?'); binds.push(group); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY name ASC';

  try {
    const stmt = env.baseimpact_verify.prepare(sql);
    const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();

    const resources = (result.results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      phone: row.phone,
      website: row.website || undefined,
      serviceUrl: row.service_url || undefined,
      sourceUrl: row.source_url || undefined,
      description: row.description,
      hoursText: row.hours_text,
      schedule: JSON.parse(row.schedule || '{}'),
      tags: JSON.parse(row.tags || '[]'),
      partnerType: row.partner_type,
      capacityStatus: row.capacity_status,
      group: row.help_group,
      services: JSON.parse(row.services || '[]'),
      county: row.county,
      lastVerified: row.last_verified || undefined,
      mobileOnly: row.mobile_only === 1,
    }));

    return new Response(JSON.stringify({ resources }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', resources: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
