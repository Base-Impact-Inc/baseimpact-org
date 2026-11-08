import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const zip = url.searchParams.get('zip');
  if (!zip || !/^\d{5}$/.test(zip)) {
    return new Response(JSON.stringify({ error: 'Invalid ZIP code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'ZIP not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await res.json() as any;
    const place = data.places?.[0];
    if (!place) {
      return new Response(JSON.stringify({ error: 'ZIP not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      label: `${place['place name']}, ${place['state abbreviation']}`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Geocoding failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};