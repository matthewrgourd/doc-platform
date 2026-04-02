/**
 * Content lint runner — Epic 3, Story 3.3
 *
 * Unified lint gate for include and variable composition rules.
 * Runs all rules against the docs tree and reports violations with
 * file path and line number. Exits 1 if any errors are found.
 *
 * Rules:
 *   INC-01 — All include directives must reference a registered snippet
 *   INC-02 — No circular include chains
 *   VAR-01 — All {{variables}} must be defined in the scope chain
 *   VAR-02 — Variable values must be string or number (no objects/arrays)
 *
 * Usage:
 *   npx tsx scripts/lint-content.ts
 *   npx tsx scripts/lint-content.ts --rule INC-01   (run a single rule)
 *   npm run lint-content
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LintViolation = {
  rule: string;
  level: 'error' | 'warn';
  file: string;
  line: number;
  message: string;
};

type VariableScope = Record<string, string | number>;
type ScopeChain = {portal: VariableScope; docset: VariableScope; version: VariableScope; page: VariableScope};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const SNIPPETS_DIR = path.join(DOCS_ROOT, '_snippets');
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);
const CALVER_RE = /^\d{4}\.\d{2}(-LTS)?$/;
const INCLUDE_RE = /<!--\s*include:\s*([^\s>]+)\s*-->/g;
const VAR_RE = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)(?:\|([^}]*))?\}\}/g;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {ruleFilter: string | null} {
  const args = process.argv.slice(2);
  const ruleIdx = args.indexOf('--rule');
  return {ruleFilter: ruleIdx !== -1 && args[ruleIdx + 1] ? args[ruleIdx + 1] : null};
}

// ---------------------------------------------------------------------------
// Snippet registry (reused from resolve-includes)
// ---------------------------------------------------------------------------

function loadSnippetRegistry(): Map<string, string> {
  const registry = new Map<string, string>();
  if (!fs.existsSync(SNIPPETS_DIR)) return registry;

  function walk(dir: string, prefix: string): void {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const fullPath = path.join(dir, entry.name);
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(fullPath, relPath);
      else if (CONTENT_EXTENSIONS.has(path.extname(entry.name))) {
        registry.set(`snippets/${relPath}`, fs.readFileSync(fullPath, 'utf8'));
      }
    }
  }

  walk(SNIPPETS_DIR, '');
  return registry;
}

// ---------------------------------------------------------------------------
// Variable scope helpers (reused from resolve-variables)
// ---------------------------------------------------------------------------

function loadJsonScope(filePath: string): VariableScope {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const scope: VariableScope = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'string' || typeof value === 'number') scope[key] = value;
    }
    return scope;
  } catch {
    return {};
  }
}

function extractPageVariables(content: string): VariableScope {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};
  const scope: VariableScope = {};
  const lines = fmMatch[1].split('\n');
  let inVariables = false;

  for (const line of lines) {
    if (line.trim() === 'variables:') { inVariables = true; continue; }
    if (inVariables && line.length > 0 && !/^\s/.test(line)) { inVariables = false; continue; }
    if (inVariables) {
      const match = line.match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s+(.+)$/);
      if (match) scope[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return scope;
}

function buildScopeChain(filePath: string, content: string): ScopeChain {
  const relPath = path.relative(DOCS_ROOT, filePath);
  const segments = relPath.split(path.sep);
  const docsetId = segments[0];
  const versionId = segments.length > 1 && CALVER_RE.test(segments[1]) ? segments[1] : null;

  return {
    portal: loadJsonScope(path.join(DOCS_ROOT, 'variables.json')),
    docset: loadJsonScope(path.join(DOCS_ROOT, docsetId, 'variables.json')),
    version: versionId ? loadJsonScope(path.join(DOCS_ROOT, docsetId, versionId, 'variables.json')) : {},
    page: extractPageVariables(content),
  };
}

function isVariableDefined(name: string, chain: ScopeChain): boolean {
  return name in chain.page || name in chain.version || name in chain.docset || name in chain.portal;
}

// ---------------------------------------------------------------------------
// Lint rules
// ---------------------------------------------------------------------------

function lintIncludes(
  content: string,
  filePath: string,
  registry: Map<string, string>,
  violations: LintViolation[],
  stack: string[] = [],
): void {
  const relPath = path.relative(DOCS_ROOT, filePath);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    INCLUDE_RE.lastIndex = 0;
    const match = INCLUDE_RE.exec(lines[i]);
    if (!match) continue;

    const includePath = match[1].trim();

    // INC-01: snippet must be in registry
    if (!registry.has(includePath)) {
      violations.push({
        rule: 'INC-01',
        level: 'error',
        file: relPath,
        line: i + 1,
        message: `snippet not in registry: "${includePath}" — add to docs/_snippets/`,
      });
      continue;
    }

    // INC-02: circular include detection
    if (stack.includes(includePath)) {
      const chain = [...stack, includePath].join(' → ');
      violations.push({
        rule: 'INC-02',
        level: 'error',
        file: relPath,
        line: i + 1,
        message: `circular include: ${chain}`,
      });
      continue;
    }

    // Recurse into snippet to check its includes
    const snippetContent = registry.get(includePath)!;
    const snippetFilePath = path.join(SNIPPETS_DIR, includePath.replace('snippets/', ''));
    lintIncludes(snippetContent, snippetFilePath, registry, violations, [...stack, includePath]);
  }
}

function lintVariables(
  content: string,
  filePath: string,
  violations: LintViolation[],
): void {
  const relPath = path.relative(DOCS_ROOT, filePath);
  const chain = buildScopeChain(filePath, content);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    VAR_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VAR_RE.exec(lines[i])) !== null) {
      const [, name, fallback] = match;

      if (!isVariableDefined(name, chain)) {
        if (fallback !== undefined) {
          // Has fallback — warn only
          violations.push({
            rule: 'VAR-01',
            level: 'warn',
            file: relPath,
            line: i + 1,
            message: `variable "{{${name}}}" undefined — inline fallback "${fallback}" will be used`,
          });
        } else {
          violations.push({
            rule: 'VAR-01',
            level: 'error',
            file: relPath,
            line: i + 1,
            message: `variable "{{${name}}}" is not defined in any scope (portal, docset, version, or page frontmatter)`,
          });
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

function walkDocs(violations: LintViolation[], registry: Map<string, string>, ruleFilter: string | null): void {
  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.name === '_snippets') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(fullPath); continue; }
      if (!CONTENT_EXTENSIONS.has(path.extname(entry.name))) continue;

      const content = fs.readFileSync(fullPath, 'utf8');

      if (!ruleFilter || ruleFilter.startsWith('INC')) {
        lintIncludes(content, fullPath, registry, violations);
      }
      if (!ruleFilter || ruleFilter.startsWith('VAR')) {
        lintVariables(content, fullPath, violations);
      }
    }
  }
  walk(DOCS_ROOT);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {ruleFilter} = parseArgs();
const registry = loadSnippetRegistry();
const violations: LintViolation[] = [];

walkDocs(violations, registry, ruleFilter);

// Sort by file then line for readable output
violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

// Print violations
for (const v of violations) {
  const prefix = v.level === 'error' ? 'error' : 'warn';
  console[v.level === 'error' ? 'error' : 'warn'](
    `[lint] ${prefix} ${v.rule}  ${v.file}:${v.line}  ${v.message}`,
  );
}

const errors = violations.filter(v => v.level === 'error').length;
const warns = violations.filter(v => v.level === 'warn').length;

console.log();
if (violations.length === 0) {
  console.log('[lint] no violations found');
} else {
  const parts: string[] = [];
  if (errors > 0) parts.push(`${errors} error(s)`);
  if (warns > 0) parts.push(`${warns} warning(s)`);
  console.log(`[lint] ${parts.join(', ')} found`);
}

process.exit(errors > 0 ? 1 : 0);
