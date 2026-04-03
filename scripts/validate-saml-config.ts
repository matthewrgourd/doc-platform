/**
 * SAML SSO configuration schema and validator — Epic 5, Story 5.1
 *
 * Defines the config shape for SAML 2.0 SSO integration and validates it
 * at build/deploy time. Designed to be consumed by a server-side auth layer
 * (not the static Docusaurus build itself — SSO enforcement happens at the
 * hosting/proxy layer).
 *
 * Config file: saml.config.json at the project root (gitignored in production;
 * use saml.config.example.json as the committed template).
 *
 * Usage:
 *   npx tsx scripts/validate-saml-config.ts [--config <path>]
 *   npx tsx scripts/validate-saml-config.ts --config saml.config.json
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SamlProtectedMode = 'none' | 'portal' | 'docset';

export type SamlDocsetRule = {
  /** Docset ID to protect (must match a registered docset). */
  docsetId: string;
  /** If true, this docset requires SSO authentication to view. */
  protected: boolean;
  /** Optional list of RBAC roles allowed to view this docset (empty = all authenticated users). */
  allowedRoles?: string[];
};

export type SamlConfig = {
  /**
   * Whether SSO is enabled and what scope it protects.
   *   none    — SSO configured but not enforced (dry-run mode)
   *   portal  — entire portal requires authentication
   *   docset  — per-docset rules in `docsetRules` apply
   */
  protectedMode: SamlProtectedMode;

  /** Your application's SAML Entity ID (SP entity ID). Must be a URI. */
  entityId: string;

  /**
   * Assertion Consumer Service URL — where the IdP posts the SAML response.
   * Must be HTTPS in production.
   */
  acsUrl: string;

  /** IdP metadata — provide either metadataUrl OR the inline fields below. */
  idp: {
    /** URL to fetch IdP metadata XML (auto-refreshed on startup). */
    metadataUrl?: string;
    /** IdP Entity ID (required if metadataUrl not provided). */
    entityId?: string;
    /** IdP SSO URL (redirect or POST binding). */
    ssoUrl?: string;
    /** IdP X.509 certificate (PEM, without headers). */
    certificate?: string;
  };

  /** Per-docset protection rules (used when protectedMode is "docset"). */
  docsetRules?: SamlDocsetRule[];

  /**
   * Session duration in seconds. Default: 28800 (8 hours).
   * After expiry, users must re-authenticate.
   */
  sessionDurationSeconds?: number;

  /**
   * If true, authentication failures are written to the audit log.
   * Strongly recommended in production.
   */
  auditLoginFailures?: boolean;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ConfigError = {level: 'error' | 'warn'; field: string; message: string};

export function validateSamlConfig(config: SamlConfig): ConfigError[] {
  const errors: ConfigError[] = [];

  const validModes: SamlProtectedMode[] = ['none', 'portal', 'docset'];
  if (!validModes.includes(config.protectedMode)) {
    errors.push({level: 'error', field: 'protectedMode', message: `must be one of: ${validModes.join(', ')}`});
  }

  if (!config.entityId) {
    errors.push({level: 'error', field: 'entityId', message: 'required — must be a URI identifying your SP'});
  } else if (!config.entityId.startsWith('http')) {
    errors.push({level: 'warn', field: 'entityId', message: 'should be a URI (e.g. https://your-domain.com/saml/sp)'});
  }

  if (!config.acsUrl) {
    errors.push({level: 'error', field: 'acsUrl', message: 'required — Assertion Consumer Service URL'});
  } else if (!config.acsUrl.startsWith('https://')) {
    errors.push({level: 'warn', field: 'acsUrl', message: 'should use HTTPS in production'});
  }

  if (!config.idp) {
    errors.push({level: 'error', field: 'idp', message: 'required'});
  } else {
    const hasMetadataUrl = !!config.idp.metadataUrl;
    const hasInline = !!config.idp.entityId && !!config.idp.ssoUrl && !!config.idp.certificate;

    if (!hasMetadataUrl && !hasInline) {
      errors.push({
        level: 'error',
        field: 'idp',
        message: 'provide either idp.metadataUrl or all of idp.entityId, idp.ssoUrl, and idp.certificate',
      });
    }
  }

  if (config.protectedMode === 'docset') {
    if (!config.docsetRules || config.docsetRules.length === 0) {
      errors.push({
        level: 'error',
        field: 'docsetRules',
        message: 'required when protectedMode is "docset" — define at least one rule',
      });
    } else {
      const seenIds = new Set<string>();
      for (const rule of config.docsetRules) {
        if (!rule.docsetId) {
          errors.push({level: 'error', field: 'docsetRules[].docsetId', message: 'required'});
        } else if (seenIds.has(rule.docsetId)) {
          errors.push({level: 'error', field: `docsetRules[${rule.docsetId}]`, message: 'duplicate docsetId'});
        }
        seenIds.add(rule.docsetId);
      }
    }
  }

  if (config.sessionDurationSeconds !== undefined && config.sessionDurationSeconds < 300) {
    errors.push({level: 'warn', field: 'sessionDurationSeconds', message: 'very short session (<5 min) — users will re-authenticate frequently'});
  }

  if (!config.auditLoginFailures) {
    errors.push({level: 'warn', field: 'auditLoginFailures', message: 'recommended to set true in production for compliance'});
  }

  return errors;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {configPath: string} {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--config');
  const configPath = idx !== -1 && args[idx + 1]
    ? path.resolve(process.cwd(), args[idx + 1])
    : path.resolve(process.cwd(), 'saml.config.json');
  return {configPath};
}

const {configPath} = parseArgs();

if (!fs.existsSync(configPath)) {
  console.error(`[saml-config] ERROR: config file not found: ${configPath}`);
  console.error('  Copy saml.config.example.json to saml.config.json and fill in your IdP details.');
  process.exit(1);
}

let config: SamlConfig;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[saml-config] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const errors = validateSamlConfig(config);
let hasErrors = false;

for (const e of errors) {
  const prefix = e.level === 'error' ? 'ERROR' : 'WARN';
  console[e.level === 'error' ? 'error' : 'warn'](`[saml-config] ${prefix}: ${e.field} — ${e.message}`);
  if (e.level === 'error') hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
} else {
  const warnCount = errors.filter(e => e.level === 'warn').length;
  console.log(`[saml-config] config valid — mode: ${config.protectedMode}${warnCount > 0 ? ` (${warnCount} warning(s))` : ''}`);
}
