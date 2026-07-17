/**
 * Custom domain configuration schema and validator: Epic 13, Story 13.1
 *
 * Validates the domain configuration file for correctness before deployment.
 * Checks for duplicate domains, redirect loops, required fields, and DNS
 * record plausibility.
 *
 * Config file: domains.config.json at the project root (gitignored in
 * production; use domains.config.example.json as the committed template).
 *
 * Usage:
 *   npx tsx scripts/validate-domains-config.ts [--config <path>]
 *   npx tsx scripts/validate-domains-config.ts --config domains.config.json
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DomainAlias = {
  /** Alias domain (e.g. apex without www). */
  domain: string;
  /** If true, requests to this alias 308-redirect to the primary domain. */
  redirectToPrimary: boolean;
};

export type DocsetDomain = {
  /** Custom domain that serves a specific docset. */
  domain: string;
  /** Docset ID that this domain serves (must match a registered docset). */
  docsetId: string;
  /** Base path on the custom domain (default "/"). */
  basePath?: string;
};

export type LegacyRedirect = {
  /** Domain being retired. */
  fromDomain: string;
  /** Domain to redirect to. */
  toDomain: string;
  /** HTTP status code for the redirect (default 308). */
  statusCode?: 301 | 302 | 307 | 308;
  /** If true, the URL path is preserved in the redirect. */
  preservePath?: boolean;
};

export type DnsRecord = {
  type: 'A' | 'AAAA' | 'CNAME';
  name: string;
  value: string;
};

export type DomainsConfig = {
  /** The primary production domain. */
  primaryDomain: string;
  /** Additional domains that redirect to or mirror the primary. */
  aliases?: DomainAlias[];
  /** Per-docset custom domain mappings. */
  docsetDomains?: DocsetDomain[];
  /** Legacy domain redirect rules. */
  legacyRedirects?: LegacyRedirect[];
  /** DNS record expectations (reference only, not enforced). */
  dns?: {
    expectedRecords?: DnsRecord[];
  };
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ConfigError = { level: 'error' | 'warn'; field: string; message: string };

export function validateDomainsConfig(config: DomainsConfig): ConfigError[] {
  const errors: ConfigError[] = [];
  const allDomains = new Set<string>();

  // Primary domain
  if (!config.primaryDomain) {
    errors.push({ level: 'error', field: 'primaryDomain', message: 'required' });
  } else {
    if (config.primaryDomain.includes('://')) {
      errors.push({ level: 'error', field: 'primaryDomain', message: 'must be a bare domain, not a URL (remove protocol)' });
    }
    allDomains.add(config.primaryDomain);
  }

  // Aliases
  if (config.aliases) {
    for (const alias of config.aliases) {
      if (!alias.domain) {
        errors.push({ level: 'error', field: 'aliases[].domain', message: 'required' });
        continue;
      }
      if (alias.domain === config.primaryDomain) {
        errors.push({ level: 'error', field: `aliases[${alias.domain}]`, message: 'alias cannot be the same as primaryDomain' });
      }
      if (allDomains.has(alias.domain)) {
        errors.push({ level: 'error', field: `aliases[${alias.domain}]`, message: 'duplicate domain' });
      }
      allDomains.add(alias.domain);
    }
  }

  // Docset domains
  if (config.docsetDomains) {
    const seenDocsets = new Set<string>();
    for (const dd of config.docsetDomains) {
      if (!dd.domain) {
        errors.push({ level: 'error', field: 'docsetDomains[].domain', message: 'required' });
      }
      if (!dd.docsetId) {
        errors.push({ level: 'error', field: 'docsetDomains[].docsetId', message: 'required' });
      }
      if (dd.domain && allDomains.has(dd.domain)) {
        errors.push({ level: 'error', field: `docsetDomains[${dd.domain}]`, message: 'duplicate domain (already used as primary or alias)' });
      }
      if (dd.docsetId && seenDocsets.has(dd.docsetId)) {
        errors.push({ level: 'warn', field: `docsetDomains[${dd.docsetId}]`, message: 'docset mapped to multiple domains' });
      }
      if (dd.domain) allDomains.add(dd.domain);
      if (dd.docsetId) seenDocsets.add(dd.docsetId);
    }
  }

  // Legacy redirects
  if (config.legacyRedirects) {
    const redirectSources = new Set<string>();
    for (const lr of config.legacyRedirects) {
      if (!lr.fromDomain) {
        errors.push({ level: 'error', field: 'legacyRedirects[].fromDomain', message: 'required' });
        continue;
      }
      if (!lr.toDomain) {
        errors.push({ level: 'error', field: 'legacyRedirects[].toDomain', message: 'required' });
        continue;
      }
      if (lr.fromDomain === lr.toDomain) {
        errors.push({ level: 'error', field: `legacyRedirects[${lr.fromDomain}]`, message: 'redirect loop: fromDomain equals toDomain' });
      }
      if (redirectSources.has(lr.fromDomain)) {
        errors.push({ level: 'error', field: `legacyRedirects[${lr.fromDomain}]`, message: 'duplicate fromDomain' });
      }
      redirectSources.add(lr.fromDomain);

      const validCodes = [301, 302, 307, 308];
      if (lr.statusCode !== undefined && !validCodes.includes(lr.statusCode)) {
        errors.push({ level: 'error', field: `legacyRedirects[${lr.fromDomain}].statusCode`, message: `must be one of: ${validCodes.join(', ')}` });
      }
    }

    // Detect redirect chains: A -> B -> C
    for (const lr of config.legacyRedirects) {
      if (redirectSources.has(lr.toDomain)) {
        errors.push({ level: 'warn', field: `legacyRedirects[${lr.fromDomain}]`, message: `redirect chain detected: ${lr.fromDomain} -> ${lr.toDomain} -> ... (consider redirecting directly to final destination)` });
      }
    }
  }

  // DNS records
  if (config.dns?.expectedRecords) {
    for (const rec of config.dns.expectedRecords) {
      const validTypes = ['A', 'AAAA', 'CNAME'];
      if (!validTypes.includes(rec.type)) {
        errors.push({ level: 'warn', field: `dns.expectedRecords[${rec.name}]`, message: `unexpected record type: ${rec.type}` });
      }
      if (!rec.name || !rec.value) {
        errors.push({ level: 'warn', field: 'dns.expectedRecords[]', message: 'name and value are both required' });
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): { configPath: string } {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--config');
  const configPath = idx !== -1 && args[idx + 1]
    ? path.resolve(process.cwd(), args[idx + 1])
    : path.resolve(process.cwd(), 'domains.config.json');
  return { configPath };
}

const { configPath } = parseArgs();

if (!fs.existsSync(configPath)) {
  console.error(`[domains-config] ERROR: config file not found: ${configPath}`);
  console.error('  Copy domains.config.example.json to domains.config.json and configure your domains.');
  process.exit(1);
}

let config: DomainsConfig;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[domains-config] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const errors = validateDomainsConfig(config);
let hasErrors = false;

for (const e of errors) {
  const prefix = e.level === 'error' ? 'ERROR' : 'WARN';
  console[e.level === 'error' ? 'error' : 'warn'](`[domains-config] ${prefix}: ${e.field}: ${e.message}`);
  if (e.level === 'error') hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
} else {
  const warnCount = errors.filter(e => e.level === 'warn').length;
  const domainCount = 1
    + (config.aliases?.length ?? 0)
    + (config.docsetDomains?.length ?? 0);
  console.log(`[domains-config] config valid: ${domainCount} domain(s) configured${warnCount > 0 ? ` (${warnCount} warning(s))` : ''}`);
}
