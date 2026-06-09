/**
 * Analytics emission client — Epic 5, Story 5.6
 *
 * Wraps @vercel/analytics track() with the structured event schema.
 * Safe to call in SSR — no-ops when window/sessionStorage are unavailable.
 */

import {track} from '@vercel/analytics';
import {
  ANALYTICS_SCHEMA_VERSION,
  type AnalyticsEventType,
  type AnalyticsActor,
  type AnalyticsEventPayload,
} from './types';

// ---------------------------------------------------------------------------
// Session ID — opaque, non-PII, persisted for the browser session
// ---------------------------------------------------------------------------

function getSessionId(): string {
  if (typeof sessionStorage === 'undefined') return 'ssr';
  const key = '__dd_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

/**
 * Emit a structured analytics event.
 *
 * @param type    - Event type identifier (e.g. 'page.view').
 * @param payload - Event-specific payload. Must match the schema for `type`.
 * @param actor   - Optional actor override. Defaults to anonymous + session ID.
 */
export function emitEvent(
  type: AnalyticsEventType,
  payload: AnalyticsEventPayload,
  actor?: Partial<AnalyticsActor>,
): void {
  // No-op during SSR (static build) or in environments without window
  if (typeof window === 'undefined') return;

  const resolvedActor: AnalyticsActor = {
    type: actor?.type ?? 'anonymous',
    sessionId: actor?.sessionId ?? getSessionId(),
    ...(actor?.role ? {role: actor.role} : {}),
  };

  // @vercel/analytics track() accepts a flat Record<string, string | number | boolean>
  // We flatten the envelope fields alongside the payload for Vercel's dashboard.
  const properties: Record<string, string | number | boolean> = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    actorType: resolvedActor.type,
    sessionId: resolvedActor.sessionId,
    ...(resolvedActor.role ? {role: resolvedActor.role} : {}),
    ...(payload as Record<string, unknown> as Record<string, string | number | boolean>),
  };

  track(type, properties);
}
