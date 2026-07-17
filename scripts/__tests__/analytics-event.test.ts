import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAnalyticsEvent,
  createExportBatch,
  SCHEMA_VERSION,
  type AnalyticsEvent,
} from '../validate-analytics-event.js';

function validEvent(overrides?: Partial<AnalyticsEvent>): AnalyticsEvent {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: 'page.view',
    timestamp: '2026-04-03T09:00:00Z',
    actor: {type: 'user', sessionId: 'abc-123'},
    payload: {docset: 'tfl', version: 'latest', slug: '/tfl/getting-started'},
    ...overrides,
  };
}

describe('validateAnalyticsEvent', () => {
  it('passes for a valid page.view event', () => {
    const errors = validateAnalyticsEvent(validEvent());
    const errs = errors.filter(e => e.level === 'error');
    assert.equal(errs.length, 0);
  });

  it('errors on missing schemaVersion', () => {
    const event = validEvent({schemaVersion: ''});
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'schemaVersion'));
  });

  it('warns on mismatched schemaVersion', () => {
    const event = validEvent({schemaVersion: '0.9'});
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.level === 'warn' && e.field === 'schemaVersion'));
  });

  it('errors on invalid event type', () => {
    const event = validEvent({type: 'user.logout' as any});
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'type'));
  });

  it('errors on missing timestamp', () => {
    const event = validEvent({timestamp: ''});
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'timestamp'));
  });

  it('errors on invalid timestamp format', () => {
    const event = validEvent({timestamp: 'yesterday'});
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'timestamp'));
  });

  it('errors on missing actor', () => {
    const event = validEvent();
    (event as any).actor = undefined;
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'actor'));
  });

  it('errors on invalid actor type', () => {
    const event = validEvent();
    event.actor.type = 'admin' as any;
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'actor.type'));
  });

  it('errors on missing actor sessionId', () => {
    const event = validEvent();
    event.actor.sessionId = '';
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'actor.sessionId'));
  });

  it('errors on missing payload', () => {
    const event = validEvent();
    (event as any).payload = undefined;
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field === 'payload'));
  });

  it('errors on missing required payload fields for page.view', () => {
    const event = validEvent({payload: {docset: 'tfl'} as any});
    const errors = validateAnalyticsEvent(event);
    assert.ok(errors.some(e => e.field.startsWith('payload.')));
  });

  it('validates search.query event payload', () => {
    const event = validEvent({
      type: 'search.query',
      payload: {query: 'how to authenticate', resultCount: 5} as any,
    });
    const errors = validateAnalyticsEvent(event);
    const errs = errors.filter(e => e.level === 'error');
    assert.equal(errs.length, 0);
  });
});

describe('createExportBatch', () => {
  it('wraps events with metadata', () => {
    const events = [validEvent(), validEvent({type: 'search.query', payload: {query: 'test', resultCount: 0} as any})];
    const batch = createExportBatch(events);
    assert.equal(batch.schemaVersion, SCHEMA_VERSION);
    assert.equal(batch.eventCount, 2);
    assert.equal(batch.events.length, 2);
    assert.ok(batch.exportedAt);
  });

  it('handles empty events array', () => {
    const batch = createExportBatch([]);
    assert.equal(batch.eventCount, 0);
    assert.deepEqual(batch.events, []);
  });
});
