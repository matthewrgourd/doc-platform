/**
 * Search index builder — Epic 6, Story 6.1
 *
 * Walks the docs tree and OpenAPI specs to produce a unified search index
 * at build/search-index.json. Entries are faceted by docset, version, and
 * content type so the frontend can filter by product/version.
 *
 * Entry types:
 *   doc       — a Markdown/MDX content page
 *   api-op    — an OpenAPI operation (from static/openapi/*.json)
 *
 * Doc entry fields:
 *   type, docset, version, slug, title, headings[], excerpt, relativePath
 *
 * API operation entry fields:
 *   type, docset, version, slug, operationId, method, path, summary, tags[]
 *
 * Usage:
 *   npx tsx scripts/build-search-index.ts
 *   npx tsx scripts/build-search-index.ts --dry-run   (print summary, no output)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchEntryType = 'doc' | 'api-op';

export type DocSearchEntry = {
  type: 'doc';
  docset: string;
  version: string;
  slug: string;
  title: string;
  headings: string[];
  excerpt: string;
  relativePath: string;
};

export type ApiOpSearchEntry = {
  type: 'api-op';
  docset: string;
  version: string;
  slug: string;
  operationId: string;
  method: string;
  path: string;
  summary: string;
  tags: string[];
};

export type SearchEntry = DocSearchEntry | ApiOpSearchEntry;

export type SearchIndex = {
  generatedAt: string;
  entryCount: number;
  docCount: number;
  apiOpCount: number;
  buildDurationMs: number;
  entries: SearchEntry[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const OPENAPI_DIR = path.resolve(process.cwd(), 'static', 'openapi');
const OUTPUT_PATH = path.resolve(process.cwd(), 'build', 'search-index.json');
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);
const CALVER_RE = /^\d{4}\.\d{2}(-LTS)?$/;
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;
const SKIP_FOLDERS = new Set(['_snippets', 'api-reference', 'connect', 'guides', 'payments']);

/** Max characters for excerpt. */
const EXCERPT_LENGTH = 200;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {dryRun: boolean} {
  return {dryRun: process.argv.includes('--dry-run')};
}

// ---------------------------------------------------------------------------
// Doc page indexing
// ---------------------------------------------------------------------------

