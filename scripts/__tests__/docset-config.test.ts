import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidCalVer,
  resolveLatestVersion,
  validateDocsetConfig,
  type DocsetConfig,
} from '../docset.config.js';

describe('isValidCalVer', () => {
  it('accepts yyyy.mm format', () => {
    assert.equal(isValidCalVer('2024.01'), true);
    assert.equal(isValidCalVer('2025.12'), true);
    assert.equal(isValidCalVer('2030.06'), true);
  });

  it('accepts yyyy.mm-LTS format', () => {
    assert.equal(isValidCalVer('2024.06-LTS'), true);
    assert.equal(isValidCalVer('2025.09-LTS'), true);
  });

  it('rejects invalid formats', () => {
    assert.equal(isValidCalVer('v1.0'), false);
    assert.equal(isValidCalVer('2024'), false);
    assert.equal(isValidCalVer('2024.1'), false);
    assert.equal(isValidCalVer('24.01'), false);
    assert.equal(isValidCalVer('2024.06-lts'), false);
    assert.equal(isValidCalVer('latest'), false);
    assert.equal(isValidCalVer(''), false);
  });
});

describe('resolveLatestVersion', () => {
  it('returns undefined for unversioned docsets', () => {
    const config: DocsetConfig = {id: 'test', name: 'Test'};
    assert.equal(resolveLatestVersion(config), undefined);
  });

  it('returns undefined for empty versions array', () => {
    const config: DocsetConfig = {id: 'test', name: 'Test', versions: []};
    assert.equal(resolveLatestVersion(config), undefined);
  });

  it('returns explicit latestVersion when set', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      latestVersion: '2024.06',
      versions: [
        {id: '2025.01', label: 'Jan 2025', state: 'active'},
        {id: '2024.06', label: 'Jun 2024', state: 'lts'},
      ],
    };
    assert.equal(resolveLatestVersion(config), '2024.06');
  });

  it('resolves highest active version when no explicit latest', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [
        {id: '2024.01', label: 'Jan 2024', state: 'deprecated'},
        {id: '2024.06', label: 'Jun 2024', state: 'active'},
        {id: '2025.01', label: 'Jan 2025', state: 'active'},
      ],
    };
    assert.equal(resolveLatestVersion(config), '2025.01');
  });

  it('considers lts versions as candidates', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [
        {id: '2024.06-LTS', label: 'Jun 2024 LTS', state: 'lts'},
        {id: '2024.01', label: 'Jan 2024', state: 'deprecated'},
      ],
    };
    assert.equal(resolveLatestVersion(config), '2024.06-LTS');
  });

  it('ignores deprecated and eol versions', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [
        {id: '2025.01', label: 'Jan 2025', state: 'deprecated'},
        {id: '2024.06', label: 'Jun 2024', state: 'eol'},
        {id: '2024.01', label: 'Jan 2024', state: 'active'},
      ],
    };
    assert.equal(resolveLatestVersion(config), '2024.01');
  });
});

describe('validateDocsetConfig', () => {
  it('passes for a valid unversioned config', () => {
    const config: DocsetConfig = {id: 'test', name: 'Test'};
    assert.deepEqual(validateDocsetConfig(config), []);
  });

  it('errors on missing id', () => {
    const config = {id: '', name: 'Test'} as DocsetConfig;
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.field === 'id'));
  });

  it('errors on missing name', () => {
    const config = {id: 'test', name: ''} as DocsetConfig;
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.field === 'name'));
  });

  it('errors on invalid CalVer version id', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [{id: 'v1.0', label: 'V1', state: 'active'}],
    };
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.message.includes('not a valid CalVer')));
  });

  it('errors on duplicate version ids', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [
        {id: '2024.06', label: 'Jun 2024', state: 'active'},
        {id: '2024.06', label: 'Jun 2024 copy', state: 'lts'},
      ],
    };
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.message.includes('duplicate')));
  });

  it('errors on missing version label', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [{id: '2024.06', label: '', state: 'active'}],
    };
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.field.includes('label')));
  });

  it('errors on invalid lifecycle state', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      versions: [{id: '2024.06', label: 'Jun', state: 'beta' as any}],
    };
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.message.includes('not a valid lifecycle state')));
  });

  it('errors when latestVersion not in versions list', () => {
    const config: DocsetConfig = {
      id: 'test',
      name: 'Test',
      latestVersion: '2024.12',
      versions: [{id: '2024.06', label: 'Jun', state: 'active'}],
    };
    const errors = validateDocsetConfig(config);
    assert.ok(errors.some(e => e.field === 'latestVersion'));
  });

  it('passes for a fully valid versioned config', () => {
    const config: DocsetConfig = {
      id: 'my-api',
      name: 'My API',
      latestVersion: '2025.01',
      versions: [
        {id: '2025.01', label: 'Jan 2025', state: 'active'},
        {id: '2024.06-LTS', label: 'Jun 2024 LTS', state: 'lts'},
        {id: '2024.01', label: 'Jan 2024', state: 'deprecated'},
      ],
    };
    assert.deepEqual(validateDocsetConfig(config), []);
  });
});
