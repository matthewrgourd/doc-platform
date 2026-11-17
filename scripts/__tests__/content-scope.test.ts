import {describe, it, before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildScopeChain,
  extractPageVariables,
  loadJsonScope,
  loadSnippetRegistry,
  resolveValue,
  type ScopeChain,
} from '../content-scope.js';

const EMPTY: ScopeChain = {portal: {}, docset: {}, version: {}, page: {}};

let root: string;

function write(relPath: string, content: string): string {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), {recursive: true});
  fs.writeFileSync(full, content);
  return full;
}

before(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-scope-'));
});

after(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

describe('extractPageVariables', () => {
  it('reads the variables block and strips quotes', () => {
    const md = '---\ntitle: T\nvariables:\n  product: "Petstore"\n  version: \'2\'\n  plain: yes\n---\n# Body\n';
    assert.deepEqual(extractPageVariables(md), {product: 'Petstore', version: '2', plain: 'yes'});
  });

  it('stops at the next top-level key', () => {
    const md = '---\nvariables:\n  a: one\nsidebar_label: Nope\n  b: two\n---\n';
    assert.deepEqual(extractPageVariables(md), {a: 'one'});
  });

  it('treats tab-indented keys as part of the block', () => {
    const md = '---\nvariables:\n\ta: one\n---\n';
    assert.deepEqual(extractPageVariables(md), {a: 'one'});
  });

  it('reads frontmatter with CRLF line endings', () => {
    const md = '---\r\ntitle: T\r\nvariables:\r\n  a: "one"\r\n  b: two\r\n---\r\n# Body\r\n';
    assert.deepEqual(extractPageVariables(md), {a: 'one', b: 'two'});
  });

  it('returns nothing without frontmatter or a variables block', () => {
    assert.deepEqual(extractPageVariables('# No frontmatter\nvariables:\n  a: one\n'), {});
    assert.deepEqual(extractPageVariables('---\ntitle: T\n---\n'), {});
  });
});

describe('loadJsonScope', () => {
  it('returns an empty scope for a missing file', () => {
    assert.deepEqual(loadJsonScope(path.join(root, 'missing.json')), {});
  });

  it('keeps strings and numbers and reports other types', () => {
    const file = write('mixed.json', JSON.stringify({s: 'x', n: 3, o: {a: 1}, l: [1], b: true}));
    const warnings: string[] = [];
    assert.deepEqual(loadJsonScope(file, msg => warnings.push(msg)), {s: 'x', n: 3});
    assert.equal(warnings.length, 3);
    assert.match(warnings[0], /"o".*unsupported type "object"/);
  });

  it('reports invalid JSON and returns an empty scope', () => {
    const file = write('broken.json', '{not json');
    const warnings: string[] = [];
    assert.deepEqual(loadJsonScope(file, msg => warnings.push(msg)), {});
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /failed to parse/);
  });

  it('is silent without a warning callback', () => {
    const file = write('silent.json', '{not json');
    assert.deepEqual(loadJsonScope(file), {});
  });
});

describe('buildScopeChain', () => {
  before(() => {
    write('variables.json', JSON.stringify({level: 'portal', portal_only: 'p'}));
    write('shop/variables.json', JSON.stringify({level: 'docset'}));
    write('shop/2025.01/variables.json', JSON.stringify({level: 'version'}));
    write('shop/2025.02-LTS/variables.json', JSON.stringify({level: 'lts'}));
  });

  it('loads portal and docset scopes for an unversioned page', () => {
    const chain = buildScopeChain(path.join(root, 'shop/guides/intro.md'), '', root);
    assert.deepEqual(chain.portal, {level: 'portal', portal_only: 'p'});
    assert.deepEqual(chain.docset, {level: 'docset'});
    assert.deepEqual(chain.version, {});
  });

  it('loads the version scope only for CalVer folders', () => {
    assert.deepEqual(buildScopeChain(path.join(root, 'shop/2025.01/a.md'), '', root).version, {level: 'version'});
    assert.deepEqual(buildScopeChain(path.join(root, 'shop/2025.02-LTS/a.md'), '', root).version, {level: 'lts'});
    assert.deepEqual(buildScopeChain(path.join(root, 'shop/v2/a.md'), '', root).version, {});
  });

  it('reads page variables from the content', () => {
    const md = '---\nvariables:\n  level: page\n---\n';
    assert.deepEqual(buildScopeChain(path.join(root, 'shop/a.md'), md, root).page, {level: 'page'});
  });
});

describe('resolveValue', () => {
  const chain: ScopeChain = {
    portal: {name: 'portal', p: 'P', n: 0},
    docset: {name: 'docset', d: 'D'},
    version: {name: 'version', empty: ''},
    page: {name: 'page'},
  };

  it('resolves page > version > docset > portal', () => {
    assert.equal(resolveValue('name', chain), 'page');
    assert.equal(resolveValue('name', {...chain, page: {}}), 'version');
    assert.equal(resolveValue('name', {...chain, page: {}, version: {}}), 'docset');
    assert.equal(resolveValue('name', {...chain, page: {}, version: {}, docset: {}}), 'portal');
  });

  it('falls through to lower scopes for names a higher scope lacks', () => {
    assert.equal(resolveValue('d', chain), 'D');
    assert.equal(resolveValue('p', chain), 'P');
  });

  it('treats empty strings and zero as defined', () => {
    assert.equal(resolveValue('empty', chain), '');
    assert.equal(resolveValue('n', chain), '0');
  });

  it('returns undefined when no scope defines the name', () => {
    assert.equal(resolveValue('missing', chain), undefined);
    assert.equal(resolveValue('missing', EMPTY), undefined);
  });

  it('ignores inherited object properties', () => {
    assert.equal(resolveValue('toString', EMPTY), undefined);
    assert.equal(resolveValue('constructor', EMPTY), undefined);
  });
});

describe('loadSnippetRegistry', () => {
  it('keys snippets by their path under snippets/', () => {
    const dir = path.join(root, 'snips');
    write('snips/warn.md', 'Warning');
    write('snips/api/limits.mdx', 'Limits');
    write('snips/notes.txt', 'ignored');
    const registry = loadSnippetRegistry(dir);
    assert.deepEqual([...registry.keys()].sort(), ['snippets/api/limits.mdx', 'snippets/warn.md']);
    assert.equal(registry.get('snippets/warn.md'), 'Warning');
  });

  it('returns an empty registry for a missing folder', () => {
    assert.equal(loadSnippetRegistry(path.join(root, 'nope')).size, 0);
  });
});
