/**
 * Legacy domain redirect generator: Epic 13, Story 13.3
 *
 * Reads domains.config.json and generates a Vercel redirects configuration
 * fragment from legacyRedirects and alias entries. Output can be merged into
 * vercel.json or used as input for other hosting providers.
 *
 * Usage:
 *   npx tsx scripts/generate-domain-redirects.ts [--config <path>] [--output <path>]
 *   npx tsx scripts/generate-domain-redirects.ts --config domains.config.json --output vercel.redirects.json
 *
 * If --output is omitted, the result is printed to stdout.
 */

import fs from 'fs';
import path from 'path';
import type { DomainsConfig } from './validate-domains-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VercelRedirect = {
  source: string;
  destination: string;
  statusCode: number;
  has?: Array<{ type: string; key?: string; value: string }>;
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateRedirects(config: DomainsConfig): VercelRedirect[] {
  const redirects: VercelRedirect[] = [];

  // Alias redirects (e.g. apex -> www)
  if (config.aliases) {
    for (const alias of config.aliases) {
      if (!alias.redirectToPrimary) continue;
      redirects.push({
        source: '/:path(.*)',
        destination: `https://${config.primaryDomain}/:path`,
        statusCode: 308,
        has: [{ type: 'host', value: alias.domain }],
      });
    }
  }

  // Legacy domain redirects
  if (config.legacyRedirects) {
    for (const lr of config.legacyRedirects) {
      const statusCode = lr.statusCode ?? 308;
      if (lr.preservePath !== false) {
        redirects.push({
          source: '/:path(.*)',
          destination: `https://${lr.toDomain}/:path`,
          statusCode,
          has: [{ type: 'host', value: lr.fromDomain }],
        });
      } else {
        redirects.push({
          source: '/:path(.*)',
          destination: `https://${lr.toDomain}/`,
          statusCode,
          has: [{ type: 'host', value: lr.fromDomain }],
        });
      }
    }
  }

  return redirects;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): { configPath: string; outputPath: string | null } {
  const args = process.argv.slice(2);
  const configIdx = args.indexOf('--config');
  const configPath = configIdx !== -1 && args[configIdx + 1]
    ? path.resolve(process.cwd(), args[configIdx + 1])
    : path.resolve(process.cwd(), 'domains.config.json');

  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 && args[outputIdx + 1]
    ? path.resolve(process.cwd(), args[outputIdx + 1])
    : null;

  return { configPath, outputPath };
}

const { configPath, outputPath } = parseArgs();

if (!fs.existsSync(configPath)) {
  console.error(`[domain-redirects] ERROR: config file not found: ${configPath}`);
  console.error('  Copy domains.config.example.json to domains.config.json and configure your domains.');
  process.exit(1);
}

let config: DomainsConfig;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[domain-redirects] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const redirects = generateRedirects(config);

if (redirects.length === 0) {
  console.log('[domain-redirects] No redirects to generate.');
  process.exit(0);
}

const output = JSON.stringify({ redirects }, null, 2);

if (outputPath) {
  fs.writeFileSync(outputPath, output + '\n', 'utf8');
  console.log(`[domain-redirects] ${redirects.length} redirect(s) written to ${outputPath}`);
} else {
  console.log(output);
}
