/**
 * RBAC role schema and validator — Epic 5, Story 5.2
 *
 * Defines the four platform roles, their capability sets, and validates
 * a role assignment config file at build/deploy time.
 *
 * Roles (highest to lowest privilege):
 *   admin       — full platform control; configure SSO, manage roles, publish
 *   maintainer  — manage content and publish; cannot change platform config
 *   contributor — draft and edit content; cannot publish or change config
 *   viewer      — read-only access to protected docsets
 *
 * Config file: rbac.config.json at the project root.
 *
 * Usage:
 *   npx tsx scripts/validate-rbac-config.ts [--config <path>]
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RbacRole = 'admin' | 'maintainer' | 'contributor' | 'viewer';

export type RbacCapability =
  | 'platform.configure'   // modify docusaurus.config.ts, saml.config.json, rbac.config.json
  | 'platform.audit'       // read audit logs
  | 'content.publish'      // merge to main / trigger deploy
  | 'content.edit'         // create/edit/delete content files
  | 'content.review'       // approve PRs
  | 'content.view'         // read protected docset content
  | 'api.manage'           // modify OpenAPI specs and overlays
  | 'analytics.view';      // access analytics dashboard

export type RbacRoleDefinition = {
  role: RbacRole;
  description: string;
  capabilities: RbacCapability[];
};

export type RbacAssignment = {
  /** GitHub username or team slug (prefix team slugs with "team:"). */
  principal: string;
  role: RbacRole;
  /** Optional scope — if omitted, applies to all docsets. */
  docsetId?: string;
  /** ISO 8601 timestamp — for audit trail. */
  assignedAt: string;
  /** Who made this assignment — for audit trail. */
  assignedBy: string;
};

export type RbacConfig = {
  /** Schema version for forward-compatibility checks. */
  schemaVersion: string;
  assignments: RbacAssignment[];
};

// ---------------------------------------------------------------------------
// Role capability matrix (source of truth)
// ---------------------------------------------------------------------------

export const ROLE_DEFINITIONS: RbacRoleDefinition[] = [
  {
    role: 'admin',
    description: 'Full platform control. Manages SSO, roles, content, and publishing.',
    capabilities: [
      'platform.configure',
      'platform.audit',
      'content.publish',
      'content.edit',
      'content.review',
      'content.view',
      'api.manage',
      'analytics.view',
    ],
  },
  {
    role: 'maintainer',
    description: 'Manages and publishes content. Cannot change platform or SSO config.',
    capabilities: [
      'platform.audit',
      'content.publish',
      'content.edit',
      'content.review',
      'content.view',
      'api.manage',
      'analytics.view',
    ],
  },
  {
    role: 'contributor',
    description: 'Drafts and edits content. Cannot publish or approve.',
    capabilities: [
      'content.edit',
      'content.view',
    ],
  },
  {
    role: 'viewer',
    description: 'Read-only access to protected docset content.',
    capabilities: [
      'content.view',
    ],
  },
];

export function getRoleDefinition(role: RbacRole): RbacRoleDefinition | undefined {
  return ROLE_DEFINITIONS.find(d => d.role === role);
}

export function hasCapability(role: RbacRole, capability: RbacCapability): boolean {
  const def = getRoleDefinition(role);
  return def?.capabilities.includes(capability) ?? false;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ConfigError = {level: 'error' | 'warn'; field: string; message: string};

const VALID_ROLES: RbacRole[] = ['admin', 'maintainer', 'contributor', 'viewer'];
const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export function validateRbacConfig(config: RbacConfig): ConfigError[] {
  const errors: ConfigError[] = [];

  if (!config.schemaVersion) {
    errors.push({level: 'error', field: 'schemaVersion', message: 'required'});
  }

  if (!Array.isArray(config.assignments)) {
    errors.push({level: 'error', field: 'assignments', message: 'must be an array'});
    return errors;
  }

  if (config.assignments.length === 0) {
    errors.push({level: 'warn', field: 'assignments', message: 'no role assignments defined — portal has no access controls'});
  }

  // Ensure at least one admin
  const admins = config.assignments.filter(a => a.role === 'admin' && !a.docsetId);
  if (admins.length === 0) {
    errors.push({level: 'error', field: 'assignments', message: 'at least one portal-level admin assignment is required'});
  }

  for (let i = 0; i < config.assignments.length; i++) {
    const a = config.assignments[i];
    const ctx = `assignments[${i}]`;

    if (!a.principal) {
      errors.push({level: 'error', field: `${ctx}.principal`, message: 'required — GitHub username or "team:<slug>"'});
    }

    if (!VALID_ROLES.includes(a.role)) {
      errors.push({level: 'error', field: `${ctx}.role`, message: `"${a.role}" is not a valid role — must be one of: ${VALID_ROLES.join(', ')}`});
    }

    if (!a.assignedAt || !ISO_8601_RE.test(a.assignedAt)) {
      errors.push({level: 'error', field: `${ctx}.assignedAt`, message: 'required — ISO 8601 timestamp (e.g. 2026-04-03T09:00:00Z)'});
    }

    if (!a.assignedBy) {
      errors.push({level: 'error', field: `${ctx}.assignedBy`, message: 'required — GitHub username of assigner (audit trail)'});
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {configPath: string; listRoles: boolean} {
  const args = process.argv.slice(2);
  const listRoles = args.includes('--list-roles');
  const idx = args.indexOf('--config');
  const configPath = idx !== -1 && args[idx + 1]
    ? path.resolve(process.cwd(), args[idx + 1])
    : path.resolve(process.cwd(), 'rbac.config.json');
  return {configPath, listRoles};
}

const {configPath, listRoles} = parseArgs();

if (listRoles) {
  console.log('\nRole capability matrix:\n');
  for (const def of ROLE_DEFINITIONS) {
    console.log(`  ${def.role.padEnd(14)} ${def.description}`);
    for (const cap of def.capabilities) {
      console.log(`    ✓ ${cap}`);
    }
    console.log();
  }
  process.exit(0);
}

if (!fs.existsSync(configPath)) {
  console.error(`[rbac-config] ERROR: config file not found: ${configPath}`);
  process.exit(1);
}

let config: RbacConfig;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[rbac-config] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const errors = validateRbacConfig(config);
let hasErrors = false;

for (const e of errors) {
  const prefix = e.level === 'error' ? 'ERROR' : 'WARN';
  console[e.level === 'error' ? 'error' : 'warn'](`[rbac-config] ${prefix}: ${e.field} — ${e.message}`);
  if (e.level === 'error') hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
} else {
  const warnCount = errors.filter(e => e.level === 'warn').length;
  const assignmentCount = config.assignments?.length ?? 0;
  console.log(`[rbac-config] config valid — ${assignmentCount} assignment(s)${warnCount > 0 ? ` (${warnCount} warning(s))` : ''}`);
}
