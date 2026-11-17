/**
 * Content scope helpers: shared by lint-content.ts, resolve-variables.ts and
 * resolve-includes.ts.
 *
 * The lint gate and the resolvers must agree on which variables are defined
 * and which snippets exist, so both read them through this module:
 *
 *   - Variable scope chain (highest to lowest priority): page frontmatter,
 *     docs/<docset>/<version>/variables.json, docs/<docset>/variables.json,
 *     docs/variables.json
 *   - Snippet registry: every .md/.mdx file under docs/_snippets/, keyed as
 *     snippets/<relative path>
 *
 * Importing this module has no side effects, so it can be unit tested.
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types and patterns
// ---------------------------------------------------------------------------

export type VariableScope = Record<string, string | number>;

export type ScopeChain = {
  portal: VariableScope;
  docset: VariableScope;
  version: VariableScope;
  page: VariableScope;
};

export const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);

/** Version folders: 2025.01, 2025.02-LTS */
export const CALVER_RE = /^\d{4}\.\d{2}(-LTS)?$/;

/** Matches <!-- include: path/to/snippet.md --> with optional whitespace. Global: reset lastIndex before reuse. */
export const INCLUDE_RE = /<!--\s*include:\s*([^\s>]+)\s*-->/g;

/** Matches {{variable}} or {{variable|fallback}}. Global: reset lastIndex before reuse. */
export const VAR_RE = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)(?:\|([^}]*))?\}\}/g;

// ---------------------------------------------------------------------------
// Variable scopes
// ---------------------------------------------------------------------------

/** Loads a variables.json file. Values that are not strings or numbers are skipped and reported to onWarn. */
export function loadJsonScope(filePath: string, onWarn?: (message: string) => void): VariableScope {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const scope: VariableScope = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'string' || typeof value === 'number') {
        scope[key] = value;
      } else {
        onWarn?.(`variable "${key}" in ${filePath} has unsupported type "${typeof value}": skipped`);
      }
    }
    return scope;
  } catch {
    onWarn?.(`failed to parse ${filePath}: skipped`);
    return {};
  }
}

/** Extracts variables from frontmatter (simple YAML parser for the variables: block only). */
export function extractPageVariables(content: string): VariableScope {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  const scope: VariableScope = {};
  let inVariables = false;

  for (const line of fmMatch[1].split('\n')) {
    if (line.trim() === 'variables:') {
      inVariables = true;
      continue;
    }
    if (!inVariables) continue;

    // Stop at the next top-level key (no indent)
    if (line.length > 0 && !/^\s/.test(line)) {
      inVariables = false;
      continue;
    }

    const match = line.match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s+(.+)$/);
    if (match) scope[match[1]] = match[2].replace(/^['"]|['"]$/g, ''); // strip optional quotes
  }

  return scope;
}

export function buildScopeChain(
  filePath: string,
  content: string,
  docsRoot: string,
  onWarn?: (message: string) => void,
): ScopeChain {
  const segments = path.relative(docsRoot, filePath).split(path.sep);
  const docsetId = segments[0];
  const versionId = segments.length > 1 && CALVER_RE.test(segments[1]) ? segments[1] : null;

  return {
    portal: loadJsonScope(path.join(docsRoot, 'variables.json'), onWarn),
    docset: loadJsonScope(path.join(docsRoot, docsetId, 'variables.json'), onWarn),
    version: versionId ? loadJsonScope(path.join(docsRoot, docsetId, versionId, 'variables.json'), onWarn) : {},
    page: extractPageVariables(content),
  };
}

/** Page > version > docset > portal. Undefined when no scope defines the name. */
export function resolveValue(name: string, chain: ScopeChain): string | undefined {
  for (const scope of [chain.page, chain.version, chain.docset, chain.portal]) {
    if (Object.hasOwn(scope, name)) return String(scope[name]);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Snippet registry
// ---------------------------------------------------------------------------

export function loadSnippetRegistry(snippetsDir: string): Map<string, string> {
  const registry = new Map<string, string>();
  if (!fs.existsSync(snippetsDir)) return registry;

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

  walk(snippetsDir, '');
  return registry;
}
