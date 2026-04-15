---
sidebar_position: 4
slug: /how-to/configure-search
title: Configure search
description: "How to configure Algolia DocSearch for a DevDocify site, including application, crawler setup, and contextual search for multi-docset sites."
---

# Configure search

DevDocify uses Algolia DocSearch for full-text search across docsets.

## Prerequisites

- A deployed docs URL that Algolia can crawl
- Access to your `docusaurus.config.ts`
- Access to Algolia DocSearch or Algolia dashboard

## 1. Apply for DocSearch

Go to [docsearch.algolia.com](https://docsearch.algolia.com) and apply with your site URL.

After approval, Algolia sends your `appId`, `apiKey`, and `indexName`.

If you need immediate access, create an Algolia app directly at [algolia.com](https://www.algolia.com).

## 2. Run a test crawl

Run a manual crawl from the Algolia Crawler dashboard and verify records are indexed before wiring search into the site.

## 3. Add credentials in `docusaurus.config.ts`

Add an `algolia` block inside `themeConfig`:

```ts
themeConfig: {
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
    contextualSearch: true,
  },
},
```

Use a public search-only key here. Do not commit write/admin API keys.

## 4. Enable contextual search

For multi-docset sites, `contextualSearch: true` scopes results to the current docset.

If your index doesn't include the Docusaurus facet tags, update your crawler config to include `docusaurus_tag` in `attributesForFaceting`.

## 5. Test locally

```bash
docify dev
```

Use the search box in at least two docsets to confirm scoped results.

## Troubleshooting

- No results: verify crawl success and index contents in Algolia.
- Cross-docset results: confirm `contextualSearch: true` and `docusaurus_tag` faceting.
- Search box missing: verify `themeConfig.algolia` is present once in the active config.
