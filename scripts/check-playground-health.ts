/**
 * API playground health check — Epic 2, Story 2.3
 *
 * Probes curated API endpoints and reports pass/fail per endpoint.
 * Designed to run in CI to catch broken Try-it flows before release.
 *
 * Endpoint config is loaded from `openapi/health-checks.json`.
 * Each probe sends a real HTTP request and validates the response:
 *  - Status code is in the expected range (default: 2xx)
 *  - Response time is under the timeout (default: 10 s)
 *  - Optional: response body contains expected keys
 *
 * Usage:
 *   npx tsx scripts/check-playground-health.ts
 *   npx tsx scripts/check-playground-health.ts --fail-fast
 *   npx tsx scripts/check-playground-health.ts --timeout 15000
 *
 * Exit codes:
 *   0 — all probes passed
 *   1 — one or more probes failed
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import {URL} from 'url';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProbeConfig = {
  /** Human-readable label for this probe. */
  label: string;
  /** HTTP method. Default: GET. */
  method?: string;
  /** Full URL to probe, including any required query parameters. */
  url: string;
  /** Expected HTTP status codes (any match = pass). Default: [200, 201, 204]. */
  expectedStatus?: number[];
  /** Request timeout in milliseconds. Default: 10000. */
  timeoutMs?: number;
  /** Optional: keys that must be present in a JSON response body. */
  expectBodyKeys?: string[];
  /**
   * If true, failures are reported as warnings but do not affect exit code.
   * Use for third-party demo servers that are known to be unreliable.
   */
  allowedToFail?: boolean;
};

type HealthCheckConfig = {
  description?: string;
  probes: ProbeConfig[];
};

type ProbeResult = {
  label: string;
  url: string;
  status: 'pass' | 'fail' | 'error';
  httpStatus?: number;
  durationMs: number;
  message?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONFIG_PATH = path.resolve(process.cwd(), 'openapi', 'health-checks.json');
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_EXPECTED_STATUS = [200, 201, 204];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {failFast: boolean; timeoutOverride: number | null} {
  const args = process.argv.slice(2);
  const failFast = args.includes('--fail-fast');
  const timeoutIdx = args.indexOf('--timeout');
  const timeoutOverride =
    timeoutIdx !== -1 && args[timeoutIdx + 1] ? parseInt(args[timeoutIdx + 1], 10) : null;
  return {failFast, timeoutOverride};
}

// ---------------------------------------------------------------------------
// HTTP probe
// ---------------------------------------------------------------------------

function probe(config: ProbeConfig, timeoutOverride: number | null): Promise<ProbeResult> {
  return new Promise(resolve => {
    const start = Date.now();
    const timeoutMs = timeoutOverride ?? config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const expectedStatus = config.expectedStatus ?? DEFAULT_EXPECTED_STATUS;
    const method = (config.method ?? 'GET').toUpperCase();

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(config.url);
    } catch {
      resolve({
        label: config.label,
        url: config.url,
        status: 'error',
        durationMs: 0,
        message: `invalid URL: ${config.url}`,
      });
      return;
    }

    const transport = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {'User-Agent': 'devdocify-health-check/1.0', Accept: 'application/json'},
    };

    const req = transport.request(options, res => {
      const durationMs = Date.now() - start;
      const chunks: Buffer[] = [];

      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const httpStatus = res.statusCode ?? 0;

        if (!expectedStatus.includes(httpStatus)) {
          resolve({
            label: config.label,
            url: config.url,
            status: 'fail',
            httpStatus,
            durationMs,
            message: `expected status [${expectedStatus.join(', ')}], got ${httpStatus}`,
          });
          return;
        }

        // Validate body keys if configured
        if (config.expectBodyKeys && config.expectBodyKeys.length > 0) {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const missingKeys = config.expectBodyKeys.filter(k => !(k in body));
            if (missingKeys.length > 0) {
              resolve({
                label: config.label,
                url: config.url,
                status: 'fail',
                httpStatus,
                durationMs,
                message: `missing expected body keys: ${missingKeys.join(', ')}`,
              });
              return;
            }
          } catch {
            resolve({
              label: config.label,
              url: config.url,
              status: 'fail',
              httpStatus,
              durationMs,
              message: 'response body is not valid JSON',
            });
            return;
          }
        }

        resolve({label: config.label, url: config.url, status: 'pass', httpStatus, durationMs});
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({
        label: config.label,
        url: config.url,
        status: 'fail',
        durationMs: Date.now() - start,
        message: `timeout after ${timeoutMs}ms`,
      });
    });

    req.on('error', err => {
      resolve({
        label: config.label,
        url: config.url,
        status: 'error',
        durationMs: Date.now() - start,
        message: err.message,
      });
    });

    req.end();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`[playground-health] ERROR: config not found: ${CONFIG_PATH}`);
  console.error('  Create openapi/health-checks.json with a "probes" array to configure endpoints.');
  process.exit(1);
}

let config: HealthCheckConfig;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
  console.error(`[playground-health] ERROR: failed to parse health-checks.json: ${(err as Error).message}`);
  process.exit(1);
}

if (!config.probes || config.probes.length === 0) {
  console.error('[playground-health] ERROR: no probes configured in health-checks.json');
  process.exit(1);
}

async function main(): Promise<void> {
  const {failFast, timeoutOverride} = parseArgs();

  console.log(`[playground-health] running ${config.probes.length} probe(s)...`);
  if (config.description) console.log(`[playground-health] ${config.description}`);
  console.log();

  const results: ProbeResult[] = [];
  let exitCode = 0;

  for (const probeConfig of config.probes) {
    process.stdout.write(`  ${probeConfig.label} ... `);
    const result = await probe(probeConfig, timeoutOverride);
    results.push(result);

    if (result.status === 'pass') {
      console.log(`PASS  (HTTP ${result.httpStatus}, ${result.durationMs}ms)`);
    } else if (probeConfig.allowedToFail) {
      console.log(`WARN  ${result.message ? `— ${result.message}` : ''}  (${result.durationMs}ms) [allowed to fail]`);
    } else {
      console.log(`FAIL  ${result.message ? `— ${result.message}` : ''}  (${result.durationMs}ms)`);
      exitCode = 1;
      if (failFast) break;
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const warned = results.filter((r, i) => r.status !== 'pass' && config.probes[i].allowedToFail).length;
  const failed = results.filter((r, i) => r.status !== 'pass' && !config.probes[i].allowedToFail).length;
  const parts = [`${passed}/${results.length} passed`];
  if (warned > 0) parts.push(`${warned} warned (allowed)`);
  if (failed > 0) parts.push(`${failed} failed`);
  console.log();
  console.log(`[playground-health] ${parts.join(', ')}`);

  process.exit(exitCode);
}

main();
