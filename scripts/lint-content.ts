/**
 * Content lint runner: Epic 3, Story 3.3
 *
 * Unified lint gate for include and variable composition rules.
 * Runs all rules against the docs tree and reports violations with
 * file path and line number. Exits 1 if any errors are found.
 *
 * Rules (implemented in content-lint.ts):
 *   INC-01: All include directives must reference a registered snippet
 *   INC-02: No circular include chains
 *   VAR-01: All {{variables}} must be defined in the scope chain
 *   VAR-02: Variable values must be string or number (no objects/arrays)
 *
 * Usage:
 *   npx tsx scripts/lint-content.ts
 *   npx tsx scripts/lint-content.ts --rule INC-01   (run a single rule family)
 *   npm run lint-content
 */

import path from 'path';
import {lintDocs} from './content-lint.js';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {ruleFilter: string | null} {
  const args = process.argv.slice(2);
  const ruleIdx = args.indexOf('--rule');
  return {ruleFilter: ruleIdx !== -1 && args[ruleIdx + 1] ? args[ruleIdx + 1] : null};
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const {ruleFilter} = parseArgs();
const violations = lintDocs({docsRoot: path.resolve(process.cwd(), 'docs'), ruleFilter});

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
