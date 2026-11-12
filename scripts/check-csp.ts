/**
 * Content-Security-Policy check: runs after every build (postbuild).
 *
 * The CSP in vercel.json allows inline scripts only by SHA-256 hash. Docusaurus
 * emits a few inline scripts (the color-mode script on every page, one per
 * client redirect), and a Docusaurus upgrade or a new redirect changes them.
 * A stale hash does not fail anything visibly: the browser just blocks the
 * script and, for example, dark mode flashes or redirects lose their query
 * string. This check fails the build instead.
 *
 * It also checks that nginx.conf (self-hosted deploys) sends the same policy.
 *
 * Usage:
 *   npx tsx scripts/check-csp.ts
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, 'build');

function fail(message: string): never {
  console.error(`[check-csp] ERROR: ${message}`);
  process.exit(1);
}

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const csp: string | undefined = vercel.headers
  ?.flatMap((h: {headers: {key: string; value: string}[]}) => h.headers)
  .find((h: {key: string}) => h.key === 'Content-Security-Policy')?.value;
if (!csp) fail('no Content-Security-Policy header in vercel.json');

const nginx = fs.readFileSync(path.join(ROOT, 'nginx.conf'), 'utf8');
const nginxPolicies = [...nginx.matchAll(/add_header Content-Security-Policy "([^"]*)"/g)].map(m => m[1]);
if (nginxPolicies.length === 0 || nginxPolicies.some(p => p !== csp)) {
  fail('nginx.conf Content-Security-Policy differs from vercel.json; copy the vercel.json value into every add_header line');
}

const scriptSrc = csp.split(';').map(d => d.trim()).find(d => d.startsWith('script-src ')) ?? '';
const allowed = new Set([...scriptSrc.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map(m => m[1]));

function htmlFiles(dir: string): string[] {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(full);
    return e.name.endsWith('.html') ? [full] : [];
  });
}

if (!fs.existsSync(BUILD_DIR)) fail('build/ not found; run npm run build first');

// Inline <script> elements without src, except JSON data blocks the browser never runs.
const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const missing = new Map<string, string>();
const used = new Set<string>();
let pages = 0;

for (const file of htmlFiles(BUILD_DIR)) {
  pages++;
  for (const [, attrs, body] of fs.readFileSync(file, 'utf8').matchAll(INLINE_SCRIPT_RE)) {
    if (/type=["']?application\/(ld\+)?json/.test(attrs)) continue;
    const hash = 'sha256-' + crypto.createHash('sha256').update(body).digest('base64');
    used.add(hash);
    if (!allowed.has(hash) && !missing.has(hash)) missing.set(hash, path.relative(BUILD_DIR, file));
  }
}

if (missing.size > 0) {
  for (const [hash, file] of missing) console.error(`  '${hash}'  (first seen in ${file})`);
  fail(`${missing.size} inline script(s) are not allowed by script-src. Add the hashes above to the CSP in vercel.json and nginx.conf`);
}

const unused = [...allowed].filter(h => !used.has(h));
if (unused.length > 0) {
  console.warn(`[check-csp] WARN: ${unused.length} script-src hash(es) no longer used; remove them: ${unused.join(' ')}`);
}

console.log(`[check-csp] ${pages} pages, ${used.size} inline script hash(es), all allowed by script-src`);
