/**
 * Analytics event types — Epic 5, Story 5.6
 *
 * Frontend-safe re-declaration of the event schema defined in
 * scripts/validate-analytics-event.ts. Kept separate so the frontend build
 * never imports Node-only scripts.
 *
 * Keep in sync with SCHEMA_VERSION and event types in validate-analytics-event.ts.
 */

export const ANALYTICS_SCHEMA_VERSION = '1.0';

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
