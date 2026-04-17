/**
 * Docset configuration schema — Epic 1, Story 1.2
 *
 * Each docset under docs/ may optionally have a config that declares:
 *  - display name
 *  - version list with CalVer strings and lifecycle states
 *  - which version is the canonical "latest"
 *
 * For unversioned docsets, omit the `versions` field or leave it empty.
 *
 * CalVer format: yyyy.mm  or  yyyy.mm-LTS
 * Examples: "2024.01", "2024.06-LTS"
 *
 * Lifecycle states:
 *   "active"     — current, fully supported
 *   "lts"        — Long-term support, security/critical fixes only
 *   "deprecated" — approaching end-of-life, users should migrate
 *   "eol"        — no longer supported, kept for reference only
 */

// ---------------------------------------------------------------------------
// CalVer helpers
// ---------------------------------------------------------------------------

const CALVER_RE = /^\d{4}\.\d{2}(-LTS)?$/;

export function isValidCalVer(version: string): boolean {
  return CALVER_RE.test(version);
}

/**
 * Resolves "latest" to the highest active/lts version in a docset config.
 * Returns undefined if the docset is unversioned.
 */
export function resolveLatestVersion(config: DocsetConfig): string | undefined {
  if (!config.versions || config.versions.length === 0) return undefined;

  // Explicit latest wins
  if (config.latestVersion) return config.latestVersion;

  // Otherwise: highest CalVer among active/lts versions
  const candidates = config.versions
    .filter(v => v.state === 'active' || v.state === 'lts')
    .map(v => v.id)
    .sort()
    .reverse();

  return candidates[0];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VersionLifecycleState = 'active' | 'lts' | 'deprecated' | 'eol';

export type VersionEntry = {
  /** CalVer string, e.g. "2024.06" or "2024.06-LTS". */
  id: string;
  /** Human-readable label shown in version selectors, e.g. "June 2024". */
  label: string;
  /** Lifecycle state for this version. */
  state: VersionLifecycleState;
};

export type DocsetConfig = {
  /** Docset folder name under docs/ (must match directory name exactly). */
  id: string;
  /** Human-readable display name, e.g. "Transport for London". */
  name: string;
  /**
   * Ordered list of versions. Omit or leave empty for unversioned docsets.
   * Versions should be listed newest first.
   */
  versions?: VersionEntry[];
  /**
   * Explicit latest version ID. If omitted, resolved automatically as the
   * highest active/lts CalVer version.
   */
  latestVersion?: string;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ValidationError = {
  docsetId: string;
  field: string;
  message: string;
};

export function validateDocsetConfig(config: DocsetConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.id || config.id.trim() === '') {
    errors.push({docsetId: config.id ?? '(unknown)', field: 'id', message: 'id is required'});
  }

  if (!config.name || config.name.trim() === '') {
    errors.push({docsetId: config.id, field: 'name', message: 'name is required'});
  }

  if (config.versions) {
    const seenIds = new Set<string>();
    for (const version of config.versions) {
      if (!isValidCalVer(version.id)) {
        errors.push({
          docsetId: config.id,
          field: `versions[${version.id}].id`,
          message: `"${version.id}" is not a valid CalVer string (expected yyyy.mm or yyyy.mm-LTS)`,
        });
      }

      if (seenIds.has(version.id)) {
        errors.push({
          docsetId: config.id,
          field: `versions[${version.id}]`,
          message: `duplicate version id: "${version.id}"`,
        });
      }
      seenIds.add(version.id);

      if (!version.label || version.label.trim() === '') {
        errors.push({
          docsetId: config.id,
          field: `versions[${version.id}].label`,
          message: 'label is required',
        });
      }

      const validStates: VersionLifecycleState[] = ['active', 'lts', 'deprecated', 'eol'];
      if (!validStates.includes(version.state)) {
        errors.push({
          docsetId: config.id,
          field: `versions[${version.id}].state`,
          message: `"${version.state}" is not a valid lifecycle state (expected: ${validStates.join(', ')})`,
        });
      }
    }

    if (config.latestVersion && !seenIds.has(config.latestVersion)) {
      errors.push({
        docsetId: config.id,
        field: 'latestVersion',
        message: `latestVersion "${config.latestVersion}" is not listed in versions`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry — the source of truth for all configured docsets
// ---------------------------------------------------------------------------

/**
 * Docset configurations. Add an entry here when a new docset is added
 * to the docs/ directory. Unversioned docsets only need id and name.
 *
 * Example versioned entry:
 *
 *   {
 *     id: 'my-api',
 *     name: 'My API',
 *     versions: [
 *       { id: '2025.06', label: 'June 2025', state: 'active' },
 *       { id: '2024.12-LTS', label: 'December 2024 LTS', state: 'lts' },
 *       { id: '2024.06', label: 'June 2024', state: 'deprecated' },
 *     ],
 *   }
 */
export const DOCSET_REGISTRY: DocsetConfig[] = [
  {
    id: 'devdocify',
    name: 'DevDocify',
  },
  {
    id: 'tfl',
    name: 'Transport for London',
  },
  {
    id: 'petstore',
    name: 'Petstore',
  },
  {
    id: 'platzi',
    name: 'Platzi Fake Store',
  },
];

// ---------------------------------------------------------------------------
// Build-time validation entry point
// ---------------------------------------------------------------------------

/**
 * Validates all registered docset configs. Throws on any error.
 * Called from the manifest builder or build scripts.
 */
export function validateAllDocsetConfigs(): void {
  const allErrors: ValidationError[] = [];

  for (const config of DOCSET_REGISTRY) {
    const errors = validateDocsetConfig(config);
    allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    for (const err of allErrors) {
      console.error(`[docset-config] ERROR: ${err.docsetId}.${err.field} — ${err.message}`);
    }
    process.exit(1);
  }

  console.log(`[docset-config] validated ${DOCSET_REGISTRY.length} docset configs — OK`);
}
