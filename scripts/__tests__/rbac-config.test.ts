import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  getRoleDefinition,
  hasCapability,
  validateRbacConfig,
  ROLE_DEFINITIONS,
  type RbacConfig,
  type RbacRole,
} from '../validate-rbac-config.js';

describe('ROLE_DEFINITIONS', () => {
  it('defines exactly four roles', () => {
    assert.equal(ROLE_DEFINITIONS.length, 4);
  });

  it('includes all expected roles', () => {
    const roles = ROLE_DEFINITIONS.map(d => d.role);
    assert.deepEqual(roles, ['admin', 'maintainer', 'contributor', 'viewer']);
  });

  it('admin has all capabilities', () => {
    const admin = ROLE_DEFINITIONS.find(d => d.role === 'admin')!;
    assert.equal(admin.capabilities.length, 8);
    assert.ok(admin.capabilities.includes('platform.configure'));
    assert.ok(admin.capabilities.includes('content.publish'));
  });

  it('viewer has only content.view', () => {
    const viewer = ROLE_DEFINITIONS.find(d => d.role === 'viewer')!;
    assert.deepEqual(viewer.capabilities, ['content.view']);
  });

  it('contributor cannot publish', () => {
    const contributor = ROLE_DEFINITIONS.find(d => d.role === 'contributor')!;
    assert.ok(!contributor.capabilities.includes('content.publish'));
  });
});

describe('getRoleDefinition', () => {
  it('returns definition for valid role', () => {
    const def = getRoleDefinition('admin');
    assert.ok(def);
    assert.equal(def.role, 'admin');
  });

  it('returns undefined for invalid role', () => {
    const def = getRoleDefinition('superadmin' as RbacRole);
    assert.equal(def, undefined);
  });
});

describe('hasCapability', () => {
  it('admin has platform.configure', () => {
    assert.equal(hasCapability('admin', 'platform.configure'), true);
  });

  it('maintainer does not have platform.configure', () => {
    assert.equal(hasCapability('maintainer', 'platform.configure'), false);
  });

  it('contributor has content.edit', () => {
    assert.equal(hasCapability('contributor', 'content.edit'), true);
  });

  it('contributor does not have content.publish', () => {
    assert.equal(hasCapability('contributor', 'content.publish'), false);
  });

  it('viewer has content.view', () => {
    assert.equal(hasCapability('viewer', 'content.view'), true);
  });

  it('viewer does not have content.edit', () => {
    assert.equal(hasCapability('viewer', 'content.edit'), false);
  });
});

describe('validateRbacConfig', () => {
  const validConfig: RbacConfig = {
    schemaVersion: '1.0',
    assignments: [
      {
        principal: 'matt',
        role: 'admin',
        assignedAt: '2026-01-01T00:00:00Z',
        assignedBy: 'system',
      },
    ],
  };

  it('passes for a valid config', () => {
    const errors = validateRbacConfig(validConfig);
    const errs = errors.filter(e => e.level === 'error');
    assert.equal(errs.length, 0);
  });

  it('errors on missing schemaVersion', () => {
    const config = {...validConfig, schemaVersion: ''};
    const errors = validateRbacConfig(config);
    assert.ok(errors.some(e => e.field === 'schemaVersion'));
  });

  it('errors when no admin assignment exists', () => {
    const config: RbacConfig = {
      schemaVersion: '1.0',
      assignments: [
        {
          principal: 'reader',
          role: 'viewer',
          assignedAt: '2026-01-01T00:00:00Z',
          assignedBy: 'system',
        },
      ],
    };
    const errors = validateRbacConfig(config);
    assert.ok(errors.some(e => e.message.includes('admin')));
  });

  it('errors on invalid role', () => {
    const config: RbacConfig = {
      schemaVersion: '1.0',
      assignments: [
        {
          principal: 'matt',
          role: 'admin',
          assignedAt: '2026-01-01T00:00:00Z',
          assignedBy: 'system',
        },
        {
          principal: 'hacker',
          role: 'superuser' as any,
          assignedAt: '2026-01-01T00:00:00Z',
          assignedBy: 'system',
        },
      ],
    };
    const errors = validateRbacConfig(config);
    assert.ok(errors.some(e => e.message.includes('not a valid role')));
  });

  it('supports team: principal prefix', () => {
    const config: RbacConfig = {
      schemaVersion: '1.0',
      assignments: [
        {
          principal: 'matt',
          role: 'admin',
          assignedAt: '2026-01-01T00:00:00Z',
          assignedBy: 'system',
        },
        {
          principal: 'team:docs-team',
          role: 'contributor',
          assignedAt: '2026-01-01T00:00:00Z',
          assignedBy: 'matt',
        },
      ],
    };
    const errors = validateRbacConfig(config);
    const errs = errors.filter(e => e.level === 'error');
    assert.equal(errs.length, 0);
  });
});
