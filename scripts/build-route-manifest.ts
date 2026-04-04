/**
 * Route manifest builder — Epic 1, Story 1.1
 *
 * Walks the docs/<docset>/[<version>/]... folder structure and produces a
 * deterministic JSON manifest of all routes, slugs, and docset metadata.
 *
 * Current structure (unversioned):
 *   docs/<docset>/<section>/<page>.md
 *
 * Future versioned structure:
 *   docs/<docset>/<version>/<section>/<page>.md
 *
 * The manifest is written to build/route-manifest.json and validated at build
 * time. The build fails with actionable errors on invalid structure.
 */

import fs from 'fs';
import path from 'path';
import {validateAllDocsetConfigs} from './docset.config.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RouteEntry = {
  /** Absolute path to the source file. */
  filePath: string;
  /** Path relative to the docs root (e.g. tfl/getting-started/index.md). */
  relativePath: string;
  /** The docset this route belongs to (e.g. "tfl"). */
  docset: string;
  /**
   * The version this route belongs to, or "unversioned" for docsets that do
   * not use the versioned folder layout.
   */
  version: string;
  /** URL-safe slug derived from the relative path (e.g. "/tfl/getting-started"). */
  slug: string;
  /** True if this file is an index (index.md / index.mdx). */
  isIndex: boolean;
};

export type DocsetManifest = {
  /** Docset identifier (folder name under docs/). */
  id: string;
  /** Detected versions, or ["unversioned"] for flat docsets. */
  versions: string[];
  /** All routes belonging to this docset. */
  routes: RouteEntry[];
};

export type RouteManifest = {
  generatedAt: string;
  docsRoot: string;
  docsets: DocsetManifest[];
  /** Flat list of all routes across all docsets — convenient for link validation. */
  allRoutes: RouteEntry[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const OUTPUT_PATH = path.resolve(process.cwd(), 'build', 'route-manifest.json');
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);

/** Regex for a valid CalVer version segment: yyyy.mm or yyyy.mm-LTS */
const CALVER_RE = /^\d{4}\.\d{2}(-LTS)?$/;

/** Docset folder names to skip (not actual docsets). */
const SKIP_FOLDERS = new Set(['_snippets', 'api-reference', 'connect', 'guides', 'payments']);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function assertDocsRootExists(): void {
  if (!fs.existsSync(DOCS_ROOT)) {
    fatal(`docs root not found: ${DOCS_ROOT}`);
  }
}

function fatal(message: string): never {
  console.error(`[route-manifest] ERROR: ${message}`);
  process.exit(1);
}

function warn(message: string): void {
  console.warn(`[route-manifest] WARN: ${message}`);
}

function slugify(segments: string[]): string {
  return '/' + segments
    .map(s => s.replace(/\.(md|mdx)$/, '').replace(/[^a-z0-9-_]/gi, '-'))
    .join('/');
}

function isVersionSegment(name: string): boolean {
  return CALVER_RE.test(name);
}

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

function walkDocset(docsetId: string, docsetDir: string): DocsetManifest {
  const routes: RouteEntry[] = [];
  const versions = new Set<string>();

  function walk(dir: string, segments: string[]): void {
    const entries = fs.readdirSync(dir, {withFileTypes: true});

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(entryPath, [...segments, entry.name]);
      } else if (entry.isFile() && CONTENT_EXTENSIONS.has(path.extname(entry.name))) {
        const allSegments = [...segments, entry.name];
        const relativePath = path.join(docsetId, ...allSegments);

        // Detect version: if first segment is a CalVer string, it's the version.
        let version = 'unversioned';
        let routeSegments = [docsetId, ...segments, entry.name];

        if (segments.length > 0 && isVersionSegment(segments[0])) {
          version = segments[0];
          routeSegments = [docsetId, ...segments, entry.name];
        }

        versions.add(version);

        const isIndex = entry.name === 'index.md' || entry.name === 'index.mdx';
        // Strip index filename from slug
        const slugSegments = isIndex
          ? routeSegments.slice(0, -1)
          : routeSegments.map(s => s.replace(/\.(md|mdx)$/, ''));

        const slug = slugify(slugSegments);

        // Validate slug characters
        if (/[^a-z0-9\-_/]/i.test(slug)) {
          warn(`non-standard characters in slug: ${slug} (${relativePath})`);
        }

        routes.push({
          filePath: entryPath,
          relativePath: relativePath.replace(/\\/g, '/'),
          docset: docsetId,
          version,
          slug,
          isIndex,
        });
      }
    }
  }

  walk(docsetDir, []);

  // Every docset must have at least one route
  if (routes.length === 0) {
    fatal(`docset "${docsetId}" has no content files in ${docsetDir}`);
  }

  // Every docset must have a root index
  const hasIndex = routes.some(r => r.isIndex && r.slug === `/${docsetId}`);
  if (!hasIndex) {
    warn(`docset "${docsetId}" has no root index.md — navigation may be incomplete`);
  }

  return {
    id: docsetId,
    versions: Array.from(versions).sort(),
    routes,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function buildManifest(): RouteManifest {
  validateAllDocsetConfigs();
  assertDocsRootExists();

  const entries = fs.readdirSync(DOCS_ROOT, {withFileTypes: true});
  const docsets: DocsetManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_FOLDERS.has(entry.name)) {
      console.log(`[route-manifest] skipping non-docset folder: ${entry.name}`);
      continue;
    }

    console.log(`[route-manifest] scanning docset: ${entry.name}`);
    const docset = walkDocset(entry.name, path.join(DOCS_ROOT, entry.name));
    docsets.push(docset);
  }

  if (docsets.length === 0) {
    fatal('no docsets found under docs/');
  }

  const allRoutes = docsets.flatMap(d => d.routes);

  // Check for duplicate slugs across all docsets
  const slugCounts = new Map<string, number>();
  for (const route of allRoutes) {
    slugCounts.set(route.slug, (slugCounts.get(route.slug) ?? 0) + 1);
  }
  for (const [slug, count] of slugCounts) {
    if (count > 1) {
      fatal(`duplicate slug detected: ${slug} (${count} files resolve to this route)`);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    docsRoot: DOCS_ROOT,
    docsets,
    allRoutes,
  };
}

function writeManifest(manifest: RouteManifest): void {
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`[route-manifest] wrote ${manifest.allRoutes.length} routes to ${OUTPUT_PATH}`);
}

const manifest = buildManifest();
writeManifest(manifest);

// Summary
const docsetSummary = manifest.docsets
  .map(d => `  ${d.id}: ${d.routes.length} routes, versions: [${d.versions.join(', ')}]`)
  .join('\n');
console.log(`[route-manifest] summary:\n${docsetSummary}`);
