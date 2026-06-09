/**
 * RBAC permission check: Epic 5, Story 5.5
 *
 * Checks whether a named GitHub actor has a required capability according to
 * rbac.config.json. Exits 0 if authorised, exits 1 if not.
 *
 * Used in .github/workflows/rbac-check.yml to gate deployments on push to main.
 *
 * Usage:
 *   npx tsx scripts/check-rbac-permission.ts \
 *     --actor <github-username> \
 *     --capability <capability-id> \
 *     [--docset <docset-id>] \
 *     [--config <path>]
 *
 * Examples:
 *   npx tsx scripts/check-rbac-permission.ts --actor mattsmith --capability content.publish
 *   npx tsx scripts/check-rbac-permission.ts --actor reviewer --capability content.view --docset tfl
 *
 * Team membership:
 *   Principals prefixed with "team:" are matched against the actor string
 *   directly. The caller must expand team membership before invoking this script
 *   (GitHub Actions: use the GitHub API or a team-membership action to resolve teams).
 *   For CI simplicity, direct username assignments are checked first.
 */

import fs from 'fs';
import path from 'path';
import {
  validateRbacConfig,
  hasCapability,
  ROLE_DEFINITIONS,
} from './validate-rbac-config.js';
import type {RbacConfig, RbacCapability, RbacRole} from './validate-rbac-config.js';

// ---------------------------------------------------------------------------
// Permission resolution
// ---------------------------------------------------------------------------

type CheckResult =
  | {authorised: true; role: RbacRole; scope: 'portal' | 'docset'}
  | {authorised: false; reason: string};

function checkPermission(
  config: RbacConfig,
  actor: string,
  capability: RbacCapability,
  docsetId?: string,
): CheckResult {
  // Collect all assignments matching this actor (direct username only; see JSDoc on team:)
  const matching = config.assignments.filter(a => {
    if (a.principal === actor) return true;
    // Team slug match: the caller is responsible for resolving team membership.
    // We still check it here so direct team entries work in simple scenarios.
    if (a.principal.startsWith('team:')) return false;
    return false;
  });

  if (matching.length === 0) {
    return {
      authorised: false,
      reason: `actor "${actor}" has no assignments in rbac.config.json`,
    };
  }

  // Prefer docset-scoped assignment if a docsetId was provided
  if (docsetId) {
    const docsetAssignment = matching.find(a => a.docsetId === docsetId);
    if (docsetAssignment && hasCapability(docsetAssignment.role, capability)) {
      return {authorised: true, role: docsetAssignment.role, scope: 'docset'};
    }
  }

  // Fall back to portal-level (no docsetId)
  const portalAssignments = matching.filter(a => !a.docsetId);
  for (const assignment of portalAssignments) {
    if (hasCapability(assignment.role, capability)) {
      return {authorised: true, role: assignment.role, scope: 'portal'};
    }
  }

  // Actor exists but lacks the required capability
  const roles = matching.map(a => a.role).join(', ');
  const capDef = ROLE_DEFINITIONS.find(d => d.capabilities.includes(capability as RbacCapability));
  const minimumRole = capDef ? `(minimum role with this capability: ${capDef.role})` : '';
  return {
    authorised: false,
    reason: `actor "${actor}" has role(s) [${roles}] which do not include "${capability}" ${minimumRole}`.trim(),
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {
  actor: string;
  capability: string;
  docsetId?: string;
  configPath: string;
} {
  const args = process.argv.slice(2);

  function flag(name: string): string | undefined {
    const idx = args.indexOf(name);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  }

  const actor = flag('--actor');
  const capability = flag('--capability');
  const docsetId = flag('--docset');
  const configArg = flag('--config');
  const configPath = configArg
    ? path.resolve(process.cwd(), configArg)
    : path.resolve(process.cwd(), 'rbac.config.json');

  if (!actor) {
    console.error('[rbac-check] ERROR: --actor is required');
    process.exit(1);
  }
  if (!capability) {
    console.error('[rbac-check] ERROR: --capability is required');
    process.exit(1);
  }

  return {actor, capability, docsetId, configPath};
}

const {actor, capability, docsetId, configPath} = parseArgs();

// Validate capability is a known value
const KNOWN_CAPABILITIES: RbacCapability[] = [
  'platform.configure',
  'platform.audit',
  'content.publish',
  'content.edit',
  'content.review',
  'content.view',
  'api.manage',
  'analytics.view',
];
if (!KNOWN_CAPABILITIES.includes(capability as RbacCapability)) {
  console.error(`[rbac-check] ERROR: unknown capability "${capability}"`);
  console.error(`  Valid capabilities: ${KNOWN_CAPABILITIES.join(', ')}`);
  process.exit(1);
}

if (!fs.existsSync(configPath)) {
  console.error(`[rbac-check] ERROR: config file not found: ${configPath}`);
  console.error('  Copy rbac.config.example.json to rbac.config.json and define role assignments.');
  process.exit(1);
}

let config: RbacConfig;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[rbac-check] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const validationErrors = validateRbacConfig(config);
const hardErrors = validationErrors.filter(e => e.level === 'error');
if (hardErrors.length > 0) {
  console.error('[rbac-check] ERROR: rbac.config.json is invalid. Run npm run validate-rbac first.');
  for (const e of hardErrors) {
    console.error(`  ${e.field}: ${e.message}`);
  }
  process.exit(1);
}

const result = checkPermission(config, actor, capability as RbacCapability, docsetId);

if (result.authorised) {
  const scopeNote = result.scope === 'docset' && docsetId ? ` (docset: ${docsetId})` : ' (portal-level)';
  console.log(`[rbac-check] AUTHORISED: ${actor}: role: ${result.role}${scopeNote}; capability: ${capability}`);
  process.exit(0);
} else {
  const denied = result as {authorised: false; reason: string};
  console.error(`[rbac-check] DENIED: ${denied.reason}`);
  console.error(`  Required capability: ${capability}`);
  if (docsetId) {
    console.error(`  Docset scope: ${docsetId}`);
  }
  process.exit(1);
}
