import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  DOCSEARCH_INDEX_SETTINGS,
  extractExcerpt,
  extractHeadings,
  toDocSearchRecords,
} from '../search-records.js';
import type {SearchEntry} from '../build-search-index.js';

const SITE = 'https://www.devdocify.com';

describe('extractHeadings', () => {
  it('returns h2 and h3 with Docusaurus anchor ids', () => {
    const md = '---\ntitle: T\n---\n# Title\n## Get `started`\n### Step one\n#### Deep\n';
    assert.deepEqual(extractHeadings(md), [
      {level: 2, text: 'Get started', id: 'get-started'},
      {level: 3, text: 'Step one', id: 'step-one'},
    ]);
  });

  it('ignores # lines inside code fences', () => {
    const md = '## Install\n```bash\n# install deps\nnpm ci\n```\n## Run\n';
    assert.deepEqual(extractHeadings(md).map(h => h.text), ['Install', 'Run']);
  });

  it('keeps escaped and code-span angle brackets as text', () => {
    const md = '## docify new \\<directory\\>\n## Run `serve <port>`\n';
    assert.deepEqual(extractHeadings(md), [
      {level: 2, text: 'docify new <directory>', id: 'docify-new-directory'},
      {level: 2, text: 'Run serve <port>', id: 'run-serve-port'},
    ]);
  });

  it('honors custom ids and suffixes duplicates like Docusaurus', () => {
    const md = '## Errors {#errs}\n## Example\n### Example\n';
    assert.deepEqual(extractHeadings(md).map(h => h.id), ['errs', 'example', 'example-1']);
  });
});

describe('extractExcerpt', () => {
  it('drops JSX, imports, code and admonition fences', () => {
    const md = [
      '---', 'title: T', '---',
      "import Tabs from '@theme/Tabs';",
      '<div className="hero"><p>Rationale</p></div>',
      ':::note', 'Plain **text** with a [link](/x).', ':::',
      '```js', 'secret()', '```',
    ].join('\n');
    assert.equal(extractExcerpt(md, 200), 'Rationale Plain text with a link.');
  });

  it('truncates with an ellipsis', () => {
    assert.equal(extractExcerpt('abcdef', 3), 'abc…');
  });
});

describe('toDocSearchRecords', () => {
  const entries: SearchEntry[] = [
    {
      type: 'doc', docset: 'tfl', version: 'unversioned', slug: '/tfl/journey',
      title: 'Journey planner', excerpt: 'Plan a trip.', relativePath: 'tfl/journey.md',
      headings: [
        {level: 2, text: 'Request', id: 'request'},
        {level: 3, text: 'Parameters', id: 'parameters'},
      ],
    },
    {
      type: 'api-op', docset: 'petstore', version: 'unversioned', slug: '/petstore/api-playground',
      operationId: 'getPetById', method: 'GET', path: '/pet/{petId}', summary: 'Find pet by ID', tags: ['pet'],
    },
  ];
  const records = toDocSearchRecords(entries, SITE + '/');

  it('emits a page record, one per heading, and one per API operation', () => {
    assert.deepEqual(records.map(r => r.type), ['lvl1', 'lvl2', 'lvl3', 'lvl2']);
  });

  it('builds absolute urls with anchors and the docset name as lvl0', () => {
    const h3 = records[2];
    assert.equal(h3.url, 'https://www.devdocify.com/tfl/journey#parameters');
    assert.equal(h3.url_without_anchor, 'https://www.devdocify.com/tfl/journey');
    assert.deepEqual(
      [h3.hierarchy.lvl0, h3.hierarchy.lvl1, h3.hierarchy.lvl2, h3.hierarchy.lvl3],
      ['Transport for London', 'Journey planner', 'Request', 'Parameters'],
    );
  });

  it('tags every record for contextualSearch', () => {
    for (const r of records) assert.equal(r.language, 'en');
    assert.equal(records[0].docusaurus_tag, 'docs-tfl-current');
    assert.equal(records[3].docusaurus_tag, 'docs-petstore-current');
  });

  it('gives every record a unique objectID', () => {
    assert.equal(new Set(records.map(r => r.objectID)).size, records.length);
  });

  it('declares the facets contextualSearch filters on', () => {
    const facets = DOCSEARCH_INDEX_SETTINGS.attributesForFaceting.join(' ');
    assert.match(facets, /language/);
    assert.match(facets, /docusaurus_tag/);
  });
});
