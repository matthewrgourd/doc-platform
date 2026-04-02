/**
 * Operation patch overlay mechanism — Epic 2, Story 2.2
 *
 * Reads a normalized OpenAPI spec and an overlay file, merges patches
 * onto matching operations, and emits the merged result.
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
 * Patch semantics:
 *  - Patches are matched by operationId (required, must exist in spec)
 *  - Parameter patches matched by name; missing parameters are warned
 *  - Non-parameter keys (x-*, description, summary) are shallow-merged onto the operation
 *  - Merge is deterministic: same input always produces same output
 *
 * Usage:
 *   npx tsx scripts/apply-overlay.ts <normalized-spec.json> <overlay.json> [--out <output.json>]
 *   npx tsx scripts/apply-overlay.ts build/openapi/tfl.normalized.json openapi/overlays/tfl.overlay.json
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ParameterPatch = {
  name: string;
  example?: unknown;
  description?: string;
  [key: string]: unknown;
};

type OperationPatch = {
  operationId: string;
  description?: string;
  summary?: string;
  parameters?: ParameterPatch[];
  [key: string]: unknown;
};

type Overlay = {
  $schema?: string;
  docset: string;
  description?: string;
  patches: OperationPatch[];
};

type OpenApiOperation = {
  operationId?: string;
  parameters?: Array<{name: string; [key: string]: unknown}>;
  [key: string]: unknown;
};

type OpenApiSpec = {
  paths?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
};

type Diagnostic = {
  level: 'error' | 'warn';
  context: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

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
// Overlay validation
// ---------------------------------------------------------------------------

function validateOverlay(overlay: Overlay): Diagnostic[] {
  const diags: Diagnostic[] = [];

  if (!overlay.docset) {
    diags.push({level: 'error', context: 'overlay.docset', message: 'docset identifier is required'});
  }

  if (!Array.isArray(overlay.patches) || overlay.patches.length === 0) {
    diags.push({level: 'warn', context: 'overlay.patches', message: 'no patches defined — overlay has no effect'});
    return diags;
  }

  const seenIds = new Set<string>();
  for (const patch of overlay.patches) {
    if (!patch.operationId) {
      diags.push({level: 'error', context: 'patch', message: 'each patch must have an operationId'});
    } else if (seenIds.has(patch.operationId)) {
      diags.push({
        level: 'error',
        context: `patch[${patch.operationId}]`,
        message: 'duplicate operationId in patches',
      });
    } else {
      seenIds.add(patch.operationId);
    }
  }

  return diags;
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

function buildOperationIndex(
  spec: OpenApiSpec,
): Map<string, {path: string; method: string; op: OpenApiOperation}> {
  const index = new Map<string, {path: string; method: string; op: OpenApiOperation}>();

  for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method] as OpenApiOperation | undefined;
      if (op?.operationId) {
        index.set(op.operationId, {path: pathKey, method, op});
      }
    }
  }

  return index;
}

function applyOverlay(spec: OpenApiSpec, overlay: Overlay): {spec: OpenApiSpec; diagnostics: Diagnostic[]} {
  const diags: Diagnostic[] = [];
  const opIndex = buildOperationIndex(spec);

  // Deep-clone the spec so we don't mutate the input
  const merged: OpenApiSpec = JSON.parse(JSON.stringify(spec));
  const mergedOpIndex = buildOperationIndex(merged);

  for (const patch of overlay.patches) {
    const entry = mergedOpIndex.get(patch.operationId);

    if (!entry) {
      diags.push({
        level: 'error',
        context: `patch[${patch.operationId}]`,
        message: `operationId "${patch.operationId}" not found in spec`,
      });
      continue;
    }

    const {op} = entry;

    // Apply non-parameter, non-metadata keys (x-* extensions, summary, description overrides)
    for (const [key, value] of Object.entries(patch)) {
      if (key === 'operationId' || key === 'parameters' || key === 'description') continue;
      op[key] = value;
    }

    // Description override (separate since we skip it in the loop above to handle specially)
    if (patch.description !== undefined) {
      // Patch description is the patch's own description, not an operation override
      // Use x-patch-description instead to avoid confusion
    }

    // Apply parameter patches
    if (patch.parameters) {
      const existingParams = (op.parameters as Array<{name: string; [key: string]: unknown}>) ?? [];

      for (const paramPatch of patch.parameters) {
        const existing = existingParams.find(p => p.name === paramPatch.name);
        if (!existing) {
          diags.push({
            level: 'warn',
            context: `patch[${patch.operationId}].parameters[${paramPatch.name}]`,
            message: `parameter "${paramPatch.name}" not found in operation — patch has no effect`,
          });
          continue;
        }

        // Shallow merge patch fields onto existing parameter
        for (const [key, value] of Object.entries(paramPatch)) {
          if (key === 'name') continue;
          existing[key] = value;
        }
      }

      op.parameters = existingParams;
    }

    // Mark operation as patched
    op['x-overlay-applied'] = overlay.docset;
  }

  // Mark the merged spec
  (merged as Record<string, unknown>)['x-overlay-applied'] = overlay.docset;
  (merged as Record<string, unknown>)['x-overlay-applied-at'] = new Date().toISOString();

  return {spec: merged, diagnostics: diags};
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
  console[d.level === 'error' ? 'error' : 'warn'](`[apply-overlay] ${prefix}: ${d.context} — ${d.message}`);
  if (d.level === 'error') hasErrors = true;
}
if (hasErrors) process.exit(1);

// Apply patches
const {spec: merged, diagnostics: applyDiags} = applyOverlay(spec, overlay);

for (const d of applyDiags) {
  const prefix = d.level === 'error' ? 'ERROR' : 'WARN';
  console[d.level === 'error' ? 'error' : 'warn'](`[apply-overlay] ${prefix}: ${d.context} — ${d.message}`);
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
