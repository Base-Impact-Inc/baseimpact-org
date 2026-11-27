/**
 * Import script for third-party resources from findhelp.org and 211brevard.org
 * 
 * Adds resources from these providers to the local database
 * with deduplication to avoid duplicate listings.
 * 
 * Usage: node scripts/import-third-party.mjs
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";

// Read the JSON data
const raw = readFileSync(new URL("./third-party-resources.json", import.meta.url), "utf-8");
const THIRD_PARTY_RESOURCES = JSON.parse(raw);

console.log(`\nImporting ${THIRD_PARTY_RESOURCES.length} third-party resources...\n`);

const results = { added: 0, duplicates: 0, errors: 0, skipped: 0 };

function escapeSql(value) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" || typeof value === "bigint") return value;
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  // Escape single quotes and wrap in quotes
  const str = String(value);
  return `'${str.replace(/'/g, "''")}'`;
}

function buildInsertQuery(resource) {
  const columns = Object.keys(resource).join(", ");
  const values = Object.values(resource).map(escapeSql).join(", ");
  return `INSERT INTO resources (${columns}) VALUES (${values});`;
}

for (const resource of THIRD_PARTY_RESOURCES) {
  const { phone, address, name } = resource;
  const safePhone = phone.replace(/'/g, "''");
  const safeAddress = address.toLowerCase().replace(/[^a-z0-9 ]/gi, " ");
  
  // Check for duplicates
  const checkQuery = `SELECT id FROM resources WHERE phone = '${safePhone}' AND address LIKE '%${safeAddress}%' LIMIT 1`;
  
  let isDuplicate = false;
  try {
    const checkResult = execSync(
      `npx wrangler d1 execute baseimpact-verify --command "${checkQuery.replace(/\n/g, " ")}"`,
      { encoding: "utf-8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] }
    );
    if (checkResult.length > 0 && checkResult.includes("id")) {
      isDuplicate = true;
    }
  } catch (e) {
    // Expected - no existing resource found
  }
  
  if (isDuplicate) {
    console.log(`  ✓ Duplicate skipped: ${name}`);
    results.duplicates++;
    continue;
  }
  
  const insertQuery = buildInsertQuery(resource);
  
  try {
    execSync(
      `npx wrangler d1 execute baseimpact-verify --command "${insertQuery.replace(/\n/g, " ")}"`,
      { encoding: "utf-8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] }
    );
    console.log(`  ✓ Added: ${name}`);
    results.added++;
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
    results.errors++;
  }
}

console.log(`\n=== Import Summary ===`);
console.log(`Added: ${results.added}`);
console.log(`Duplicates skipped: ${results.duplicates}`);
console.log(`Errors: ${results.errors}`);
console.log(`Total processed: ${results.added + results.duplicates + results.errors}`);
console.log(`\nDone!`);
