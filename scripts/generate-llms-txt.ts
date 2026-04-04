/**
 * llms.txt generator — Epic 6, Story 6.2
 *
 * Generates /llms.txt at the site root on build. The llms.txt format
 * (llmstxt.org) is a Markdown file that helps LLMs understand a site's
 * content structure and find canonical sources.
 *
 * Format:
 *   # Site name
 *
 *   > One-line description
 *
 *   Optional detail paragraphs.
 *
 *   ## Section
 *
 *   - [Title](URL): description
 *
 * This generator reads from the route manifest (build/route-manifest.json)
 * and the search index (build/search-index.json) to produce a complete,
 * accurate listing without duplicating the walk logic.
 *
 * Usage:
 *   npx tsx scripts/generate-llms-txt.ts [--base-url <url>]
 *   npx tsx scripts/generate-llms-txt.ts --base-url https://www.devdocify.com
 *   npx tsx scripts/generate-llms-txt.ts --dry-run
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RouteEntry = {
  slug: string;
  docset: string;
  version: string;
  isIndex: boolean;
};

type RouteManifest = {
  docsets: Array<{id: string; routes: RouteEntry[]}>;
};

type DocSearchEntry = {
  type: 'doc';
  docset: string;
  version: string;
  slug: string;
  title: string;
  excerpt: string;
};

type ApiOpSearchEntry = {
  type: 'api-op';
  docset: string;
  slug: string;
  operationId: string;
  method: string;
  path: string;
  summary: string;
};

type SearchEntry = DocSearchEntry | ApiOpSearchEntry;
type SearchIndex = {entries: SearchEntry[]};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MANIFEST_PATH = path.resolve(process.cwd(), 'build', 'route-manifest.json');
const SEARCH_INDEX_PATH = path.resolve(process.cwd(), 'build', 'search-index.json');
const OUTPUT_PATH = path.resolve(process.cwd(), 'build', 'llms.txt');
const DEFAULT_BASE_URL = 'https://www.devdocify.com';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {baseUrl: string; dryRun: boolean} {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const idx = args.indexOf('--base-url');
  const baseUrl = idx !== -1 && args[idx + 1] ? args[idx + 1] : DEFAULT_BASE_URL;
  return {baseUrl, dryRun};
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateLlmsTxt(content: string): string[] {
  const issues: string[] = [];

  if (!content.startsWith('# ')) {
    issues.push('must start with a level-1 heading (# Title)');
  }
  if (!content.includes('\n> ')) {
    issues.push('must include a blockquote summary line (> Description)');
  }
  if (!content.includes('## ')) {
    issues.push('must include at least one section (## Section)');
  }
  if (!content.includes('](')) {
    issues.push('must include at least one link entry');
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function buildLlmsTxt(
  manifest: RouteManifest,
  searchIndex: SearchIndex,
  baseUrl: string,
): string {
  const url = (slug: string) => baseUrl.replace(/\/$/, '') + slug;

  // Build a title/excerpt lookup from the search index
  const docMeta = new Map<string, {title: string; excerpt: string}>();
  const apiOps: ApiOpSearchEntry[] = [];

  for (const entry of searchIndex.entries) {
    if (entry.type === 'doc') {
      docMeta.set(entry.slug, {title: entry.title, excerpt: entry.excerpt});
    } else if (entry.type === 'api-op') {
      apiOps.push(entry);
    }
  }

  const lines: string[] = [
    '# DevDocify',
    '',
    '> Developer documentation platform. Covers the Transport for London (TfL) Unified API and the Swagger Petstore API, with guides, reference, and interactive playgrounds.',
    '',
    'DevDocify is a documentation platform that demonstrates multi-docset API documentation, versioning, and interactive API playgrounds. The following links are the canonical sources for all content.',
    '',
    '---',
    '',
  ];

  // One section per docset
  for (const docset of manifest.docsets) {
    const docsetName = {
      devdocify: 'DevDocify docs',
      tfl: 'Transport for London (TfL) API',
      petstore: 'Swagger Petstore API',
    }[docset.id] ?? docset.id;

    lines.push(`## ${docsetName}`, '');

    // Sort: index first, then alphabetically
    const sorted = [...docset.routes].sort((a, b) => {
      if (a.isIndex && !b.isIndex) return -1;
      if (!a.isIndex && b.isIndex) return 1;
      return a.slug.localeCompare(b.slug);
    });

    for (const route of sorted) {
      const meta = docMeta.get(route.slug);
      const title = meta?.title ?? route.slug.split('/').pop() ?? route.slug;
      const excerpt = meta?.excerpt ? `: ${meta.excerpt.slice(0, 120).replace(/\n/g, ' ')}` : '';
      lines.push(`- [${title}](${url(route.slug)})${excerpt}`);
    }

    lines.push('');
  }

  // API operations section
  if (apiOps.length > 0) {
    lines.push('## API operations', '');

    const byDocset = new Map<string, ApiOpSearchEntry[]>();
    for (const op of apiOps) {
      if (!byDocset.has(op.docset)) byDocset.set(op.docset, []);
      byDocset.get(op.docset)!.push(op);
    }

    for (const [docset, ops] of byDocset) {
      lines.push(`### ${docset}`, '');
      for (const op of ops) {
        const desc = op.summary ? `: ${op.summary}` : '';
        lines.push(`- [${op.method} ${op.path}](${url(op.slug)})${desc}`);
      }
      lines.push('');
    }
  }

  // Footer
  lines.push(
    '---',
    '',
    `*Generated ${new Date().toISOString()} from ${manifest.docsets.reduce((n, d) => n + d.routes.length, 0)} routes across ${manifest.docsets.length} docsets.*`,
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {baseUrl, dryRun} = parseArgs();

for (const [label, p] of [['route manifest', MANIFEST_PATH], ['search index', SEARCH_INDEX_PATH]] as const) {
  if (!fs.existsSync(p)) {
    console.error(`[llms-txt] ERROR: ${label} not found: ${p}`);
    console.error('  Run npm run manifest and npm run build-search-index first.');
    process.exit(1);
  }
}

const manifest: RouteManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const searchIndex: SearchIndex = JSON.parse(fs.readFileSync(SEARCH_INDEX_PATH, 'utf8'));

const content = buildLlmsTxt(manifest, searchIndex, baseUrl);

// Validate
const issues = validateLlmsTxt(content);
if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`[llms-txt] ERROR: format validation — ${issue}`);
  }
  process.exit(1);
}

const lineCount = content.split('\n').length;
const linkCount = (content.match(/^- \[/gm) ?? []).length;

if (dryRun) {
  console.log(content);
  console.log(`\n[llms-txt] dry run — ${lineCount} lines, ${linkCount} links (no output written)`);
} else {
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`[llms-txt] wrote ${lineCount} lines, ${linkCount} links → ${OUTPUT_PATH}`);
}
