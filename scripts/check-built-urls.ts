/**
 * Built URL check: runs after every build (postbuild), after the manifest,
 * search index and llms.txt are generated.
 *
 * Those three files compute page URLs from file paths (docRoutePath in
 * docset.config.ts), not from what Docusaurus actually served. When the two
 * disagree (a front-matter `slug:`, a number prefix, a routeBasePath change),
 * search results and Ask AI answers link to 404s while every other check
 * passes. This check fails the build instead.
 *
 * Usage:
 *   npx tsx scripts/check-built-urls.ts
 */

import fs from 'fs';
import path from 'path';

const BUILD_DIR = path.resolve(process.cwd(), 'build');
const SITE_URL = 'https://www.devdocify.com';

function fail(message: string): never {
  console.error(`[check-built-urls] ERROR: ${message}`);
  process.exit(1);
}

function readBuildFile(name: string): string {
  const file = path.join(BUILD_DIR, name);
  if (!fs.existsSync(file)) fail(`build/${name} not found; run npm run build first`);
  return fs.readFileSync(file, 'utf8');
}

function hasBuiltPage(urlPath: string): boolean {
  const clean = urlPath.split(/[?#]/)[0].replace(/\/$/, '');
  return [path.join(clean, 'index.html'), `${clean}.html`, clean]
    .map(p => path.join(BUILD_DIR, p))
    .some(f => f.startsWith(BUILD_DIR) && fs.existsSync(f) && fs.statSync(f).isFile());
}

const sources: Record<string, string[]> = {
  'route-manifest.json': JSON.parse(readBuildFile('route-manifest.json')).docsets
    .flatMap((d: {routes: {slug: string}[]}) => d.routes.map(r => r.slug)),
  'search-index.json': JSON.parse(readBuildFile('search-index.json')).entries
    .map((e: {slug: string}) => e.slug),
  'llms.txt': [...readBuildFile('llms.txt').matchAll(/https:\/\/www\.devdocify\.com(\/[^\s)]*)/g)]
    .map(m => m[1]),
};

let checked = 0;
const missing: string[] = [];
for (const [source, urls] of Object.entries(sources)) {
  for (const url of new Set(urls)) {
    checked++;
    if (!hasBuiltPage(url)) missing.push(`  ${SITE_URL}${url}  (from ${source})`);
  }
}

if (missing.length > 0) {
  console.error(missing.join('\n'));
  fail(`${missing.length} generated URL(s) have no built page. Check the page's front-matter slug or file name against docRoutePath in scripts/docset.config.ts`);
}

console.log(`[check-built-urls] ${checked} URLs from the manifest, search index and llms.txt all have built pages`);
