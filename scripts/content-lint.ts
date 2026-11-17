/**
 * Content lint rules: used by lint-content.ts (the CLI) and its tests.
 *
 * Rules:
 *   INC-01: All include directives must reference a registered snippet
 *   INC-02: No circular include chains
 *   VAR-01: All {{variables}} must be defined in the scope chain
 *   VAR-02: Values in variables.json files must be strings or numbers, and the file must be valid JSON
 *
 * Importing this module has no side effects, so it can be unit tested.
 */

import fs from 'fs';
import path from 'path';
import {
  CONTENT_EXTENSIONS,
  INCLUDE_RE,
  VAR_RE,
  buildScopeChain,
  loadSnippetRegistry,
  resolveValue,
} from './content-scope.js';

export type LintViolation = {
  rule: string;
  level: 'error' | 'warn';
  /** Path relative to the docs root */
  file: string;
  line: number;
  message: string;
};

export type LintOptions = {
  docsRoot: string;
  /** Defaults to <docsRoot>/_snippets */
  snippetsDir?: string;
  /** Run one rule family: any rule id starting with INC or VAR */
  ruleFilter?: string | null;
};

// ---------------------------------------------------------------------------
// INC-01, INC-02
// ---------------------------------------------------------------------------

export function lintIncludes(
  content: string,
  filePath: string,
  registry: Map<string, string>,
  docsRoot: string,
  snippetsDir: string,
  violations: LintViolation[],
  stack: string[] = [],
): void {
  const relPath = path.relative(docsRoot, filePath);
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
        message: `snippet not in registry: "${includePath}". Add to docs/_snippets/`,
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
    const snippetFilePath = path.join(snippetsDir, includePath.replace('snippets/', ''));
    lintIncludes(snippetContent, snippetFilePath, registry, docsRoot, snippetsDir, violations, [...stack, includePath]);
  }
}

// ---------------------------------------------------------------------------
// VAR-01
// ---------------------------------------------------------------------------

export function lintVariables(
  content: string,
  filePath: string,
  docsRoot: string,
  violations: LintViolation[],
): void {
  const relPath = path.relative(docsRoot, filePath);
  const chain = buildScopeChain(filePath, content, docsRoot);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    VAR_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VAR_RE.exec(lines[i])) !== null) {
      const [, name, fallback] = match;
      if (resolveValue(name, chain) !== undefined) continue;

      if (fallback !== undefined) {
        // Has fallback: warn only
        violations.push({
          rule: 'VAR-01',
          level: 'warn',
          file: relPath,
          line: i + 1,
          message: `variable "{{${name}}}" undefined: inline fallback "${fallback}" will be used`,
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

// ---------------------------------------------------------------------------
// VAR-02
// ---------------------------------------------------------------------------

/** 1-based line of the first `"key":` in a JSON file, or 1 if not found. */
function findKeyLine(lines: string[], key: string): number {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keyRe = new RegExp(`"${escaped}"\\s*:`);
  const index = lines.findIndex(line => keyRe.test(line));
  return index === -1 ? 1 : index + 1;
}

export function lintVariableFile(filePath: string, docsRoot: string, violations: LintViolation[]): void {
  const relPath = path.relative(docsRoot, filePath);
  const text = fs.readFileSync(filePath, 'utf8');

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    violations.push({
      rule: 'VAR-02',
      level: 'error',
      file: relPath,
      line: 1,
      message: `not valid JSON: ${(err as Error).message}`,
    });
    return;
  }

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    violations.push({
      rule: 'VAR-02',
      level: 'error',
      file: relPath,
      line: 1,
      message: 'must be a JSON object of variable names to values',
    });
    return;
  }

  const lines = text.split('\n');
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' || typeof value === 'number') continue;
    const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    violations.push({
      rule: 'VAR-02',
      level: 'error',
      file: relPath,
      line: findKeyLine(lines, key),
      message: `variable "${key}" has unsupported type "${type}": use a string or number`,
    });
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/** Lints every page and variables.json under docsRoot. Violations are sorted by file then line. */
export function lintDocs({docsRoot, snippetsDir, ruleFilter = null}: LintOptions): LintViolation[] {
  const snippets = snippetsDir ?? path.join(docsRoot, '_snippets');
  const registry = loadSnippetRegistry(snippets);
  const runInc = !ruleFilter || ruleFilter.startsWith('INC');
  const runVar = !ruleFilter || ruleFilter.startsWith('VAR');
  const violations: LintViolation[] = [];

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.name === '_snippets') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(fullPath); continue; }

      if (entry.name === 'variables.json') {
        if (runVar) lintVariableFile(fullPath, docsRoot, violations);
        continue;
      }
      if (!CONTENT_EXTENSIONS.has(path.extname(entry.name))) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      if (runInc) lintIncludes(content, fullPath, registry, docsRoot, snippets, violations);
      if (runVar) lintVariables(content, fullPath, docsRoot, violations);
    }
  }

  walk(docsRoot);
  return violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}
