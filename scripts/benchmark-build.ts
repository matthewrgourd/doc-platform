/**
 * Full Docusaurus build benchmark — scale validation
 *
 * Times a production `npm run build` at the current actual scale (baseline)
 * and optionally at synthetic fixture scales. Complements benchmark-manifest.ts,
 * which only measures the route manifest builder.
 *
 * The benchmark uses BENCHMARK_SCALE env var support in docusaurus.config.ts to
 * inject a synthetic fixture docset without modifying the production config.
 * Fixture files are generated, the build is timed, then all temp files are removed.
 *
 * Usage:
 *   npx tsx scripts/benchmark-build.ts                  (baseline only)
 *   npx tsx scripts/benchmark-build.ts --scale 1000
 *   npx tsx scripts/benchmark-build.ts --scale 5000
 *   npx tsx scripts/benchmark-build.ts --scale 10000
 *   npx tsx scripts/benchmark-build.ts --all            (baseline + 1k, 5k, 10k)
 *   npx tsx scripts/benchmark-build.ts --skip-cleanup   (keep fixtures for inspection)
 *
 * Results are printed as a markdown table suitable for copying into
 * _planning/05-validation/benchmark-results.md.
 *
 * Warning: each scale run triggers a full Docusaurus webpack build. Allow
 * 3–10+ minutes per run depending on machine speed and scale.
 */

import {execSync, execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const PROJECT_ROOT = process.cwd();
const DOCS_ROOT = path.join(PROJECT_ROOT, 'docs');
const FILES_PER_DIR = 20;
const DEFAULT_SCALES = [1000, 5000, 10000];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {scales: number[]; skipCleanup: boolean; baselineOnly: boolean} {
  const args = process.argv.slice(2);
  const skipCleanup = args.includes('--skip-cleanup');
  const all = args.includes('--all');
  const scaleIdx = args.indexOf('--scale');
  const scaleArg = scaleIdx !== -1 ? parseInt(args[scaleIdx + 1], 10) : null;

  if (all) {
    return {scales: DEFAULT_SCALES, skipCleanup, baselineOnly: false};
  }
  if (scaleArg) {
    return {scales: [scaleArg], skipCleanup, baselineOnly: false};
  }
  return {scales: [], skipCleanup, baselineOnly: true};
}

// ---------------------------------------------------------------------------
// Fixture management
// ---------------------------------------------------------------------------

function generateFixture(scale: number): void {
  const docsetDir = path.join(DOCS_ROOT, `_fixture-${scale}`);
  if (fs.existsSync(docsetDir)) {
    fs.rmSync(docsetDir, {recursive: true, force: true});
  }

  const sectionCount = Math.ceil(scale / FILES_PER_DIR);
  let filesWritten = 0;

  for (let s = 0; s < sectionCount && filesWritten < scale; s++) {
    const sectionDir = path.join(docsetDir, `section-${s + 1}`);
    fs.mkdirSync(sectionDir, {recursive: true});

    for (let p = 0; p < FILES_PER_DIR && filesWritten < scale; p++) {
      const isIndex = p === 0 && s === 0;
      const filename = isIndex ? 'index.md' : `page-${p + 1}.md`;
      const title = isIndex ? `Benchmark fixture (${scale} files)` : `Section ${s + 1} — Page ${p + 1}`;
      fs.writeFileSync(
        path.join(sectionDir, filename),
        `---\ntitle: "${title}"\n---\n\n# ${title}\n\nSynthetic fixture content for scale benchmarking.\n`,
      );
      filesWritten++;
    }
  }

  console.log(`[benchmark-build] generated ${filesWritten} fixture files`);
}

function cleanupFixture(scale: number): void {
  const docsetDir = path.join(DOCS_ROOT, `_fixture-${scale}`);
  if (fs.existsSync(docsetDir)) {
    fs.rmSync(docsetDir, {recursive: true, force: true});
    console.log(`[benchmark-build] removed fixture docset`);
  }
}

// ---------------------------------------------------------------------------
// Build runner
// ---------------------------------------------------------------------------

type BuildResult = {
  scale: number | 'baseline';
  durationMs: number;
  exitCode: number;
  outputSizeKb: number;
  nodeVersionMajor: number;
  platform: string;
};

function countOutputFiles(): number {
  const buildDir = path.join(PROJECT_ROOT, 'build');
  if (!fs.existsSync(buildDir)) return 0;

  let count = 0;
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
  }
  walk(buildDir);
  return count;
}

