import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {
  applyOverlay,
  normalizeSpec,
  validateOverlay,
  validateSpec,
  type OpenApiSpec,
  type Overlay,
} from '../openapi-spec.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const NOW = new Date('2026-01-02T03:04:05.000Z');

function op(operationId: string, extra: Record<string, unknown> = {}) {
  return {operationId, summary: `Summary ${operationId}`, tags: ['t'], responses: {'200': {description: 'OK'}}, ...extra};
}

function spec(overrides: Record<string, unknown> = {}): OpenApiSpec {
  return {
    openapi: '3.0.3',
    info: {title: 'Test API', version: '1.0.0', description: 'A test API'},
    servers: [{url: 'https://api.test'}],
    paths: {'/pets': {get: op('listPets')}},
    ...overrides,
  } as OpenApiSpec;
}

function find(diags: {level: string; path: string; message: string}[], diagPath: string) {
  return diags.filter(d => d.path === diagPath).map(({level, message}) => ({level, message}));
}

describe('validateSpec', () => {
  it('accepts a complete spec with no diagnostics', () => {
    assert.deepEqual(validateSpec(spec()), []);
  });

  it('requires OpenAPI 3.x without throwing on non-string versions', () => {
    for (const openapi of ['2.0', undefined, 3, null]) {
      const diags = validateSpec(spec({openapi}));
      assert.deepEqual(find(diags, 'openapi'), [{level: 'error', message: 'must be OpenAPI 3.x'}], String(openapi));
    }
  });

  it('requires info.title and info.version and recommends a description', () => {
    const diags = validateSpec(spec({info: {}}));
    assert.equal(find(diags, 'info.title')[0].level, 'error');
    assert.equal(find(diags, 'info.version')[0].level, 'error');
    assert.equal(find(diags, 'info.description')[0].level, 'warn');
  });

  it('requires at least one server', () => {
    assert.equal(find(validateSpec(spec({servers: []})), 'servers')[0].level, 'error');
    assert.equal(find(validateSpec(spec({servers: undefined})), 'servers')[0].level, 'error');
  });

  it('reports a primary server without a url instead of throwing', () => {
    const diags = validateSpec(spec({servers: [{description: 'no url'}]}));
    assert.deepEqual(find(diags, 'servers[0].url'), [{level: 'error', message: 'required'}]);
  });

  it('warns on a non-HTTPS primary server', () => {
    const diags = validateSpec(spec({servers: [{url: 'http://api.test'}]}));
    assert.equal(find(diags, 'servers[0].url')[0].level, 'warn');
  });

  it('requires at least one path', () => {
    assert.equal(find(validateSpec(spec({paths: {}})), 'paths')[0].level, 'error');
  });

  it('checks every operation for operationId, responses, summary and tags', () => {
    const diags = validateSpec(spec({paths: {'/pets': {post: {}}}}));
    assert.equal(find(diags, 'paths./pets.post.operationId')[0].level, 'error');
    assert.equal(find(diags, 'paths./pets.post.responses')[0].level, 'error');
    assert.equal(find(diags, 'paths./pets.post.summary')[0].level, 'warn');
    assert.equal(find(diags, 'paths./pets.post.tags')[0].level, 'warn');
  });

  it('rejects duplicate operationIds and names the first use', () => {
    const diags = validateSpec(spec({paths: {'/a': {get: op('dup')}, '/b': {post: op('dup')}}}));
    assert.deepEqual(find(diags, 'paths./b.post.operationId'), [
      {level: 'error', message: 'duplicate operationId "dup": also used at paths./a.get'},
    ]);
  });
});

describe('normalizeSpec', () => {
  it('deduplicates servers by url and keeps their order', () => {
    const servers = [{url: 'https://b'}, {url: 'https://a'}, {url: 'https://b', description: 'dup'}];
    assert.deepEqual(normalizeSpec(spec({servers}), 'src.json', NOW).servers, [{url: 'https://b'}, {url: 'https://a'}]);
  });

  it('sorts paths and methods and keeps path-level keys', () => {
    const paths = {
      '/z': {get: op('z')},
      '/a': {parameters: [{name: 'id', in: 'path'}], post: op('aPost'), get: op('aGet')},
    };
    const out = normalizeSpec(spec({paths}), 'src.json', NOW);
    assert.deepEqual(Object.keys(out.paths!), ['/a', '/z']);
    assert.deepEqual(Object.keys(out.paths!['/a']), ['get', 'post', 'parameters']);
  });

  it('stamps the source label and timestamp', () => {
    const out = normalizeSpec(spec(), 'static/openapi/test.json', NOW);
    assert.equal(out['x-normalized'], true);
    assert.equal(out['x-normalized-at'], '2026-01-02T03:04:05.000Z');
    assert.equal(out['x-source-file'], 'static/openapi/test.json');
  });

  it('is deterministic and leaves the input unchanged', () => {
    const input = spec({paths: {'/b': {get: op('b')}, '/a': {get: op('a')}}});
    const before = JSON.stringify(input);
    assert.equal(JSON.stringify(normalizeSpec(input, 's', NOW)), JSON.stringify(normalizeSpec(input, 's', NOW)));
    assert.equal(JSON.stringify(input), before);
  });
});

