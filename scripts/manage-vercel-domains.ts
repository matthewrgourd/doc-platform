/**
 * Vercel domain provisioning script: Epic 13, Story 13.2
 *
 * Manages custom domains on a Vercel project via the Vercel REST API.
 * Supports adding, listing, removing, and checking verification status.
 *
 * Required environment variables:
 *   VERCEL_TOKEN       - Vercel API token (Settings > Tokens)
 *   VERCEL_PROJECT_ID  - Vercel project ID (from .vercel/project.json or project settings)
 *   VERCEL_TEAM_ID     - (optional) Vercel team/org ID for team-scoped projects
 *
 * Usage:
 *   npx tsx scripts/manage-vercel-domains.ts list
 *   npx tsx scripts/manage-vercel-domains.ts add docs.example.com
 *   npx tsx scripts/manage-vercel-domains.ts add docs.example.com --dry-run
 *   npx tsx scripts/manage-vercel-domains.ts remove docs.example.com
 *   npx tsx scripts/manage-vercel-domains.ts verify docs.example.com
 *   npx tsx scripts/manage-vercel-domains.ts sync --config domains.config.json
 */

import fs from 'fs';
import path from 'path';
import type { DomainsConfig } from './validate-domains-config';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`[vercel-domains] ERROR: environment variable ${name} is required`);
    process.exit(1);
  }
  return val;
}

const VERCEL_TOKEN = requireEnv('VERCEL_TOKEN');
const VERCEL_PROJECT_ID = requireEnv('VERCEL_PROJECT_ID');
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

const BASE_URL = 'https://api.vercel.com';

function teamQuery(): string {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

type VercelDomain = {
  name: string;
  verified: boolean;
  verification?: Array<{ type: string; domain: string; value: string }>;
  redirect?: string | null;
  redirectStatusCode?: number | null;
};

async function apiRequest(
  method: string,
  urlPath: string,
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const url = `${BASE_URL}${urlPath}${urlPath.includes('?') ? '&' : '?'}${VERCEL_TEAM_ID ? `teamId=${VERCEL_TEAM_ID}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function listDomains(): Promise<void> {
  const res = await apiRequest('GET', `/v9/projects/${VERCEL_PROJECT_ID}/domains`);
  if (!res.ok) {
    console.error(`[vercel-domains] ERROR: failed to list domains (${res.status}):`, JSON.stringify(res.data, null, 2));
    process.exit(1);
  }
  const domains = (res.data.domains ?? []) as VercelDomain[];
  if (domains.length === 0) {
    console.log('[vercel-domains] No domains configured.');
    return;
  }
  console.log(`[vercel-domains] ${domains.length} domain(s):\n`);
  for (const d of domains) {
    const status = d.verified ? 'verified' : 'UNVERIFIED';
    const redirect = d.redirect ? ` -> ${d.redirect} (${d.redirectStatusCode ?? 308})` : '';
    console.log(`  ${d.name}  [${status}]${redirect}`);
    if (!d.verified && d.verification) {
      for (const v of d.verification) {
        console.log(`    DNS: ${v.type} record for ${v.domain} = ${v.value}`);
      }
    }
  }
}

async function addDomain(domain: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`[vercel-domains] DRY RUN: would add domain "${domain}" to project ${VERCEL_PROJECT_ID}`);
    return;
  }
  const res = await apiRequest('POST', `/v10/projects/${VERCEL_PROJECT_ID}/domains`, { name: domain });
  if (!res.ok) {
    if (res.status === 409) {
      console.log(`[vercel-domains] Domain "${domain}" is already added to this project.`);
      return;
    }
    console.error(`[vercel-domains] ERROR: failed to add domain (${res.status}):`, JSON.stringify(res.data, null, 2));
    process.exit(1);
  }
  console.log(`[vercel-domains] Domain "${domain}" added successfully.`);
  const d = res.data as unknown as VercelDomain;
  if (!d.verified && d.verification) {
    console.log('[vercel-domains] Domain is not yet verified. Add these DNS records:');
    for (const v of d.verification) {
      console.log(`  ${v.type} record: ${v.domain} = ${v.value}`);
    }
  }
}

async function removeDomain(domain: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`[vercel-domains] DRY RUN: would remove domain "${domain}" from project ${VERCEL_PROJECT_ID}`);
    return;
  }
  const res = await apiRequest('DELETE', `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`);
  if (!res.ok) {
    console.error(`[vercel-domains] ERROR: failed to remove domain (${res.status}):`, JSON.stringify(res.data, null, 2));
    process.exit(1);
  }
  console.log(`[vercel-domains] Domain "${domain}" removed.`);
}

async function verifyDomain(domain: string): Promise<void> {
  const res = await apiRequest('POST', `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`);
  if (!res.ok) {
    console.error(`[vercel-domains] ERROR: verification failed (${res.status}):`, JSON.stringify(res.data, null, 2));
    process.exit(1);
  }
  const d = res.data as unknown as VercelDomain;
  if (d.verified) {
    console.log(`[vercel-domains] Domain "${domain}" is verified.`);
  } else {
    console.log(`[vercel-domains] Domain "${domain}" is NOT yet verified.`);
    if (d.verification) {
      console.log('[vercel-domains] Required DNS records:');
      for (const v of d.verification) {
        console.log(`  ${v.type} record: ${v.domain} = ${v.value}`);
      }
    }
  }
}

async function syncFromConfig(configPath: string, dryRun: boolean): Promise<void> {
  if (!fs.existsSync(configPath)) {
    console.error(`[vercel-domains] ERROR: config not found: ${configPath}`);
    process.exit(1);
  }
  const config: DomainsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const desired = new Set<string>();

  desired.add(config.primaryDomain);
  for (const alias of config.aliases ?? []) {
    desired.add(alias.domain);
  }
  for (const dd of config.docsetDomains ?? []) {
    desired.add(dd.domain);
  }

  console.log(`[vercel-domains] Syncing ${desired.size} domain(s) from config...`);
  for (const domain of desired) {
    await addDomain(domain, dryRun);
  }
  console.log(`[vercel-domains] Sync complete.`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = args.includes('--dry-run');

  switch (command) {
    case 'list':
      await listDomains();
      break;
    case 'add': {
      const domain = args[1];
      if (!domain || domain.startsWith('--')) {
        console.error('[vercel-domains] Usage: manage-vercel-domains.ts add <domain> [--dry-run]');
        process.exit(1);
      }
      await addDomain(domain, dryRun);
      break;
    }
    case 'remove': {
      const domain = args[1];
      if (!domain || domain.startsWith('--')) {
        console.error('[vercel-domains] Usage: manage-vercel-domains.ts remove <domain>');
        process.exit(1);
      }
      await removeDomain(domain, dryRun);
      break;
    }
    case 'verify': {
      const domain = args[1];
      if (!domain || domain.startsWith('--')) {
        console.error('[vercel-domains] Usage: manage-vercel-domains.ts verify <domain>');
        process.exit(1);
      }
      await verifyDomain(domain);
      break;
    }
    case 'sync': {
      const configIdx = args.indexOf('--config');
      const configPath = configIdx !== -1 && args[configIdx + 1]
        ? path.resolve(process.cwd(), args[configIdx + 1])
        : path.resolve(process.cwd(), 'domains.config.json');
      await syncFromConfig(configPath, dryRun);
      break;
    }
    default:
      console.error(`[vercel-domains] Usage: manage-vercel-domains.ts <list|add|remove|verify|sync> [args]`);
      process.exit(1);
  }
}

main();
