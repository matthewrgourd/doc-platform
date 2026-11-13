---
sidebar_position: 4
slug: /how-to/configure-search
title: Configure search
description: "How to configure Algolia search for a DevDocify site, including contextual search, structured index generation, and deploy-time index pushes."
---

# Configure search

DevDocify uses Algolia for contextual search across docsets. The site config gives the browser a search-only API key. Separately, CI can push a structured index that includes documentation pages and API operations.

## Prerequisites

- An Algolia application and index.
- Access to `docusaurus.config.ts`.
- A deployed docs URL for production search.
- An `ALGOLIA_ADMIN_API_KEY` CI secret if you want deploy-time index pushes.

## 1. Configure browser search

In `docusaurus.config.ts`, confirm that `themeConfig.algolia` contains these values:

```ts
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indexName: 'YOUR_INDEX_NAME',
  contextualSearch: true,
},
```

Use a search-only API key for `apiKey`. Do not expose an admin key in source code or browser bundles.

## 2. Build the structured index

Generate the local search index:

```bash
npm run build-search-index
```

The command writes `build/search-index.json`. The index contains:

| Type | Source |
|---|---|
| `doc` | Markdown and MDX pages from each docset |
| `api-op` | OpenAPI operations from `static/openapi/*.json` |

The `npm run build` command also runs this step through `postbuild`.

## 3. Test the Algolia payload locally

Build the site and run a dry push:

```bash
npm run build
npm run push-search-index -- --dry-run
```

The dry run prints record counts by docset and a sample Algolia record. It doesn't call the Algolia API.

The push script converts the index into [DocSearch](https://docsearch.algolia.com/) records, the format the Docusaurus search modal reads:

| Record | Created for | Links to |
|---|---|---|
| `lvl1` | Each page, with its excerpt as content | The page |
| `lvl2`, `lvl3` | Each `##` and `###` heading | The heading anchor |
| `lvl2` | Each API operation, with its summary as content | The docset's API playground |

Every record carries `language` and `docusaurus_tag` values. Contextual search filters on these, so a record without them never appears in results.

## 4. Add CI credentials

Add `ALGOLIA_ADMIN_API_KEY` as a GitHub Actions secret. The CI workflow uses it only on pushes to `main`.

Optional environment variables:

| Variable | Purpose |
|---|---|
| `ALGOLIA_APP_ID` | Overrides the app ID from the script default. |
| `ALGOLIA_INDEX_NAME` | Overrides the default `devdocify` index name. |

If `ALGOLIA_ADMIN_API_KEY` is absent, the push job exits successfully without updating Algolia. Forks and local preview branches don't have production secrets, so this behavior stops them from failing.

## 5. Verify contextual results

After deployment, test search from at least two docsets:

1. Open `/docs` and search for a DevDocify topic.
2. Open `/tfl/getting-started` and search for a TfL topic.
3. Confirm that results appear under the docset name.
4. Select a heading result. Confirm that the page opens at that heading.

Contextual search limits results to the current locale and to the active version of each docset. It doesn't limit results to the docset you're viewing, so results from every docset can appear.

## Troubleshooting

- No browser search box: confirm `themeConfig.algolia` is present in `docusaurus.config.ts`.
- No results after deploy: confirm `ALGOLIA_ADMIN_API_KEY` exists and the push job ran on `main`. If records exist in the Algolia dashboard but search still returns nothing, check that they have `language` and `docusaurus_tag` values.
- Results open the wrong section: compare the record's `anchor` with the heading `id` on the built page.
- API operations are missing: confirm the relevant OpenAPI file exists in `static/openapi/` and rerun `npm run build-search-index`.