function extractFrontmatterTitle(content: string): string | null {
  const match = content.match(/^---\n[\s\S]*?^title:\s*['"]?(.+?)['"]?\s*$/m);
  return match ? match[1].trim() : null;
}

function extractHeadings(content: string): string[] {
  // Strip frontmatter first
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const matches = body.matchAll(/^#{1,3}\s+(.+)$/gm);
  return Array.from(matches, m => m[1].trim()).slice(0, 10);
}

function extractExcerpt(content: string): string {
  // Strip frontmatter and markdown syntax for a plain-text excerpt
  const body = content
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^#{1,6}\s+.+$/gm, '')       // headings
    .replace(/<!--.*?-->/gs, '')            // HTML comments (includes directives)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
    .replace(/[*_`~]/g, '')                // inline formatting
    .replace(/\n{2,}/g, ' ')              // collapse whitespace
    .trim();

  return body.slice(0, EXCERPT_LENGTH) + (body.length > EXCERPT_LENGTH ? '…' : '');
}

function slugFromRelPath(relPath: string): string {
  const segments = relPath.replace(/\\/g, '/').split('/');
  const last = segments[segments.length - 1];
  const isIndex = last === 'index.md' || last === 'index.mdx';

  const clean = segments.map(s => s.replace(/\.(md|mdx)$/, ''));
  if (isIndex) clean.pop();

  return '/' + clean.join('/');
}

function indexDocs(docsRoot: string): DocSearchEntry[] {
  const entries: DocSearchEntry[] = [];

  // Only walk docset directories — skip root-level files and non-docset folders
  const rootEntries = fs.readdirSync(docsRoot, {withFileTypes: true});
  const docsetDirs = rootEntries
    .filter(e => e.isDirectory() && !SKIP_FOLDERS.has(e.name))
    .map(e => path.join(docsRoot, e.name));

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (SKIP_FOLDERS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!CONTENT_EXTENSIONS.has(path.extname(entry.name))) continue;

      const relPath = path.relative(docsRoot, fullPath);
      const segments = relPath.replace(/\\/g, '/').split('/');
      const docset = segments[0];
      const version = segments.length > 1 && CALVER_RE.test(segments[1])
        ? segments[1]
        : 'unversioned';

      const content = fs.readFileSync(fullPath, 'utf8');
      const title = extractFrontmatterTitle(content) ?? segments[segments.length - 1].replace(/\.(md|mdx)$/, '');
      const headings = extractHeadings(content);
      const excerpt = extractExcerpt(content);
      const slug = slugFromRelPath(relPath);

      entries.push({
        type: 'doc',
        docset,
        version,
        slug,
        title,
        headings,
        excerpt,
        relativePath: relPath.replace(/\\/g, '/'),
      });
    }
  }

  for (const docsetDir of docsetDirs) {
    walk(docsetDir);
  }
  return entries;
}

// ---------------------------------------------------------------------------
// OpenAPI operation indexing
// ---------------------------------------------------------------------------

function docsetFromSpecFilename(filename: string): string {
  // e.g. tfl-playground.json → tfl
  return filename.replace(/-playground\.json$/, '').replace(/\.json$/, '');
}

function indexApiOps(openapiDir: string): ApiOpSearchEntry[] {
  const entries: ApiOpSearchEntry[] = [];

  if (!fs.existsSync(openapiDir)) return entries;

  for (const filename of fs.readdirSync(openapiDir)) {
    if (!filename.endsWith('.json')) continue;

    const docset = docsetFromSpecFilename(filename);
    let spec: Record<string, unknown>;

    try {
      spec = JSON.parse(fs.readFileSync(path.join(openapiDir, filename), 'utf8'));
    } catch {
      console.warn(`[search-index] WARN: failed to parse ${filename} — skipped`);
      continue;
    }

    const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>;

    for (const [apiPath, pathItem] of Object.entries(paths)) {
      for (const method of HTTP_METHODS) {
        const op = pathItem[method] as Record<string, unknown> | undefined;
        if (!op) continue;

        const operationId = (op.operationId as string | undefined) ?? `${method}-${apiPath}`;
        const summary = (op.summary as string | undefined) ?? '';
        const tags = (op.tags as string[] | undefined) ?? [];

        // Slug: /docset/api-reference/operationId
        const slug = `/${docset}/api-reference/${operationId}`;

        entries.push({
          type: 'api-op',
          docset,
          version: 'unversioned',
          slug,
          operationId,
          method: method.toUpperCase(),
          path: apiPath,
          summary,
          tags,
        });
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {dryRun} = parseArgs();
const start = performance.now();

if (!fs.existsSync(DOCS_ROOT)) {
  console.error(`[search-index] ERROR: docs root not found: ${DOCS_ROOT}`);
  process.exit(1);
}

console.log('[search-index] indexing docs...');
const docEntries = indexDocs(DOCS_ROOT);
console.log(`[search-index] indexed ${docEntries.length} doc page(s)`);

console.log('[search-index] indexing API operations...');
const apiEntries = indexApiOps(OPENAPI_DIR);
console.log(`[search-index] indexed ${apiEntries.length} API operation(s)`);

const allEntries: SearchEntry[] = [...docEntries, ...apiEntries];
const buildDurationMs = Math.round(performance.now() - start);

const index: SearchIndex = {
  generatedAt: new Date().toISOString(),
  entryCount: allEntries.length,
  docCount: docEntries.length,
  apiOpCount: apiEntries.length,
  buildDurationMs,
  entries: allEntries,
};

// Facet summary
const byDocset = new Map<string, number>();
for (const e of allEntries) {
  byDocset.set(e.docset, (byDocset.get(e.docset) ?? 0) + 1);
}

console.log('[search-index] facet summary:');
for (const [docset, count] of [...byDocset.entries()].sort()) {
  console.log(`  ${docset}: ${count} entries`);
}

if (dryRun) {
  console.log(`[search-index] dry run — ${allEntries.length} entries in ${buildDurationMs}ms (no output written)`);
} else {
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`[search-index] wrote ${allEntries.length} entries in ${buildDurationMs}ms → ${OUTPUT_PATH}`);
}
