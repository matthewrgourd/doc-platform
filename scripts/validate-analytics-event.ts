/**
 * Analytics event schema and validator — Epic 5, Story 5.3
 *
 * Defines the platform analytics event model. Events are emitted by the
 * portal runtime and can be forwarded to any analytics backend
 * (Plausible, PostHog, custom pipeline, etc.).
 *
 * The schema is versioned. Consumers should check `schemaVersion` before
 * processing events to detect breaking changes.
 *
 * Event types:
 *   page.view          — user viewed a doc page
 *   search.query       — user submitted a search query
 *   search.result.click — user clicked a search result
 *   playground.request — user triggered a Try-it request
 *   playground.error   — Try-it request returned a non-2xx response
 *   nav.version.switch — user switched doc version
 *   link.broken        — a broken internal link was detected at render time
 *
 * Usage:
 *   npx tsx scripts/validate-analytics-event.ts <event.json>
 *   npx tsx scripts/validate-analytics-event.ts --schema   (print schema)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const SCHEMA_VERSION = '1.0';

export type AnalyticsEventType =
  | 'page.view'
  | 'search.query'
  | 'search.result.click'
  | 'playground.request'
  | 'playground.error'
  | 'nav.version.switch'
  | 'link.broken';

export type ActorType = 'user' | 'bot' | 'anonymous';

export type AnalyticsActor = {
  type: ActorType;
  /** Opaque session ID — must not be a PII identifier. */
  sessionId: string;
  /** RBAC role at time of event, if authenticated. */
  role?: string;
};

// ---------------------------------------------------------------------------
// Per-event payload types
// ---------------------------------------------------------------------------

export type PageViewPayload = {
  docset: string;
  version: string;
  slug: string;
  referrer?: string;
};

export type SearchQueryPayload = {
  query: string;
  docset?: string;
  version?: string;
  resultCount: number;
};

export type SearchResultClickPayload = {
  query: string;
  resultSlug: string;
  resultRank: number;
};

export type PlaygroundRequestPayload = {
  docset: string;
  operationId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
};

export type PlaygroundErrorPayload = PlaygroundRequestPayload & {
  errorMessage?: string;
};

export type VersionSwitchPayload = {
  docset: string;
  fromVersion: string;
  toVersion: string;
  slug: string;
};

export type BrokenLinkPayload = {
  sourcePage: string;
  brokenHref: string;
  linkText?: string;
};

export type AnalyticsEventPayload =
  | PageViewPayload
  | SearchQueryPayload
  | SearchResultClickPayload
  | PlaygroundRequestPayload
  | PlaygroundErrorPayload
  | VersionSwitchPayload
  | BrokenLinkPayload;

export type AnalyticsEvent = {
  /** Schema version — increment on breaking payload changes. */
  schemaVersion: string;
  /** Event type identifier. */
  type: AnalyticsEventType;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
  /** Actor who triggered the event. */
  actor: AnalyticsActor;
  /** Event-specific payload. */
  payload: AnalyticsEventPayload;
};

// ---------------------------------------------------------------------------
// Required payload fields per event type
// ---------------------------------------------------------------------------

const REQUIRED_PAYLOAD_FIELDS: Record<AnalyticsEventType, string[]> = {
  'page.view': ['docset', 'version', 'slug'],
  'search.query': ['query', 'resultCount'],
  'search.result.click': ['query', 'resultSlug', 'resultRank'],
  'playground.request': ['docset', 'operationId', 'method', 'path', 'statusCode', 'durationMs'],
  'playground.error': ['docset', 'operationId', 'method', 'path', 'statusCode', 'durationMs'],
  'nav.version.switch': ['docset', 'fromVersion', 'toVersion', 'slug'],
  'link.broken': ['sourcePage', 'brokenHref'],
};

