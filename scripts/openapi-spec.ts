/**
 * OpenAPI spec helpers: shared by normalize-openapi.ts (Epic 2, Story 2.1) and
 * apply-overlay.ts (Epic 2, Story 2.2).
 *
 * Normalization contract:
 *  - info.title, info.version are required; info.description is recommended
 *  - At least one server entry is required; a non-HTTPS primary server is warned
 *  - At least one path is required
 *  - Every operation must have a unique operationId and responses; summary and tags are recommended
 *  - Servers list is deduplicated
 *  - Paths and methods are sorted for deterministic output
 *
 * Overlay patch semantics:
 *  - Patches are matched by operationId (required, must exist in spec)
 *  - Parameter patches matched by name; missing parameters are warned
 *  - Other keys (x-*, summary) are shallow-merged onto the operation. A patch's
 *    description documents the patch itself and is not copied.
 *
 * Importing this module has no side effects, so it can be unit tested.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

export type OpenApiOperation = {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Array<{name: string; [key: string]: unknown}>;
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  [key: string]: unknown;
};

export type OpenApiPathItem = Partial<Record<HttpMethod, OpenApiOperation>> & {[key: string]: unknown};

export type OpenApiSpec = {
  openapi: string;
  info: {title: string; version: string; description?: string; [key: string]: unknown};
  servers?: Array<{url: string; description?: string; [key: string]: unknown}>;
  paths?: Record<string, OpenApiPathItem>;
  [key: string]: unknown;
};

export type NormalizedSpec = OpenApiSpec & {
  'x-normalized': true;
  'x-normalized-at': string;
  'x-source-file': string;
};

export type SpecDiagnostic = {
  level: 'error' | 'warn';
  path: string;
  message: string;
};

export type ParameterPatch = {
  name: string;
  example?: unknown;
  description?: string;
  [key: string]: unknown;
};

export type OperationPatch = {
  operationId: string;
  description?: string;
  summary?: string;
  parameters?: ParameterPatch[];
  [key: string]: unknown;
};

export type Overlay = {
  $schema?: string;
  docset: string;
  description?: string;
  patches: OperationPatch[];
};

export type OverlayDiagnostic = {
  level: 'error' | 'warn';
  context: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateSpec(spec: OpenApiSpec): SpecDiagnostic[] {
  const diags: SpecDiagnostic[] = [];

  // OpenAPI version
  if (typeof spec.openapi !== 'string' || !spec.openapi.startsWith('3.')) {
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
    diags.push({level: 'warn', path: 'info.description', message: 'missing: recommended for portal display'});
  }

  // Servers
  if (!spec.servers || spec.servers.length === 0) {
    diags.push({level: 'error', path: 'servers', message: 'at least one server entry is required'});
  } else {
    const primaryUrl = spec.servers[0]?.url;
    if (typeof primaryUrl !== 'string' || primaryUrl === '') {
      diags.push({level: 'error', path: 'servers[0].url', message: 'required'});
    } else if (!primaryUrl.startsWith('https://')) {
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
    return diags;
  }

  const seenIds = new Map<string, string>();
  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op) continue;

      const opPath = `paths.${pathKey}.${method}`;

      if (!op.operationId) {
        diags.push({level: 'error', path: `${opPath}.operationId`, message: 'required'});
      } else if (seenIds.has(op.operationId)) {
        diags.push({
          level: 'error',
          path: `${opPath}.operationId`,
          message: `duplicate operationId "${op.operationId}": also used at ${seenIds.get(op.operationId)}`,
        });
      } else {
        seenIds.set(op.operationId, opPath);
      }
      if (!op.summary) {
        diags.push({level: 'warn', path: `${opPath}.summary`, message: 'missing: recommended for sidebar display'});
      }
      if (!op.tags || op.tags.length === 0) {
        diags.push({level: 'warn', path: `${opPath}.tags`, message: 'missing: operations should have at least one tag'});
      }
      if (!op.responses || Object.keys(op.responses).length === 0) {
        diags.push({level: 'error', path: `${opPath}.responses`, message: 'required'});
      }
    }
  }

  return diags;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** sourceLabel is recorded as x-source-file (the CLI passes a repo-relative path). */
export function normalizeSpec(spec: OpenApiSpec, sourceLabel: string, now: Date = new Date()): NormalizedSpec {
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
      if (!HTTP_METHODS.includes(key as HttpMethod) && !(key in sortedPathItem)) {
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
    'x-normalized-at': now.toISOString(),
    'x-source-file': sourceLabel,
  };
}

// ---------------------------------------------------------------------------
// Overlays
// ---------------------------------------------------------------------------

export function validateOverlay(overlay: Overlay): OverlayDiagnostic[] {
  const diags: OverlayDiagnostic[] = [];

  if (!overlay.docset) {
    diags.push({level: 'error', context: 'overlay.docset', message: 'docset identifier is required'});
  }

  if (!Array.isArray(overlay.patches) || overlay.patches.length === 0) {
    diags.push({level: 'warn', context: 'overlay.patches', message: 'no patches defined: overlay has no effect'});
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

function buildOperationIndex(spec: OpenApiSpec): Map<string, OpenApiOperation> {
  const index = new Map<string, OpenApiOperation>();
  for (const pathItem of Object.values(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (op?.operationId) index.set(op.operationId, op);
    }
  }
  return index;
}

export function applyOverlay(
  spec: OpenApiSpec,
  overlay: Overlay,
  now: Date = new Date(),
): {spec: OpenApiSpec; diagnostics: OverlayDiagnostic[]} {
  const diags: OverlayDiagnostic[] = [];

  // Deep-clone the spec so we don't mutate the input
  const merged: OpenApiSpec = JSON.parse(JSON.stringify(spec));
  const opIndex = buildOperationIndex(merged);

  for (const patch of overlay.patches) {
    const op = opIndex.get(patch.operationId);

    if (!op) {
      diags.push({
        level: 'error',
        context: `patch[${patch.operationId}]`,
        message: `operationId "${patch.operationId}" not found in spec`,
      });
      continue;
    }

    // Shallow-merge other keys (x-* extensions, summary). The patch description documents the patch, so skip it.
    for (const [key, value] of Object.entries(patch)) {
      if (key === 'operationId' || key === 'parameters' || key === 'description') continue;
      op[key] = value;
    }

    // Apply parameter patches
    for (const paramPatch of patch.parameters ?? []) {
      const existing = op.parameters?.find(p => p.name === paramPatch.name);
      if (!existing) {
        diags.push({
          level: 'warn',
          context: `patch[${patch.operationId}].parameters[${paramPatch.name}]`,
          message: `parameter "${paramPatch.name}" not found in operation: patch has no effect`,
        });
        continue;
      }

      // Shallow merge patch fields onto existing parameter
      for (const [key, value] of Object.entries(paramPatch)) {
        if (key === 'name') continue;
        existing[key] = value;
      }
    }

    // Mark operation as patched
    op['x-overlay-applied'] = overlay.docset;
  }

  // Mark the merged spec
  merged['x-overlay-applied'] = overlay.docset;
  merged['x-overlay-applied-at'] = now.toISOString();

  return {spec: merged, diagnostics: diags};
}
