import { ALL_RESOURCES } from '../src/lib/resources/data/index.ts';

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}

const lines = [];
lines.push('DELETE FROM resources;');
for (const r of ALL_RESOURCES) {
  const cols = [
    'id','name','category','address','lat','lng','phone','website','service_url','source_url',
    'description','hours_text','schedule','tags','partner_type','capacity_status','help_group',
    'services','county','last_verified','mobile_only'
  ];
  const vals = [
    sqlStr(r.id),
    sqlStr(r.name),
    sqlStr(r.category),
    sqlStr(r.address),
    String(r.lat),
    String(r.lng),
    sqlStr(r.phone),
    sqlStr(r.website),
    sqlStr(r.serviceUrl),
    sqlStr(r.sourceUrl),
    sqlStr(r.description),
    sqlStr(r.hoursText),
    sqlStr(JSON.stringify(r.schedule || {})),
    sqlStr(JSON.stringify(r.tags || [])),
    sqlStr(r.partnerType),
    sqlStr(r.capacityStatus),
    sqlStr(r.group),
    sqlStr(JSON.stringify(r.services || [])),
    sqlStr(r.county),
    sqlStr(r.lastVerified),
    r.mobileOnly ? '1' : '0',
  ];
  lines.push(`INSERT INTO resources (${cols.join(',')}) VALUES (${vals.join(',')});`);
}

process.stdout.write(lines.join('\n') + '\n');
console.error(`Generated ${ALL_RESOURCES.length} INSERT statements`);
