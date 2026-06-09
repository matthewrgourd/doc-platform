/**
 * Analytics React hooks — Epic 5, Story 5.6
 *
 * usePageViewAnalytics() — emits a page.view event on every route change.
 * Call once at the app root (Root.tsx).
 */

import {useEffect, useRef} from 'react';
import {useLocation} from '@docusaurus/router';
import {emitEvent} from './client';
import type {PageViewPayload} from './types';

// ---------------------------------------------------------------------------
// Route parsing
// ---------------------------------------------------------------------------

/**
 * Parses the Docusaurus pathname into docset, version, and slug.
 *
 * Route shapes:
 *   /docs/...        → docset: devdocify, version: latest
 *   /tfl/...         → docset: tfl, version: latest
 *   /petstore/...    → docset: petstore, version: latest
 *   /                → docset: root, version: none
 */
function parseRoute(pathname: string): Omit<PageViewPayload, 'referrer'> {
  const clean = pathname.replace(/\/$/, '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) {
    return {docset: 'root', version: 'none', slug: '/'};
  }

  const [first, ...rest] = parts;

  // CalVer version segment: yyyy.mm or yyyy.mm-LTS
  const calVerRe = /^\d{4}\.\d{2}(-LTS)?$/;
  const isVersion = (s: string) => calVerRe.test(s) || s === 'latest';

  const knownDocsets = ['docs', 'tfl', 'petstore'];

  if (knownDocsets.includes(first)) {
    const docset = first === 'docs' ? 'devdocify' : first;
    if (rest.length > 0 && isVersion(rest[0])) {
      const [version, ...slugParts] = rest;
      return {docset, version, slug: '/' + [first, version, ...slugParts].join('/')};
    }
    return {docset, version: 'latest', slug: clean};
  }

  return {docset: 'root', version: 'none', slug: clean};
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Emits a page.view analytics event on every route change.
 * Deduplicated — will not double-emit for the same pathname within a render cycle.
 */
export function usePageViewAnalytics(): void {
  const location = useLocation();
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === lastEmitted.current) return;
    lastEmitted.current = pathname;

    const parsed = parseRoute(pathname);
    emitEvent('page.view', {
      ...parsed,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    });
  }, [location.pathname]);
}
