/**
 * Algolia index push: Epic 6, Story 6.4
 *
 * Reads build/search-index.json (produced by npm run build-search-index),
 * transforms entries into Algolia records, configures index settings, and
 * pushes via replaceAllObjects.
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
import type {SearchIndex, SearchEntry, DocSearchEntry, ApiOpSearchEntry} from './build-search-index.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const APP_ID = process.env.ALGOLIA_APP_ID ?? '56LVNO7TSU';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY ?? '';
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? 'devdocify';

// ---------------------------------------------------------------------------
// Record transformation
// ---------------------------------------------------------------------------

type AlgoliaRecord = {
  objectID: string;
  type: 'doc' | 'api-op';
  docset: string;
  version: string;
  slug: string;
  // Doc fields
  title?: string;
  headings?: string;
  excerpt?: string;
  // API op fields
  operationId?: string;
  method?: string;
  path?: string;
  summary?: string;
  tags?: string;
};

function toObjectId(entry: SearchEntry): string {
  // Stable, deterministic: type::docset::slug
  return `${entry.type}::${entry.docset}::${entry.slug}`;
}

function transformDoc(entry: DocSearchEntry): AlgoliaRecord {
  return {
    objectID: toObjectId(entry),
    type: 'doc',
    docset: entry.docset,
    version: entry.version,
    slug: entry.slug,
    title: entry.title,
    headings: entry.headings.join(' · '),
    excerpt: entry.excerpt,
  };
}

function transformApiOp(entry: ApiOpSearchEntry): AlgoliaRecord {
  return {
    objectID: toObjectId(entry),
    type: 'api-op',
    docset: entry.docset,
    version: entry.version,
    slug: entry.slug,
    operationId: entry.operationId,
    method: entry.method,
    path: entry.path,
    summary: entry.summary,
    tags: entry.tags.join(' '),
  };
}

function transformEntries(entries: SearchEntry[]): AlgoliaRecord[] {
  return entries.map(entry =>
    entry.type === 'doc' ? transformDoc(entry) : transformApiOp(entry as ApiOpSearchEntry),
  );
}

// ---------------------------------------------------------------------------
// Index settings
// ---------------------------------------------------------------------------

const INDEX_SETTINGS = {
  searchableAttributes: [
    'title',
    'summary',
    'headings',
    'excerpt',
    'operationId',
    'path',
    'tags',
  ],
  attributesForFaceting: [
    'filterOnly(docset)',
    'filterOnly(version)',
    'type',
  ],
  customRanking: [
    // doc pages ranked above api-op entries for equal text score
    'asc(type)',
  ],
  attributesToRetrieve: [
    'objectID',
    'type',
    'docset',
    'version',
    'slug',
    'title',
    'summary',
    'excerpt',
    'operationId',
    'method',
    'path',
  ],
};

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

const records = transformEntries(index.entries);

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
    indexSettings: INDEX_SETTINGS,
  });
  console.log('[push-search-index] index settings applied');

  console.log(`[push-search-index] pushing ${records.length} records to "${INDEX_NAME}"...`);
  await client.replaceAllObjects({
    indexName: INDEX_NAME,
    objects: records as unknown as Record<string, unknown>[],
  });

  console.log(`[push-search-index] done: ${records.length} records in "${INDEX_NAME}"`);
})().catch(err => {
  console.error(`[push-search-index] ERROR: ${(err as Error).message}`);
  process.exit(1);
});
