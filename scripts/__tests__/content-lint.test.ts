import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import {fileURLToPath} from 'url';
import {lintDocs, lintVariables, type LintViolation} from '../content-lint.js';

const DOCS_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'content-lint', 'docs');

const all = lintDocs({docsRoot: DOCS_ROOT});

function forFile(file: string, violations: LintViolation[] = all) {
  return violations.filter(v => v.file === file).map(({rule, level, line}) => ({rule, level, line}));
}

describe('lintDocs: clean pages', () => {
  it('passes a page using portal, docset and page variables and a nested include', () => {
    assert.deepEqual(forFile('shop/good.md'), []);
  });

  it('passes a versioned page using its version scope', () => {
    assert.deepEqual(forFile('shop/2025.01/versioned.md'), []);
  });
});

describe('lintDocs: VAR-01 undefined variables', () => {
  it('errors on undefined variables and warns when a fallback is given', () => {
    assert.deepEqual(forFile('shop/undefined.md'), [
      {rule: 'VAR-01', level: 'error', line: 4},
      {rule: 'VAR-01', level: 'warn', line: 6},
      {rule: 'VAR-01', level: 'error', line: 7},
      {rule: 'VAR-01', level: 'error', line: 8},
    ]);
  });

  it('does not treat inherited object properties as defined', () => {
    const v = all.find(x => x.file === 'shop/undefined.md' && x.line === 7);
    assert.match(v!.message, /\{\{constructor\}\}/);
  });

  it('keeps version variables out of unversioned pages', () => {
    const v = all.find(x => x.file === 'shop/undefined.md' && x.line === 8);
    assert.match(v!.message, /\{\{release\}\}/);
  });

  it('reads page variables from CRLF frontmatter', () => {
    const content = '---\r\ntitle: Windows\r\nvariables:\r\n  local: x\r\n---\r\nUses {{local}}.\r\n';
    const violations: LintViolation[] = [];
    lintVariables(content, path.join(DOCS_ROOT, 'shop', 'crlf.md'), DOCS_ROOT, violations);
    assert.deepEqual(violations, []);
  });
});

describe('lintDocs: VAR-02 variable value types', () => {
  it('errors on object, array and boolean values at their line', () => {
    assert.deepEqual(forFile('shop/variables.json'), [
      {rule: 'VAR-02', level: 'error', line: 3},
      {rule: 'VAR-02', level: 'error', line: 4},
      {rule: 'VAR-02', level: 'error', line: 5},
    ]);
  });

  it('errors on a variables file that is not valid JSON', () => {
    assert.deepEqual(forFile('broken/variables.json'), [{rule: 'VAR-02', level: 'error', line: 1}]);
  });

  it('passes variables files with only strings and numbers', () => {
    assert.deepEqual(forFile('variables.json'), []);
    assert.deepEqual(forFile('shop/2025.01/variables.json'), []);
  });
});

describe('lintDocs: INC-01 and INC-02 includes', () => {
  it('errors on an include that is not in the snippet registry', () => {
    assert.deepEqual(forFile('shop/missing-include.md'), [{rule: 'INC-01', level: 'error', line: 5}]);
  });

  it('errors on a circular include and names the chain', () => {
    const loops = all.filter(v => v.rule === 'INC-02');
    assert.equal(loops.length, 1);
    assert.equal(loops[0].file, '_snippets/loop-b.md');
    assert.equal(loops[0].line, 2);
    assert.match(loops[0].message, /snippets\/loop-a\.md → snippets\/loop-b\.md → snippets\/loop-a\.md/);
  });
});

describe('lintDocs: output', () => {
  it('reports only the expected violations', () => {
    assert.deepEqual(
      [...new Set(all.map(v => v.file))].sort(),
      ['_snippets/loop-b.md', 'broken/variables.json', 'shop/missing-include.md', 'shop/undefined.md', 'shop/variables.json'],
    );
  });

  it('sorts by file then line', () => {
    const keys = all.map(v => `${v.file}:${String(v.line).padStart(4, '0')}`);
    assert.deepEqual(keys, [...keys].sort());
  });

  it('runs only the rule family named by ruleFilter', () => {
    assert.ok(lintDocs({docsRoot: DOCS_ROOT, ruleFilter: 'INC-01'}).every(v => v.rule.startsWith('INC')));
    assert.ok(lintDocs({docsRoot: DOCS_ROOT, ruleFilter: 'VAR-02'}).every(v => v.rule.startsWith('VAR')));
  });
});
