/**
 * Search record helpers: shared by build-search-index.ts and push-search-index.ts.
 *
 * build-search-index.ts uses the markdown helpers to extract headings and a
 * plain-text excerpt from each doc page. push-search-index.ts turns the
 * resulting entries into DocSearch v3 records, the shape the Docusaurus
 * Algolia theme (@docusaurus/theme-search-algolia) expects:
 *
 *   - hierarchy.lvl0..lvl6, url, anchor, content, type: rendered by the modal
 *   - language, docusaurus_tag: matched by contextualSearch facet filters
 *     (language:en AND one of docusaurus_tag:docs-<pluginId>-<version>)
 *
 * Pure functions only: importing this module has no side effects, so it can
 * be unit tested.
 */

import {createSlugger} from '@docusaurus/utils';
import {DOCSET_REGISTRY} from './docset.config.js';
import type {SearchEntry, DocSearchEntry, ApiOpSearchEntry} from './build-search-index.js';

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

export type DocHeading = {
  /** 2 or 3. Only h2 and h3 are indexed; h1 is the page title. */
  level: 2 | 3;
  text: string;
  /** Anchor id, matching the id Docusaurus renders on the heading. */
  id: string;
};

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function stripCodeFences(body: string): string {
  return body.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, '');
}

/**
 * Renders inline markdown to plain text. Code spans and backslash escapes
 * (`\<name\>`) are literal text, so they are kept rather than read as HTML.
 */
