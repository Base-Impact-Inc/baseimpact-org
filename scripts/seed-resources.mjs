/**
 * Seed Cloudflare D1 with the resource listing.
 *
 * The per-county TypeScript files remain the source of truth (they are reviewed
 * in pull requests like any other content). This script projects them into the
 * database so the directory can be served from D1 at request time, and so the
 * listing is queryable through the public API.
 *
 *   node scripts/seed-resources.mjs           # seed the remote database
 *   LOCAL=1 node scripts/seed-resources.mjs   # seed the local wrangler database
 *
 * Idempotent: rows are upserted on `id`, so re-running after an edit updates
 * changed listings instead of duplicating them.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = process.cwd();
const entry = path.join(root, 'scripts', '_dump-entry.ts');
const bundle = path.join(root, '.tmp-resources.cjs');

const esbuild = path.join(root, 'node_modules', '.bin', 'esbuild');
if (!fs.existsSync(esbuild)) {
  console.error('esbuild not found — run `npm install` first.');
  process.exit(1);
}

execFileSync(
  esbuild,
  [entry, '--bundle', '--platform=node', '--format=cjs', `--outfile=${bundle}`, '--log-level=error'],
  { stdio: 'inherit' },
);

const { ALL_RESOURCES } = require(bundle);

const COLUMNS = [
  'id', 'name', 'category', 'address', 'lat', 'lng', 'phone', 'website',
  'service_url', 'source_url', 'description', 'hours_text', 'schedule', 'tags',
  'partner_type', 'capacity_status', 'help_group', 'services', 'county',
  'last_verified', 'mobile_only', 'eligibility', 'documents', 'languages',
  'accessibility',
];

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function rowToValues(resource) {
  return [
    resource.id,
    resource.name,
    resource.category,
    resource.address,
    resource.lat,
    resource.lng,
    resource.phone,
    resource.website ?? null,
    resource.serviceUrl ?? null,
    resource.sourceUrl ?? null,
    resource.description,
    resource.hoursText,
    JSON.stringify(resource.schedule ?? {}),
    JSON.stringify(resource.tags ?? []),
    resource.partnerType,
    resource.capacityStatus,
    resource.group,
    JSON.stringify(resource.services ?? []),
    resource.county,
    resource.lastVerified ?? null,
    resource.mobileOnly ? 1 : 0,
    resource.eligibility ?? null,
    resource.documents ?? null,
    JSON.stringify(resource.languages ?? []),
    resource.accessibility ?? null,
  ];
}

// Wrangler's D1 executor manages its own transactions, so no BEGIN/COMMIT here.
const lines = [];
const BATCH = 25;
for (let i = 0; i < ALL_RESOURCES.length; i += BATCH) {
  const batch = ALL_RESOURCES.slice(i, i + BATCH);
  const values = batch.map(rowToValues).map((cols) => `(${cols.map(sqlLiteral).join(', ')})`);
  lines.push(
    `INSERT OR REPLACE INTO resources (${COLUMNS.join(', ')}) VALUES\n${values.join(',\n')};`,
  );
  }

const sqlPath = path.join(root, 'scripts', 'resources.seed.sql');
fs.writeFileSync(sqlPath, lines.join('\n') + '\n');

console.log(`Generated ${sqlPath} with ${ALL_RESOURCES.length} upserts.`);

const wrangler = process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler';
const args = ['d1', 'execute', 'baseimpact-verify', '--file', sqlPath, '--remote'];
if (process.env.LOCAL === '1') {
  args.pop(); // drop --remote for the local database
}

try {
  const output = execFileSync(wrangler, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  const meta = output.match(/"rows_written":\s*(\d+)/);
  console.log(`Seeded D1 (${process.env.LOCAL === '1' ? 'local' : 'remote'}). Rows written: ${meta ? meta[1] : 'unknown'}`);
} catch (error) {
  console.error('Seed failed. Run `npx wrangler login` first, or try LOCAL=1.');
  process.exitCode = 1;
} finally {
  fs.rmSync(bundle, { force: true });
}