function outputSizeKb(): number {
  const buildDir = path.join(PROJECT_ROOT, 'build');
  if (!fs.existsSync(buildDir)) return 0;
  try {
    const result = execFileSync('du', ['-sk', buildDir], {encoding: 'utf8'});
    return parseInt(result.split('\t')[0], 10);
  } catch {
    return 0;
  }
}

function runBuild(scale: number | null): BuildResult {
  const env: NodeJS.ProcessEnv = {...process.env};
  if (scale !== null) {
    env.BENCHMARK_SCALE = String(scale);
  }

  const cmd = 'npm';
  const args = ['run', 'build'];
  const label = scale !== null ? `~${scale.toLocaleString()} files` : 'baseline';

  console.log(`[benchmark-build] starting build (${label})...`);
  const start = performance.now();
  let exitCode = 0;

  try {
    execFileSync(cmd, args, {env, stdio: 'inherit', cwd: PROJECT_ROOT});
  } catch (err: unknown) {
    exitCode = (err as {status?: number}).status ?? 1;
    console.error(`[benchmark-build] build failed with exit code ${exitCode}`);
  }

  const durationMs = Math.round(performance.now() - start);
  const sizeKb = outputSizeKb();
  const nodeVersionMajor = parseInt(process.version.replace('v', '').split('.')[0], 10);

  return {
    scale: scale ?? 'baseline',
    durationMs,
    exitCode,
    outputSizeKb: sizeKb,
    nodeVersionMajor,
    platform: `${os.type()} ${os.arch()}`,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {scales, skipCleanup, baselineOnly} = parseArgs();
const results: BuildResult[] = [];

// Always run baseline first
console.log('\n[benchmark-build] === baseline (current docs) ===');
results.push(runBuild(null));

// Scale runs
for (const scale of scales) {
  console.log(`\n[benchmark-build] === scale: ~${scale.toLocaleString()} files ===`);
  generateFixture(scale);

  results.push(runBuild(scale));

  if (!skipCleanup) {
    cleanupFixture(scale);
  }
}

// ---------------------------------------------------------------------------
// Results table
// ---------------------------------------------------------------------------

const nodeVersion = `Node ${results[0]?.nodeVersionMajor}.x`;
const platform = results[0]?.platform ?? os.type();
const date = new Date().toISOString().split('T')[0];

console.log('\n\n## Full build benchmark results');
console.log(`\nDate: ${date}`);
console.log(`Environment: ${platform}, ${nodeVersion}`);
console.log(`Tool: scripts/benchmark-build.ts`);
console.log();
console.log('| Scale | Build duration | Output size | Exit code |');
console.log('|-------|---------------|-------------|-----------|');
for (const r of results) {
  const label = r.scale === 'baseline' ? 'Baseline (actual docs)' : `Baseline + ~${Number(r.scale).toLocaleString()} fixture files`;
  const duration = r.durationMs >= 60_000
    ? `${(r.durationMs / 60_000).toFixed(1)} min`
    : `${(r.durationMs / 1000).toFixed(1)} s`;
  const size = r.outputSizeKb > 0 ? `${(r.outputSizeKb / 1024).toFixed(0)} MB` : 'n/a';
  const status = r.exitCode === 0 ? 'pass' : `fail (${r.exitCode})`;
  console.log(`| ${label} | ${duration} | ${size} | ${status} |`);
}
console.log();
console.log('Copy this table into `_planning/05-validation/benchmark-results.md`.');
