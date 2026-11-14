/**
 * Database-backed resource loading.
 *
 * The Cloudflare D1 database is the canonical store. When it is reachable we
 * read the live rows; when it is not (local static builds, a cold deploy, or a
 * schema that has not been migrated yet) we fall back to the bundled snapshot so
 * the directory never renders empty.
 *
 * Rows are normalised into the same `Resource` shape the rest of the codebase
 * already understands, so `processResources()` and `ResourceCard` need no
 * changes to consume either source.
 */

import { env } from 'cloudflare:workers';

import type { Resource } from './types';
import { ALL_RESOURCES } from './data';

type Row = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Derive city/state from a US-style address when the columns are absent. */
function deriveCityState(address: string): { city?: string; state?: string } {
  const stateMatch = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
  const cityMatch = address.match(/,\s*([^,]+),\s*[A-Z]{2}\s+\d{5}/);
  return {
    city: cityMatch?.[1]?.trim() || undefined,
    state: stateMatch?.[1] || undefined,
  };
}

export function rowToResource(row: Row): Resource {
  const address = str(row.address);
  const { city, state } = deriveCityState(address);

  return {
    id: str(row.id),
    name: str(row.name),
    category: str(row.category) as Resource['category'],
    address,
    lat: num(row.lat),
    lng: num(row.lng),
    phone: str(row.phone),
    website: row.website ? str(row.website) : undefined,
    serviceUrl: row.service_url ? str(row.service_url) : undefined,
    sourceUrl: row.source_url ? str(row.source_url) : undefined,
    description: str(row.description),
    hoursText: str(row.hours_text),
    schedule: parseJSON<Resource['schedule']>(row.schedule, {}),
    tags: parseJSON<string[]>(row.tags, []),
    partnerType: str(row.partner_type),
    capacityStatus: str(row.capacity_status),
    group: str(row.help_group) as Resource['group'],
    services: parseJSON<Resource['services']>(row.services, []),
    county: str(row.county) as Resource['county'],
    city,
    state,
    lastVerified: row.last_verified ? str(row.last_verified) : undefined,
    mobileOnly: num(row.mobile_only) === 1,
    eligibility: row.eligibility ? str(row.eligibility) : undefined,
    documents: row.documents ? str(row.documents) : undefined,
    languages: parseJSON<string[]>(row.languages, []),
    accessibility: row.accessibility ? str(row.accessibility) : undefined,
  };
}

export type LoadResult = {
  resources: Resource[];
  /** Which store answered — surfaced in the UI so the operator can see it. */
  source: 'database' | 'snapshot';
};

export async function loadResources(): Promise<LoadResult> {
  try {
    const db = (env as unknown as { baseimpact_verify?: { prepare?: (sql: string) => { all(): Promise<{ results?: Row[] }> } } })
      ?.baseimpact_verify;
    if (db && typeof db.prepare === 'function') {
      const result = await db.prepare('SELECT * FROM resources ORDER BY name ASC').all();
      const rows = (result?.results ?? []) as Row[];
      if (rows.length > 0) {
        return { resources: rows.map(rowToResource), source: 'database' };
      }
    }
  } catch {
    // Database unavailable — fall through to the bundled snapshot.
  }
  return { resources: ALL_RESOURCES, source: 'snapshot' };
}