const VALID_EVENT_TYPES = Object.keys(REQUIRED_PAYLOAD_FIELDS) as AnalyticsEventType[];
const VALID_ACTOR_TYPES: ActorType[] = ['user', 'bot', 'anonymous'];
const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ValidationError = {level: 'error' | 'warn'; field: string; message: string};

export function validateAnalyticsEvent(event: AnalyticsEvent): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!event.schemaVersion) {
    errors.push({level: 'error', field: 'schemaVersion', message: 'required'});
  } else if (event.schemaVersion !== SCHEMA_VERSION) {
    errors.push({level: 'warn', field: 'schemaVersion', message: `event uses schema ${event.schemaVersion}, current is ${SCHEMA_VERSION}`});
  }

  if (!VALID_EVENT_TYPES.includes(event.type)) {
    errors.push({level: 'error', field: 'type', message: `"${event.type}" is not a valid event type — must be one of: ${VALID_EVENT_TYPES.join(', ')}`});
  }

  if (!event.timestamp || !ISO_8601_RE.test(event.timestamp)) {
    errors.push({level: 'error', field: 'timestamp', message: 'required — ISO 8601 UTC (e.g. 2026-04-03T09:00:00Z)'});
  }

  if (!event.actor) {
    errors.push({level: 'error', field: 'actor', message: 'required'});
  } else {
    if (!VALID_ACTOR_TYPES.includes(event.actor.type)) {
      errors.push({level: 'error', field: 'actor.type', message: `must be one of: ${VALID_ACTOR_TYPES.join(', ')}`});
    }
    if (!event.actor.sessionId) {
      errors.push({level: 'error', field: 'actor.sessionId', message: 'required — use an opaque session ID, not PII'});
    }
  }

  if (!event.payload) {
    errors.push({level: 'error', field: 'payload', message: 'required'});
  } else if (VALID_EVENT_TYPES.includes(event.type)) {
    const required = REQUIRED_PAYLOAD_FIELDS[event.type];
    for (const field of required) {
      if (!(field in event.payload)) {
        errors.push({level: 'error', field: `payload.${field}`, message: `required for event type "${event.type}"`});
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Export format (dashboard-ready batch)
// ---------------------------------------------------------------------------

export type AnalyticsExportBatch = {
  exportedAt: string;
  schemaVersion: string;
  eventCount: number;
  events: AnalyticsEvent[];
};

export function createExportBatch(events: AnalyticsEvent[]): AnalyticsExportBatch {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    eventCount: events.length,
    events,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {eventFile: string | null; printSchema: boolean} {
  const args = process.argv.slice(2);
  const printSchema = args.includes('--schema');
  const eventFile = args.find(a => !a.startsWith('--')) ?? null;
  return {eventFile, printSchema};
}

const {eventFile, printSchema} = parseArgs();

if (printSchema) {
  const schema = {
    schemaVersion: SCHEMA_VERSION,
    eventTypes: VALID_EVENT_TYPES,
    actorTypes: VALID_ACTOR_TYPES,
    requiredPayloadFields: REQUIRED_PAYLOAD_FIELDS,
    exportFormat: 'AnalyticsExportBatch',
  };
  console.log(JSON.stringify(schema, null, 2));
  process.exit(0);
}

if (!eventFile) {
  console.error('[analytics-event] ERROR: provide an event JSON file or use --schema');
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), eventFile);
if (!fs.existsSync(resolvedPath)) {
  console.error(`[analytics-event] ERROR: file not found: ${resolvedPath}`);
  process.exit(1);
}

let event: AnalyticsEvent;
try {
  event = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
} catch (err) {
  console.error(`[analytics-event] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const errors = validateAnalyticsEvent(event);
let hasErrors = false;

for (const e of errors) {
  const prefix = e.level === 'error' ? 'ERROR' : 'WARN';
  console[e.level === 'error' ? 'error' : 'warn'](`[analytics-event] ${prefix}: ${e.field} — ${e.message}`);
  if (e.level === 'error') hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log(`[analytics-event] event valid — type: ${event.type}`);
}
