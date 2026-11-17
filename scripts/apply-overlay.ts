/**
 * Operation patch overlay mechanism: Epic 2, Story 2.2
 *
 * Reads a normalized OpenAPI spec and an overlay file, merges patches
 * onto matching operations, and emits the merged result.
 * Patch semantics live in openapi-spec.ts.
 *
 * Overlay format (JSON):
 * {
 *   "$schema": "https://devdocify.com/schemas/openapi-overlay/v1",
 *   "docset": "<docset-id>",
 *   "description": "Human-readable description of this overlay",
 *   "patches": [
 *     {
 *       "operationId": "<operationId>",
 *       "description": "Why this patch exists",
 *       "parameters": [
 *         { "name": "<param-name>", "example": <value>, "description": "<override>" }
 *       ],
 *       "x-scalar-*": { ... }   // any x- extension field
 *     }
 *   ]
 * }
 *
 * Usage:
 *   npx tsx scripts/apply-overlay.ts <normalized-spec.json> <overlay.json> [--out <output.json>]
 *   npx tsx scripts/apply-overlay.ts build/openapi/tfl.normalized.json openapi/overlays/tfl.overlay.json
 */

import fs from 'fs';
import path from 'path';
import {applyOverlay, validateOverlay, type OpenApiSpec, type Overlay} from './openapi-spec.js';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {specFile: string; overlayFile: string; outputFile: string | null} {
  const args = process.argv.slice(2);
  const positional = args.filter(a => !a.startsWith('--'));

  if (positional.length < 2) {
    console.error('[apply-overlay] ERROR: specFile and overlayFile are required');
    console.error(
      '  Usage: npx tsx scripts/apply-overlay.ts <normalized-spec.json> <overlay.json> [--out <output.json>]',
    );
    process.exit(1);
  }

  const outIdx = args.indexOf('--out');
  const outputFile = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : null;

  return {specFile: positional[0], overlayFile: positional[1], outputFile};
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {specFile, overlayFile, outputFile} = parseArgs();

const resolvedSpec = path.resolve(process.cwd(), specFile);
const resolvedOverlay = path.resolve(process.cwd(), overlayFile);

if (!fs.existsSync(resolvedSpec)) {
  console.error(`[apply-overlay] ERROR: spec file not found: ${resolvedSpec}`);
  process.exit(1);
}
if (!fs.existsSync(resolvedOverlay)) {
  console.error(`[apply-overlay] ERROR: overlay file not found: ${resolvedOverlay}`);
  process.exit(1);
}

let spec: OpenApiSpec;
let overlay: Overlay;

try {
  spec = JSON.parse(fs.readFileSync(resolvedSpec, 'utf8'));
} catch (err) {
  console.error(`[apply-overlay] ERROR: failed to parse spec JSON: ${(err as Error).message}`);
  process.exit(1);
}

try {
  overlay = JSON.parse(fs.readFileSync(resolvedOverlay, 'utf8'));
} catch (err) {
  console.error(`[apply-overlay] ERROR: failed to parse overlay JSON: ${(err as Error).message}`);
  process.exit(1);
}

// Validate overlay schema
const overlayDiags = validateOverlay(overlay);
let hasErrors = false;
for (const d of overlayDiags) {
  const prefix = d.level === 'error' ? 'ERROR' : 'WARN';
  console[d.level === 'error' ? 'error' : 'warn'](`[apply-overlay] ${prefix}: ${d.context}: ${d.message}`);
  if (d.level === 'error') hasErrors = true;
}
if (hasErrors) process.exit(1);

// Apply patches
const {spec: merged, diagnostics: applyDiags} = applyOverlay(spec, overlay);

for (const d of applyDiags) {
  const prefix = d.level === 'error' ? 'ERROR' : 'WARN';
  console[d.level === 'error' ? 'error' : 'warn'](`[apply-overlay] ${prefix}: ${d.context}: ${d.message}`);
  if (d.level === 'error') hasErrors = true;
}
if (hasErrors) process.exit(1);

// Write output
const resolvedOutput = outputFile
  ? path.resolve(process.cwd(), outputFile)
  : resolvedSpec.replace('.normalized.json', '.merged.json');

const outputDir = path.dirname(resolvedOutput);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, {recursive: true});

fs.writeFileSync(resolvedOutput, JSON.stringify(merged, null, 2));

const patchCount = overlay.patches.length;
const warnCount = applyDiags.filter(d => d.level === 'warn').length;
console.log(
  `[apply-overlay] ${overlay.docset}: applied ${patchCount} patch(es) → ${resolvedOutput}` +
    (warnCount > 0 ? ` (${warnCount} warning(s))` : ''),
);
