/**
 * Synthetic fixture generator — Epic 1, Story 1.3
 *
 * Generates a synthetic docset under docs/_fixture-<scale>/ with a
 * configurable number of files. Used to benchmark the route manifest
 * builder at projected scale.
 *
 * Usage:
 *   npx tsx scripts/generate-fixture.ts [count]
 *   npx tsx scripts/generate-fixture.ts 1000
 *   npx tsx scripts/generate-fixture.ts 5000
 *   npx tsx scripts/generate-fixture.ts 10000
 *
 * Generates: docs/_fixture-<count>/<section-N>/<page-M>.md
 * Cleans up automatically if --cleanup flag is passed.
 */

import fs from 'fs';
import path from 'path';

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const FILES_PER_DIR = 20;

function parseArgs(): {count: number; cleanup: boolean} {
  const args = process.argv.slice(2);
  const cleanup = args.includes('--cleanup');
  const countArg = args.find(a => /^\d+$/.test(a));
  const count = countArg ? parseInt(countArg, 10) : 1000;
  return {count, cleanup};
}

function fixtureDocsetName(count: number): string {
  return `_fixture-${count}`;
}

function generateFixture(count: number): string {
  const docsetId = fixtureDocsetName(count);
  const docsetDir = path.join(DOCS_ROOT, docsetId);

  if (fs.existsSync(docsetDir)) {
    fs.rmSync(docsetDir, {recursive: true, force: true});
  }

  const sectionCount = Math.ceil(count / FILES_PER_DIR);
  let filesWritten = 0;

  for (let s = 0; s < sectionCount && filesWritten < count; s++) {
    const sectionDir = path.join(docsetDir, `section-${s + 1}`);
    fs.mkdirSync(sectionDir, {recursive: true});

    for (let p = 0; p < FILES_PER_DIR && filesWritten < count; p++) {
      const isIndex = p === 0 && s === 0;
      const filename = isIndex ? 'index.md' : `page-${p + 1}.md`;
      const filePath = path.join(sectionDir, filename);
      const title = isIndex ? docsetId : `Section ${s + 1} — Page ${p + 1}`;

      fs.writeFileSync(
        filePath,
        `---\ntitle: "${title}"\n---\n\n# ${title}\n\nSynthetic fixture content for scale benchmarking.\n`,
      );
      filesWritten++;
    }
  }

  console.log(
    `[generate-fixture] wrote ${filesWritten} files across ${sectionCount} sections → ${docsetDir}`,
  );
  return docsetId;
}

function cleanupFixture(count: number): void {
  const docsetDir = path.join(DOCS_ROOT, fixtureDocsetName(count));
  if (fs.existsSync(docsetDir)) {
    fs.rmSync(docsetDir, {recursive: true, force: true});
    console.log(`[generate-fixture] removed ${docsetDir}`);
  }
}

const {count, cleanup} = parseArgs();

if (cleanup) {
  cleanupFixture(count);
} else {
  generateFixture(count);
}
