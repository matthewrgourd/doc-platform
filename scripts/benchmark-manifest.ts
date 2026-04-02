/**
 * Manifest builder benchmark — Epic 1, Story 1.3
 *
 * Generates synthetic fixtures at 1k, 5k, 10k file counts, runs the
 * manifest builder against each, records timing, then cleans up.
 *
 * Results are printed to stdout in a format suitable for copying into
 * _planning/05-validation/benchmark-results.md.
 *
 * Usage:
 *   npx tsx scripts/benchmark-manifest.ts
 */

import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const SCALES = [1000, 5000, 10000];

type BenchmarkResult = {
  scale: number;
  fileCount: number;
  durationMs: number;
  routeCount: number;
};

function generateFixture(count: number): string {
  const docsetId = `_fixture-${count}`;
  const docsetDir = path.join(DOCS_ROOT, docsetId);

  if (fs.existsSync(docsetDir)) {
    fs.rmSync(docsetDir, {recursive: true, force: true});
  }

  const filesPerDir = 20;
  const sectionCount = Math.ceil(count / filesPerDir);
  let filesWritten = 0;

  for (let s = 0; s < sectionCount && filesWritten < count; s++) {
    const sectionDir = path.join(docsetDir, `section-${s + 1}`);
    fs.mkdirSync(sectionDir, {recursive: true});

    for (let p = 0; p < filesPerDir && filesWritten < count; p++) {
      const isIndex = p === 0 && s === 0;
      const filename = isIndex ? 'index.md' : `page-${p + 1}.md`;
      fs.writeFileSync(
        path.join(sectionDir, filename),
        `---\ntitle: "Page ${filesWritten}"\n---\n\n# Page ${filesWritten}\n\nSynthetic content.\n`,
      );
      filesWritten++;
    }
  }

  return docsetId;
}

function cleanupFixture(count: number): void {
  const docsetDir = path.join(DOCS_ROOT, `_fixture-${count}`);
  if (fs.existsSync(docsetDir)) {
    fs.rmSync(docsetDir, {recursive: true, force: true});
  }
}

function runManifestBuilder(): {durationMs: number; routeCount: number} {
  // Build a temporary output path so we don't clobber the real manifest
  const tmpOutput = path.join(process.cwd(), 'build', '_benchmark-manifest.json');
  const env = {...process.env, BENCHMARK_OUTPUT: tmpOutput};

  const start = performance.now();
  execSync('npx tsx scripts/build-route-manifest.ts', {
    env,
    stdio: 'pipe', // suppress output during benchmark
  });
  const durationMs = Math.round(performance.now() - start);

  // Read route count from actual output (manifest builder writes to build/route-manifest.json)
  const manifestPath = path.join(process.cwd(), 'build', 'route-manifest.json');
  let routeCount = 0;
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    routeCount = manifest.allRoutes?.length ?? 0;
  }

  return {durationMs, routeCount};
}

// Baseline: current scale (no fixtures)
console.log('[benchmark] running baseline (current docs only)...');
const baselineStart = performance.now();
execSync('npx tsx scripts/build-route-manifest.ts', {stdio: 'pipe'});
const baselineDurationMs = Math.round(performance.now() - baselineStart);
const baselineManifest = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'build', 'route-manifest.json'), 'utf8'),
);
const baselineRouteCount: number = baselineManifest.allRoutes?.length ?? 0;

const results: BenchmarkResult[] = [
  {scale: 0, fileCount: baselineRouteCount, durationMs: baselineDurationMs, routeCount: baselineRouteCount},
];

// Scale benchmarks
for (const scale of SCALES) {
  console.log(`[benchmark] generating ${scale}-file fixture...`);
  generateFixture(scale);

  console.log(`[benchmark] running manifest builder at ~${scale} files...`);
  const {durationMs, routeCount} = runManifestBuilder();
  results.push({scale, fileCount: scale, durationMs, routeCount});

  console.log(`[benchmark] cleaning up fixture...`);
  cleanupFixture(scale);
}

// Print results table
console.log('\n## Manifest builder benchmark results\n');
console.log('| Scale | Total routes | Duration (ms) |');
console.log('|-------|-------------|----------------|');
for (const r of results) {
  const label = r.scale === 0 ? 'Baseline (actual)' : `~${r.scale.toLocaleString()} files`;
  console.log(`| ${label} | ${r.routeCount} | ${r.durationMs} |`);
}
console.log();
