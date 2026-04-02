/**
 * Variables precedence engine — Epic 3, Story 3.2
 *
 * Resolves {{variable_name}} placeholders in Markdown/MDX content using a
 * four-level scope chain (highest to lowest priority):
 *
 *   1. Page — frontmatter `variables:` block in the source file
 *   2. Version — docs/<docset>/<version>/variables.json (versioned docsets)
 *   3. Docset — docs/<docset>/variables.json
 *   4. Portal — variables.json at the docs root
 *
 * Variable syntax:
 *   {{variable_name}}          — simple substitution
 *   {{variable_name|fallback}} — substitution with inline fallback
 *
 * Variable values must be strings or numbers. Objects/arrays are rejected.
 *
 * Usage:
 *   npx tsx scripts/resolve-variables.ts [--docs <dir>] [--out <dir>]
 *   npx tsx scripts/resolve-variables.ts --dry-run
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VariableScope = Record<string, string | number>;

type ScopeChain = {
  portal: VariableScope;
  docset: VariableScope;
  version: VariableScope;
  page: VariableScope;
};

type VariableError = {
  level: 'error' | 'warn';
  file: string;
  line: number;
  variable: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const OUTPUT_ROOT = path.resolve(process.cwd(), 'build', 'processed');
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);
const CALVER_RE = /^\d{4}\.\d{2}(-LTS)?$/;

/** Matches {{variable}} or {{variable|fallback}} */
const VAR_RE = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)(?:\|([^}]*))?\}\}/g;

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
// Scope loaders
// ---------------------------------------------------------------------------

function loadJsonScope(filePath: string): VariableScope {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const scope: VariableScope = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'string' || typeof value === 'number') {
        scope[key] = value;
      } else {
        console.warn(
          `[resolve-variables] WARN: variable "${key}" in ${filePath} has unsupported type "${typeof value}" — skipped`,
        );
      }
    }
    return scope;
  } catch {
    console.warn(`[resolve-variables] WARN: failed to parse ${filePath} — skipped`);
    return {};
  }
}

/** Extracts variables from frontmatter (simple YAML parser for the variables: block only). */
function extractPageVariables(content: string): VariableScope {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  const scope: VariableScope = {};
  const fmLines = fmMatch[1].split('\n');
  let inVariables = false;

  for (const line of fmLines) {
    if (line.trim() === 'variables:') {
      inVariables = true;
      continue;
    }

    if (inVariables) {
      // Stop if we hit another top-level key (no indent)
      if (line.length > 0 && line[0] !== ' ' && !line.startsWith('  ')) {
        inVariables = false;
        continue;
      }

      // Match "  key: value" lines
      const match = line.match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s+(.+)$/);
      if (match) {
        const [, key, rawValue] = match;
        const value = rawValue.replace(/^['"]|['"]$/g, ''); // strip optional quotes
        scope[key] = value;
      }
    }
  }

  return scope;
}

function buildScopeChain(
  filePath: string,
  content: string,
  docsRoot: string,
): ScopeChain {
  const relPath = path.relative(docsRoot, filePath);
  const segments = relPath.split(path.sep);
  const docsetId = segments[0];

  // Detect version segment
  const versionId = segments.length > 1 && CALVER_RE.test(segments[1]) ? segments[1] : null;

  const portal = loadJsonScope(path.join(docsRoot, 'variables.json'));
  const docset = loadJsonScope(path.join(docsRoot, docsetId, 'variables.json'));
  const version = versionId
    ? loadJsonScope(path.join(docsRoot, docsetId, versionId, 'variables.json'))
    : {};
  const page = extractPageVariables(content);

  return {portal, docset, version, page};
}

function resolveValue(name: string, chain: ScopeChain): string | undefined {
  // Page > version > docset > portal
  if (name in chain.page) return String(chain.page[name]);
  if (name in chain.version) return String(chain.version[name]);
  if (name in chain.docset) return String(chain.docset[name]);
  if (name in chain.portal) return String(chain.portal[name]);
  return undefined;
}

// ---------------------------------------------------------------------------
// Variable resolution
// ---------------------------------------------------------------------------

function resolveVariables(
  content: string,
  filePath: string,
  docsRoot: string,
  errors: VariableError[],
): string {
  const chain = buildScopeChain(filePath, content, docsRoot);
  const lines = content.split('\n');
  const resolved: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    VAR_RE.lastIndex = 0;

    const result = line.replace(VAR_RE, (match, name: string, fallback?: string) => {
      const value = resolveValue(name, chain);

      if (value !== undefined) return value;

      if (fallback !== undefined) {
        errors.push({
          level: 'warn',
          file: path.relative(docsRoot, filePath),
          line: i + 1,
          variable: name,
          message: `variable "{{${name}}}" not defined — using inline fallback "${fallback}"`,
        });
        return fallback;
      }

      errors.push({
        level: 'warn',
        file: path.relative(docsRoot, filePath),
        line: i + 1,
        variable: name,
        message: `variable "{{${name}}}" not defined in any scope — left unresolved`,
      });
      return match; // leave placeholder intact
    });

    resolved.push(result);
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
  errors: VariableError[],
  dryRun: boolean,
): number {
  let processed = 0;

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === '_snippets') continue;

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(docsRoot, fullPath);
    const outPath = path.join(outputRoot, relPath);

    if (entry.isDirectory()) {
      if (!dryRun && !fs.existsSync(outPath)) fs.mkdirSync(outPath, {recursive: true});
      processed += processDirectory(fullPath, docsRoot, outputRoot, errors, dryRun);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const content = fs.readFileSync(fullPath, 'utf8');

      if (CONTENT_EXTENSIONS.has(ext)) {
        const resolvedContent = resolveVariables(content, fullPath, docsRoot, errors);
        if (!dryRun) {
          if (!fs.existsSync(path.dirname(outPath))) fs.mkdirSync(path.dirname(outPath), {recursive: true});
          fs.writeFileSync(outPath, resolvedContent);
        }
        processed++;
      } else if (!dryRun) {
        if (!fs.existsSync(path.dirname(outPath))) fs.mkdirSync(path.dirname(outPath), {recursive: true});
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
  console.error(`[resolve-variables] ERROR: docs root not found: ${docsRoot}`);
  process.exit(1);
}

const errors: VariableError[] = [];

if (!dryRun && !fs.existsSync(outputRoot)) fs.mkdirSync(outputRoot, {recursive: true});

const fileCount = processDirectory(docsRoot, docsRoot, outputRoot, errors, dryRun);

for (const err of errors) {
  const prefix = err.level === 'error' ? 'ERROR' : 'WARN';
  console[err.level === 'error' ? 'error' : 'warn'](
    `[resolve-variables] ${prefix}: ${err.file}:${err.line} — ${err.message}`,
  );
}

const mode = dryRun ? ' (dry run)' : ` → ${outputRoot}`;
const warnCount = errors.filter(e => e.level === 'warn').length;
console.log(
  `[resolve-variables] processed ${fileCount} file(s)${mode}` +
    (warnCount > 0 ? ` — ${warnCount} warning(s)` : ''),
);
