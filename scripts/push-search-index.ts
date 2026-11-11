/**
 * Algolia index push: Epic 6, Story 6.4
 *
 * Reads build/search-index.json (produced by npm run build-search-index),
 * transforms entries into DocSearch v3 records (see search-records.ts),
 * configures index settings, and pushes via replaceAllObjects.
 *
 * Requires:
 *   ALGOLIA_APP_ID: Algolia application ID (or falls back to config default)
 *   ALGOLIA_ADMIN_API_KEY: Admin API key (write access). Never commit this value.
 *   ALGOLIA_INDEX_NAME: Index name (or falls back to config default: 'devdocify')
 *
 * Usage:
 *   npx tsx scripts/push-search-index.ts
 *   npx tsx scripts/push-search-index.ts --dry-run   (no Algolia calls)
 *   npx tsx scripts/push-search-index.ts --index-path build/search-index.json
 *
 * algoliasearch v5 is a transitive dependency of @docusaurus/preset-classic.
 * No additional install required.
 */

import fs from 'fs';
import path from 'path';
import {algoliasearch} from 'algoliasearch';
import type {SearchIndex} from './build-search-index.js';
import {DOCSEARCH_INDEX_SETTINGS, toDocSearchRecords} from './search-records.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const APP_ID = process.env.ALGOLIA_APP_ID ?? '313Y2RFH0L';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY ?? '';
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? 'devdocify';
const SITE_URL = process.env.SITE_URL ?? 'https://www.devdocify.com';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {dryRun: boolean; indexPath: string} {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const idx = args.indexOf('--index-path');
  const indexPath = idx !== -1 && args[idx + 1]
    ? path.resolve(process.cwd(), args[idx + 1])
    : path.resolve(process.cwd(), 'build', 'search-index.json');
  return {dryRun, indexPath};
}

const {dryRun, indexPath} = parseArgs();

// ---------------------------------------------------------------------------
// Load index
// ---------------------------------------------------------------------------

if (!fs.existsSync(indexPath)) {
  console.error(`[push-search-index] ERROR: index file not found: ${indexPath}`);
  console.error('  Run npm run build first (postbuild generates build/search-index.json).');
  process.exit(1);
}

let index: SearchIndex;
try {
  index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
} catch (err) {
  console.error(`[push-search-index] ERROR: failed to parse index: ${(err as Error).message}`);
  process.exit(1);
}

const records = toDocSearchRecords(index.entries, SITE_URL);

console.log(`[push-search-index] loaded ${index.entryCount} entries from ${indexPath}`);
console.log(`[push-search-index]   docs: ${index.docCount}, api-ops: ${index.apiOpCount}`);
console.log(`[push-search-index]   transformed to ${records.length} Algolia records`);

// Facet summary
const byDocset = new Map<string, number>();
for (const r of records) byDocset.set(r.docset, (byDocset.get(r.docset) ?? 0) + 1);
for (const [docset, count] of [...byDocset.entries()].sort()) {
  console.log(`[push-search-index]   ${docset}: ${count} records`);
}

if (dryRun) {
  console.log('[push-search-index] --dry-run: skipping Algolia API calls');
  console.log('[push-search-index] sample record:');
  console.log(JSON.stringify(records[0] ?? {}, null, 2));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------

if (!ADMIN_KEY) {
  console.error('[push-search-index] ERROR: ALGOLIA_ADMIN_API_KEY is not set');
  console.error('  Set the environment variable or run with --dry-run to test without pushing.');
  process.exit(1);
}

(async () => {
  const client = algoliasearch(APP_ID, ADMIN_KEY);

  console.log(`[push-search-index] configuring index settings on "${INDEX_NAME}"...`);
  await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: DOCSEARCH_INDEX_SETTINGS,
  });
  console.log('[push-search-index] index settings applied');

  console.log(`[push-search-index] pushing ${records.length} records to "${INDEX_NAME}"...`);
  await client.replaceAllObjects({
    indexName: INDEX_NAME,
    objects: records,
  });

  console.log(`[push-search-index] done: ${records.length} records in "${INDEX_NAME}"`);
})().catch(err => {
  console.error(`[push-search-index] ERROR: ${(err as Error).message}`);
  process.exit(1);
});