describe('validateOverlay', () => {
  it('accepts a well-formed overlay', () => {
    assert.deepEqual(validateOverlay({docset: 'd', patches: [{operationId: 'a'}, {operationId: 'b'}]}), []);
  });

  it('requires a docset and warns on an empty overlay', () => {
    const diags = validateOverlay({patches: []} as unknown as Overlay);
    assert.deepEqual(diags.map(d => [d.level, d.context]), [['error', 'overlay.docset'], ['warn', 'overlay.patches']]);
  });

  it('rejects patches without an operationId or with a repeated one', () => {
    const diags = validateOverlay({docset: 'd', patches: [{operationId: 'a'}, {operationId: 'a'}, {} as never]});
    assert.deepEqual(diags.map(d => [d.level, d.context]), [['error', 'patch[a]'], ['error', 'patch']]);
  });
});

describe('applyOverlay', () => {
  const base = () =>
    spec({
      paths: {
        '/pets': {
          get: op('listPets', {
            description: 'Original',
            parameters: [{name: 'limit', in: 'query', example: 10}, {name: 'tag', in: 'query'}],
          }),
        },
        '/health': {get: op('health')},
      },
    });

  it('patches parameters by name and merges operation fields', () => {
    const overlay: Overlay = {
      docset: 'pets',
      patches: [
        {
          operationId: 'listPets',
          description: 'Why this patch exists',
          summary: 'Patched summary',
          'x-scalar-stability': 'stable',
          parameters: [{name: 'limit', example: 5, description: 'Page size'}],
        },
      ],
    };
    const {spec: out, diagnostics} = applyOverlay(base(), overlay, NOW);
    const listPets = out.paths!['/pets'].get as Record<string, unknown>;

    assert.deepEqual(diagnostics, []);
    assert.deepEqual(listPets.parameters, [
      {name: 'limit', in: 'query', example: 5, description: 'Page size'},
      {name: 'tag', in: 'query'},
    ]);
    assert.equal(listPets.summary, 'Patched summary');
    assert.equal(listPets['x-scalar-stability'], 'stable');
    assert.equal(listPets.description, 'Original', 'patch description documents the patch, not the operation');
    assert.equal(listPets['x-overlay-applied'], 'pets');
    assert.equal((out.paths!['/health'].get as Record<string, unknown>)['x-overlay-applied'], undefined);
    assert.equal(out['x-overlay-applied'], 'pets');
    assert.equal(out['x-overlay-applied-at'], '2026-01-02T03:04:05.000Z');
  });

  it('errors on a patch for an unknown operationId', () => {
    const {diagnostics} = applyOverlay(base(), {docset: 'pets', patches: [{operationId: 'nope'}]}, NOW);
    assert.deepEqual(diagnostics.map(d => [d.level, d.context]), [['error', 'patch[nope]']]);
  });

  it('warns on an unknown parameter without adding a parameters list', () => {
    const overlay: Overlay = {docset: 'pets', patches: [{operationId: 'health', parameters: [{name: 'verbose', example: true}]}]};
    const {spec: out, diagnostics} = applyOverlay(base(), overlay, NOW);
    assert.deepEqual(diagnostics.map(d => [d.level, d.context]), [['warn', 'patch[health].parameters[verbose]']]);
    assert.equal('parameters' in (out.paths!['/health'].get as object), false);
  });

  it('leaves the input spec unchanged', () => {
    const input = base();
    const before = JSON.stringify(input);
    applyOverlay(input, {docset: 'pets', patches: [{operationId: 'listPets', summary: 'x'}]}, NOW);
    assert.equal(JSON.stringify(input), before);
  });
});

describe('curated specs and overlays in the repo', () => {
  const specFile = (docset: string) => path.join(REPO_ROOT, 'static', 'openapi', `${docset}-playground.json`);
  const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const file of fs.readdirSync(path.join(REPO_ROOT, 'static', 'openapi')).filter(f => f.endsWith('.json'))) {
    it(`${file} validates without errors`, () => {
      const errors = validateSpec(readJson(path.join(REPO_ROOT, 'static', 'openapi', file))).filter(d => d.level === 'error');
      assert.deepEqual(errors, []);
    });
  }

  const overlayDir = path.join(REPO_ROOT, 'openapi', 'overlays');
  for (const file of fs.readdirSync(overlayDir).filter(f => f.endsWith('.overlay.json'))) {
    it(`${file} applies cleanly to its docset's spec`, () => {
      const overlay: Overlay = readJson(path.join(overlayDir, file));
      assert.deepEqual(validateOverlay(overlay), []);
      const normalized = normalizeSpec(readJson(specFile(overlay.docset)), 'spec', NOW);
      assert.deepEqual(applyOverlay(normalized, overlay, NOW).diagnostics, []);
    });
  }
});
