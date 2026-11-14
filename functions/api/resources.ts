// Cloudflare Pages Function: /api/resources
// Returns directory resources from D1.
//
// Supported filters:
//   county   exact county match
//   group    help_group match
//   lat/lng  when both are present, distance is computed and results are
//            sorted nearest-first (the "closest listing" view)
//   radius   miles — drops listings farther than this once lat/lng is given
//   q        case-insensitive search across name, description, address, tags
//   limit    max rows (default 500, capped at 1000)

interface Env {
  baseimpact_verify: D1Database;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const county = url.searchParams.get('county');
  const group = url.searchParams.get('group');
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const lat = parseFloat(url.searchParams.get('lat') || '');
  const lng = parseFloat(url.searchParams.get('lng') || '');
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const radius = parseFloat(url.searchParams.get('radius') || '') || 0;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '500', 10) || 500, 1000);

  let sql = 'SELECT * FROM resources';
  const binds: string[] = [];
  const conditions: string[] = [];
  if (county) { conditions.push('county = ?'); binds.push(county); }
  if (group && group !== 'all') { conditions.push('help_group = ?'); binds.push(group); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

  try {
    const stmt = env.baseimpact_verify.prepare(sql);
    const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();

    let resources = (result.results || []).map((row: any) => {
      const item: any = {
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
        eligibility: row.eligibility || undefined,
        documents: row.documents || undefined,
        languages: JSON.parse(row.languages || '[]'),
        accessibility: row.accessibility || undefined,
      };
      if (hasCoords) item.distanceMiles = haversineMiles(lat, lng, item.lat, item.lng);
      return item;
    });

    if (hasCoords) {
      resources = resources
        .filter((r) => r.mobileOnly || radius <= 0 || r.distanceMiles <= radius)
        .sort((a, b) => a.distanceMiles - b.distanceMiles);
    }

    if (q) {
      resources = resources.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          (r.tags || []).some((t: string) => t.toLowerCase().includes(q)),
      );
    }

    const total = resources.length;
    resources = resources.slice(0, limit);

    return new Response(JSON.stringify({ resources, total, returned: resources.length }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', resources: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