function stripInlineMarkdown(text: string): string {
  return text
    .split(/(`[^`]*`)/)
    .map((part, i) => {
      if (i % 2 === 1) return part.slice(1, -1);
      return part
        .replace(/\\([^\w\s])/g, (_, c: string) => `\u0000${c.charCodeAt(0)}\u0001`)
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images → text
        .replace(/<[^>]+>/g, '')                   // inline HTML/JSX
        .replace(/[*_~]/g, '')                     // inline formatting
        .replace(/\u0000(\d+)\u0001/g, (_, code: string) => String.fromCharCode(Number(code)));
    })
    .join('')
    .trim();
}

/**
 * Extracts h2 and h3 headings with the anchor ids Docusaurus generates.
 * Every heading level runs through the slugger, in document order, so that
 * duplicate-heading suffixes (-1, -2) match the rendered page.
 */
export function extractHeadings(content: string): DocHeading[] {
  const body = stripCodeFences(stripFrontmatter(content));
  const slugger = createSlugger();
  const headings: DocHeading[] = [];

  for (const match of body.matchAll(/^(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    const level = match[1].length;
    const customId = match[2].match(/\s*\{#([^}]+)\}\s*$/);
    const text = stripInlineMarkdown(match[2].replace(/\s*\{#[^}]+\}\s*$/, ''));
    const id = customId ? customId[1] : slugger.slug(text);
    if (level === 2 || level === 3) headings.push({level, text, id});
  }
  return headings;
}

/** Plain-text excerpt: no frontmatter, code, JSX, imports or admonition fences. */
export function extractExcerpt(content: string, maxLength: number): string {
  const body = stripCodeFences(stripFrontmatter(content))
    .replace(/^(import|export)\s.*$/gm, '')  // MDX imports/exports
    .replace(/^#{1,6}\s+.+$/gm, '')          // headings
    .replace(/<!--[\s\S]*?-->/g, '')         // HTML comments (includes directives)
    .replace(/^:::.*$/gm, '')                // admonition fences
    .replace(/^\s*\|.*\|\s*$/gm, '');        // table rows
  const text = stripInlineMarkdown(body).replace(/\s+/g, ' ').trim();

  return text.slice(0, maxLength) + (text.length > maxLength ? '…' : '');
}

// ---------------------------------------------------------------------------
// DocSearch records
// ---------------------------------------------------------------------------

type Level = 'lvl1' | 'lvl2' | 'lvl3';

export type DocSearchRecord = {
  objectID: string;
  type: Level;
  url: string;
  url_without_anchor: string;
  anchor: string | null;
  content: string | null;
  hierarchy: Record<'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6', string | null>;
  language: string;
  docusaurus_tag: string;
  docset: string;
  weight: {pageRank: number; level: number; position: number};
};

/** Same weights the DocSearch crawler assigns, so ranking behaves the same. */
const LEVEL_WEIGHT: Record<Level, number> = {lvl1: 90, lvl2: 80, lvl3: 70};

export const DOCSEARCH_INDEX_SETTINGS = {
  searchableAttributes: [
    'unordered(hierarchy.lvl0)',
    'unordered(hierarchy.lvl1)',
    'unordered(hierarchy.lvl2)',
    'unordered(hierarchy.lvl3)',
    'content',
  ],
  attributesForFaceting: [
    'type',
    'filterOnly(language)',
    'filterOnly(docusaurus_tag)',
    'filterOnly(docset)',
  ],
  attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url', 'url_without_anchor', 'type'],
  attributesToHighlight: ['hierarchy', 'content'],
  attributesToSnippet: ['content:10'],
  customRanking: ['desc(weight.pageRank)', 'desc(weight.level)', 'asc(weight.position)'],
  // A query word that matches nothing ("journey planner") would otherwise
  // return zero hits; retry with words optional, as DocSearch indices do.
  removeWordsIfNoResults: 'allOptional' as const,
  // API operations share their playground URL, so de-duplicating by URL would
  // hide all but one of them.
  distinct: false,
};

function docsetName(docset: string): string {
  return DOCSET_REGISTRY.find(d => d.id === docset)?.name ?? docset;
}

/** Matches the tag @docusaurus/plugin-content-docs emits: docs-<pluginId>-<version>. */
function docusaurusTag(docset: string, version: string): string {
  return `docs-${docset}-${version === 'unversioned' ? 'current' : version}`;
}

function hierarchy(lvl0: string, lvl1: string, lvl2: string | null = null, lvl3: string | null = null) {
  return {lvl0, lvl1, lvl2, lvl3, lvl4: null, lvl5: null, lvl6: null};
}

function docRecords(entry: DocSearchEntry, siteUrl: string): DocSearchRecord[] {
  const pageUrl = siteUrl + entry.slug;
  const base = {
    url_without_anchor: pageUrl,
    language: 'en',
    docusaurus_tag: docusaurusTag(entry.docset, entry.version),
    docset: entry.docset,
  };
  const lvl0 = docsetName(entry.docset);

  const records: DocSearchRecord[] = [{
    ...base,
    objectID: `doc::${entry.docset}::${entry.slug}`,
    type: 'lvl1',
    url: pageUrl,
    anchor: null,
    content: entry.excerpt || null,
    hierarchy: hierarchy(lvl0, entry.title),
    weight: {pageRank: 0, level: LEVEL_WEIGHT.lvl1, position: 0},
  }];

  let currentH2: string | null = null;
  entry.headings.forEach((heading, i) => {
    if (heading.level === 2) currentH2 = heading.text;
    const type: Level = heading.level === 2 ? 'lvl2' : 'lvl3';
    records.push({
      ...base,
      objectID: `doc::${entry.docset}::${entry.slug}#${heading.id}`,
      type,
      url: `${pageUrl}#${heading.id}`,
      anchor: heading.id,
      content: null,
      hierarchy: heading.level === 2
        ? hierarchy(lvl0, entry.title, heading.text)
        : hierarchy(lvl0, entry.title, currentH2, heading.text),
      weight: {pageRank: 0, level: LEVEL_WEIGHT[type], position: i + 1},
    });
  });

  return records;
}

function apiOpRecord(entry: ApiOpSearchEntry, siteUrl: string, position: number): DocSearchRecord {
  const url = siteUrl + entry.slug;
  return {
    objectID: `api-op::${entry.docset}::${entry.operationId}`,
    type: 'lvl2',
    url,
    url_without_anchor: url,
    anchor: null,
    content: entry.summary || null,
    hierarchy: hierarchy(docsetName(entry.docset), 'API reference', `${entry.method} ${entry.path}`),
    language: 'en',
    docusaurus_tag: docusaurusTag(entry.docset, entry.version),
    docset: entry.docset,
    weight: {pageRank: 0, level: LEVEL_WEIGHT.lvl2 - 10, position},
  };
}

export function toDocSearchRecords(entries: SearchEntry[], siteUrl: string): DocSearchRecord[] {
  const base = siteUrl.replace(/\/$/, '');
  return entries.flatMap((entry, i) =>
    entry.type === 'doc' ? docRecords(entry, base) : [apiOpRecord(entry, base, i)],
  );
}
