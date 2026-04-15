---
sidebar_position: 4
slug: /how-to/configure-search
title: Configure search
description: "How to configure Algolia DocSearch for a DevDocify site, including application, crawler setup, and contextual search for multi-docset sites."
---

# Configure search

DevDocify uses Algolia DocSearch for full-text search across all docsets. Follow these steps to configure it.

## 1. Apply for DocSearch

Go to [docsearch.algolia.com](https://docsearch.algolia.com) and apply with your site's URL.

Algolia reviews applications for documentation sites manually. Approval typically takes a few days. You'll receive an email with your `appId`, `apiKey`, and `indexName` when approved.

If you need immediate access, create an Algolia account directly at [algolia.com](https://www.algolia.com) and set up a free application.

## 2. Run a test crawl

Once your Algolia application is provisioned, run a manual crawl from the Algolia Crawler dashboard to confirm the index populates correctly before wiring it into the site.

## 3. Add the credentials to docusaurus.config.ts

In `docusaurus.config.ts`, add an `algolia` block inside `themeConfig`:

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

Do not commit your write API key. The `apiKey` here is the public **search-only** key. It's safe to include in source.

## 4. Enable contextual search

For multi-docset sites, `contextualSearch: true` scopes search results to the current docset. Algolia uses the Docusaurus `docusaurus_tag` facet to filter results.

If your index doesn't include the tag facet, update your Algolia crawler configuration to include it. The Docusaurus documentation has an [example crawler config](https://docusaurus.io/docs/search#using-algolia-docsearch) you can adapt.

## 5. Test locally

Start the dev server:

```bash
docify dev
```

Use the search box to confirm results are scoped correctly to the active docset.

## Troubleshooting

- **No results**: Check that your Algolia index has been crawled and contains documents. Run a manual crawl from the Algolia dashboard.
- **Results from other docsets showing up**: Confirm `contextualSearch: true` is set and the crawler config includes `docusaurus_tag` in the `attributesForFaceting` list.
- **Search box not appearing**: Confirm your `themeConfig.algolia` block is inside the correct preset config and not duplicated.
