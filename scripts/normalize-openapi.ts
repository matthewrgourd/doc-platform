/**
 * OpenAPI ingestion and normalization layer — Epic 2, Story 2.1
 *
 * Reads an OpenAPI 3.x JSON file, validates required structure, and emits
 * a normalized version to build/openapi/<docset>.normalized.json.
 *
 * Normalization contract:
 *  - info.title, info.version, info.description are required
 *  - At least one server entry is required; first server url must be https
 *  - At least one path is required
 *  - Every operation must have: operationId, summary, at least one tag
 *  - Servers list is deduplicated
 *  - Operations are sorted by path then method for deterministic output
 *  - Emits structured diagnostics; exits 1 on any error
 *
 * Usage:
 *   npx tsx scripts/normalize-openapi.ts <input.json> [--docset <id>]
 *   npx tsx scripts/normalize-openapi.ts static/openapi/tfl-playground.json --docset tfl
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OpenApiInfo = {
  title: string;
  version: string;
  description?: string;
  [key: string]: unknown;
};

type OpenApiServer = {
  url: string;
  description?: string;
  [key: string]: unknown;
};

type OpenApiOperation = {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  [key: string]: unknown;
};

type OpenApiPathItem = {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  patch?: OpenApiOperation;
  delete?: OpenApiOperation;
  head?: OpenApiOperation;
  options?: OpenApiOperation;
  [key: string]: unknown;
};

type OpenApiSpec = {
  openapi: string;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths?: Record<string, OpenApiPathItem>;
  tags?: unknown[];
  components?: unknown;
  [key: string]: unknown;
};

type NormalizedSpec = OpenApiSpec & {
  'x-normalized': true;
  'x-normalized-at': string;
  'x-source-file': string;
};

type Diagnostic = {
  level: 'error' | 'warn';
  path: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;
const OUTPUT_DIR = path.resolve(process.cwd(), 'build', 'openapi');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {inputFile: string; docsetId: string} {
  const args = process.argv.slice(2);
  const inputFile = args.find(a => !a.startsWith('--'));
  if (!inputFile) {
    console.error('[normalize-openapi] ERROR: input file is required');
    console.error('  Usage: npx tsx scripts/normalize-openapi.ts <input.json> [--docset <id>]');
    process.exit(1);
  }

  const docsetIdx = args.indexOf('--docset');
  const docsetId =
    docsetIdx !== -1 && args[docsetIdx + 1]
      ? args[docsetIdx + 1]
      : path.basename(inputFile, path.extname(inputFile)).replace(/[^a-z0-9-]/gi, '-');

  return {inputFile, docsetId};
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateSpec(spec: OpenApiSpec, sourceFile: string): Diagnostic[] {
  const diags: Diagnostic[] = [];

  // OpenAPI version
  if (!spec.openapi || !spec.openapi.startsWith('3.')) {
    diags.push({level: 'error', path: 'openapi', message: 'must be OpenAPI 3.x'});
  }

  // Info block
  if (!spec.info?.title) {
    diags.push({level: 'error', path: 'info.title', message: 'required'});
  }
  if (!spec.info?.version) {
    diags.push({level: 'error', path: 'info.version', message: 'required'});
  }
  if (!spec.info?.description) {
    diags.push({level: 'warn', path: 'info.description', message: 'missing — recommended for portal display'});
  }

  // Servers
  if (!spec.servers || spec.servers.length === 0) {
    diags.push({level: 'error', path: 'servers', message: 'at least one server entry is required'});
  } else {
    const primaryUrl = spec.servers[0].url;
    if (!primaryUrl.startsWith('https://')) {
      diags.push({
        level: 'warn',
        path: 'servers[0].url',
        message: `primary server uses non-HTTPS URL: "${primaryUrl}"`,
      });
    }
  }

  // Paths
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    diags.push({level: 'error', path: 'paths', message: 'at least one path is required'});
  } else {
    for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
      for (const method of HTTP_METHODS) {
        const op = pathItem[method] as OpenApiOperation | undefined;
        if (!op) continue;

        const opPath = `paths.${pathKey}.${method}`;

        if (!op.operationId) {
          diags.push({level: 'error', path: `${opPath}.operationId`, message: 'required'});
        }
        if (!op.summary) {
          diags.push({level: 'warn', path: `${opPath}.summary`, message: 'missing — recommended for sidebar display'});
        }
        if (!op.tags || op.tags.length === 0) {
          diags.push({level: 'warn', path: `${opPath}.tags`, message: 'missing — operations should have at least one tag'});
        }
        if (!op.responses || Object.keys(op.responses).length === 0) {
          diags.push({level: 'error', path: `${opPath}.responses`, message: 'required'});
        }
      }
    }
  }

  return diags;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function normalizeSpec(spec: OpenApiSpec, sourceFile: string): NormalizedSpec {
  // Deduplicate servers by URL
  const seenUrls = new Set<string>();
  const servers = (spec.servers ?? []).filter(s => {
    if (seenUrls.has(s.url)) return false;
    seenUrls.add(s.url);
    return true;
  });

  // Sort paths for deterministic output
  const sortedPaths: Record<string, OpenApiPathItem> = {};
  for (const pathKey of Object.keys(spec.paths ?? {}).sort()) {
    const pathItem = spec.paths![pathKey];
    const sortedPathItem: OpenApiPathItem = {};

    // Sort methods
    for (const method of HTTP_METHODS) {
      if (pathItem[method]) {
        sortedPathItem[method] = pathItem[method];
      }
    }

    // Carry through any non-method keys (parameters, summary, etc.)
    for (const key of Object.keys(pathItem)) {
      if (!HTTP_METHODS.includes(key as (typeof HTTP_METHODS)[number]) && !(key in sortedPathItem)) {
        sortedPathItem[key] = pathItem[key];
      }
    }

    sortedPaths[pathKey] = sortedPathItem;
  }

  return {
    ...spec,
    servers,
    paths: sortedPaths,
    'x-normalized': true,
    'x-normalized-at': new Date().toISOString(),
    'x-source-file': path.relative(process.cwd(), sourceFile),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {inputFile, docsetId} = parseArgs();
const resolvedInput = path.resolve(process.cwd(), inputFile);

if (!fs.existsSync(resolvedInput)) {
  console.error(`[normalize-openapi] ERROR: file not found: ${resolvedInput}`);
  process.exit(1);
}

let spec: OpenApiSpec;
try {
  spec = JSON.parse(fs.readFileSync(resolvedInput, 'utf8'));
} catch (err) {
  console.error(`[normalize-openapi] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const diagnostics = validateSpec(spec, resolvedInput);

let hasErrors = false;
for (const d of diagnostics) {
  const prefix = d.level === 'error' ? 'ERROR' : 'WARN';
  console[d.level === 'error' ? 'error' : 'warn'](
    `[normalize-openapi] ${prefix}: ${d.path} — ${d.message}`,
  );
  if (d.level === 'error') hasErrors = true;
}

if (hasErrors) {
  console.error(`[normalize-openapi] ${diagnostics.filter(d => d.level === 'error').length} error(s) found — aborting`);
  process.exit(1);
}

const normalized = normalizeSpec(spec, resolvedInput);

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
}

const outputPath = path.join(OUTPUT_DIR, `${docsetId}.normalized.json`);
fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2));

const pathCount = Object.keys(normalized.paths ?? {}).length;
const opCount = Object.values(normalized.paths ?? {}).reduce((sum, item) => {
  return sum + HTTP_METHODS.filter(m => item[m]).length;
}, 0);

const warnCount = diagnostics.filter(d => d.level === 'warn').length;
console.log(
  `[normalize-openapi] ${docsetId}: ${pathCount} paths, ${opCount} operations → ${outputPath}` +
    (warnCount > 0 ? ` (${warnCount} warning(s))` : ''),
);
