/**
 * Include resolution engine — Epic 3, Story 3.1
 *
 * Resolves <!-- include: snippets/<name>.md --> directives in Markdown/MDX
 * files. Snippets must live in docs/_snippets/ (the approved registry).
 *
 * Include syntax (HTML comment — invisible to Docusaurus renderer):
 *   <!-- include: snippets/api-key-warning.md -->
 *
 * Behaviour:
 *  - Replaces the include directive with the snippet content inline
 *  - Detects circular includes and emits a fatal error with the chain
 *  - Missing snippets produce a fatal error with the source location
 *  - Output written to build/processed/<relative-path> (source files unchanged)
 *  - Only processes .md and .mdx files; others copied unchanged
 *
 * Usage:
 *   npx tsx scripts/resolve-includes.ts [--docs <dir>] [--out <dir>]
 *   npx tsx scripts/resolve-includes.ts
 *   npx tsx scripts/resolve-includes.ts --dry-run   (validate only, no output)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IncludeError = {
  level: 'error' | 'warn';
  file: string;
  line: number;
  message: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const SNIPPETS_DIR = path.join(DOCS_ROOT, '_snippets');
const OUTPUT_ROOT = path.resolve(process.cwd(), 'build', 'processed');
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);

/** Matches <!-- include: path/to/snippet.md --> with optional whitespace */
const INCLUDE_RE = /<!--\s*include:\s*([^\s>]+)\s*-->/g;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {dryRun: boolean; docsRoot: string; outputRoot: string} {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const docsIdx = args.indexOf('--docs');
  const docsRoot = docsIdx !== -1 && args[docsIdx + 1]
    ? path.resolve(process.cwd(), args[docsIdx + 1])
    : DOCS_ROOT;

  const outIdx = args.indexOf('--out');
  const outputRoot = outIdx !== -1 && args[outIdx + 1]
    ? path.resolve(process.cwd(), args[outIdx + 1])
    : OUTPUT_ROOT;

  return {dryRun, docsRoot, outputRoot};
}

// ---------------------------------------------------------------------------
// Snippet registry
// ---------------------------------------------------------------------------

function loadSnippetRegistry(snippetsDir: string): Map<string, string> {
  const registry = new Map<string, string>();

  if (!fs.existsSync(snippetsDir)) return registry;

  function walk(dir: string, prefix: string): void {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const fullPath = path.join(dir, entry.name);
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else if (CONTENT_EXTENSIONS.has(path.extname(entry.name))) {
        registry.set(`snippets/${relPath}`, fs.readFileSync(fullPath, 'utf8'));
      }
    }
  }

  walk(snippetsDir, '');
  return registry;
}

// ---------------------------------------------------------------------------
// Include resolution
// ---------------------------------------------------------------------------

function resolveIncludes(
  content: string,
  sourceFile: string,
  registry: Map<string, string>,
  errors: IncludeError[],
  stack: string[] = [],
): string {
  // Detect circular includes
  if (stack.includes(sourceFile)) {
    const chain = [...stack, sourceFile].join(' → ');
    errors.push({
      level: 'error',
      file: sourceFile,
      line: 0,
      message: `circular include detected: ${chain}`,
    });
    return content;
  }

  const lines = content.split('\n');
  const resolved: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    INCLUDE_RE.lastIndex = 0;
    const match = INCLUDE_RE.exec(line);

    if (!match) {
      resolved.push(line);
      continue;
    }

    const includePath = match[1].trim();

    if (!registry.has(includePath)) {
      errors.push({
        level: 'error',
        file: sourceFile,
        line: i + 1,
        message: `snippet not found in registry: "${includePath}" — add it to docs/_snippets/`,
      });
      resolved.push(line); // keep original line so output is readable
      continue;
    }

    const snippetContent = registry.get(includePath)!;

    // Recursively resolve includes within the snippet
    const resolvedSnippet = resolveIncludes(
      snippetContent,
      includePath,
      registry,
      errors,
      [...stack, sourceFile],
    );

    // Replace the include directive with resolved content
    // If there's content before/after the directive on the same line, preserve it
    const before = line.slice(0, match.index);
    const after = line.slice(match.index + match[0].length);
    const injected = (before + resolvedSnippet.trimEnd() + after).trimEnd();
    resolved.push(injected);
  }

  return resolved.join('\n');
}

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

function processDirectory(
  dir: string,
  docsRoot: string,
  outputRoot: string,
  registry: Map<string, string>,
  errors: IncludeError[],
  dryRun: boolean,
): number {
  let processed = 0;

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    // Skip _snippets — they're the registry, not content to process
    if (entry.name === '_snippets') continue;

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(docsRoot, fullPath);
    const outPath = path.join(outputRoot, relPath);

    if (entry.isDirectory()) {
      if (!dryRun && !fs.existsSync(outPath)) {
        fs.mkdirSync(outPath, {recursive: true});
      }
      processed += processDirectory(fullPath, docsRoot, outputRoot, registry, errors, dryRun);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const content = fs.readFileSync(fullPath, 'utf8');

      if (CONTENT_EXTENSIONS.has(ext)) {
        const resolved = resolveIncludes(content, relPath, registry, errors);
        if (!dryRun) {
          if (!fs.existsSync(path.dirname(outPath))) {
            fs.mkdirSync(path.dirname(outPath), {recursive: true});
          }
          fs.writeFileSync(outPath, resolved);
        }
        processed++;
      } else if (!dryRun) {
        if (!fs.existsSync(path.dirname(outPath))) {
          fs.mkdirSync(path.dirname(outPath), {recursive: true});
        }
        fs.copyFileSync(fullPath, outPath);
      }
    }
  }

  return processed;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {dryRun, docsRoot, outputRoot} = parseArgs();

if (!fs.existsSync(docsRoot)) {
  console.error(`[resolve-includes] ERROR: docs root not found: ${docsRoot}`);
  process.exit(1);
}

const registry = loadSnippetRegistry(SNIPPETS_DIR);
console.log(`[resolve-includes] loaded ${registry.size} snippet(s) from registry`);
for (const key of registry.keys()) {
  console.log(`  ${key}`);
}

const errors: IncludeError[] = [];

if (!dryRun && !fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, {recursive: true});
}

const fileCount = processDirectory(docsRoot, docsRoot, outputRoot, registry, errors, dryRun);

let hasErrors = false;
for (const err of errors) {
  const prefix = err.level === 'error' ? 'ERROR' : 'WARN';
  const location = err.line > 0 ? `:${err.line}` : '';
  console[err.level === 'error' ? 'error' : 'warn'](
    `[resolve-includes] ${prefix}: ${err.file}${location} — ${err.message}`,
  );
  if (err.level === 'error') hasErrors = true;
}

if (hasErrors) {
  console.error(`[resolve-includes] failed with ${errors.filter(e => e.level === 'error').length} error(s)`);
  process.exit(1);
}

const mode = dryRun ? ' (dry run)' : ` → ${outputRoot}`;
console.log(`[resolve-includes] processed ${fileCount} file(s)${mode}`);
