/**
 * OpenAPI ingestion and normalization layer: Epic 2, Story 2.1
 *
 * Reads an OpenAPI 3.x JSON file, validates required structure, and emits
 * a normalized version to build/openapi/<docset>.normalized.json.
 * The validation and normalization contract lives in openapi-spec.ts.
 * Emits structured diagnostics; exits 1 on any error.
 *
 * Usage:
 *   npx tsx scripts/normalize-openapi.ts <input.json> [--docset <id>]
 *   npx tsx scripts/normalize-openapi.ts static/openapi/tfl-playground.json --docset tfl
 */

import fs from 'fs';
import path from 'path';
import {HTTP_METHODS, normalizeSpec, validateSpec, type OpenApiSpec} from './openapi-spec.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const diagnostics = validateSpec(spec);

let hasErrors = false;
for (const d of diagnostics) {
  const prefix = d.level === 'error' ? 'ERROR' : 'WARN';
  console[d.level === 'error' ? 'error' : 'warn'](
    `[normalize-openapi] ${prefix}: ${d.path}: ${d.message}`,
  );
  if (d.level === 'error') hasErrors = true;
}

if (hasErrors) {
  console.error(`[normalize-openapi] ${diagnostics.filter(d => d.level === 'error').length} error(s) found: aborting`);
  process.exit(1);
}

const normalized = normalizeSpec(spec, path.relative(process.cwd(), resolvedInput));

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
