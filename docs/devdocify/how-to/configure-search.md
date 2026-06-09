---
sidebar_position: 4
slug: /how-to/configure-search
title: Configure search
description: "How to configure Algolia search for a DevDocify site, including contextual search, structured index generation, and deploy-time index pushes."
---

# Configure search

DevDocify uses Algolia for contextual search across docsets. The site config exposes a search-only API key to the browser, while CI can push a structured index that includes both documentation pages and API operations.

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

The dry run prints record counts by docset and a sample Algolia record. It does not call the Algolia API.

## 4. Add CI credentials

Add `ALGOLIA_ADMIN_API_KEY` as a GitHub Actions secret. The CI workflow uses it only on pushes to `main`.

Optional environment variables:

| Variable | Purpose |
|---|---|
| `ALGOLIA_APP_ID` | Overrides the app ID from the script default. |
| `ALGOLIA_INDEX_NAME` | Overrides the default `devdocify` index name. |

If `ALGOLIA_ADMIN_API_KEY` is absent, the push job exits successfully without updating Algolia. This keeps forks and local preview branches from failing because they do not have production secrets.

## 5. Verify contextual results

After deployment, test search from at least two docsets:

1. Open `/docs` and search for a DevDocify topic.
2. Open `/tfl/getting-started` and search for a TfL topic.
3. Confirm that results stay scoped to the current docset when contextual search is active.

## Troubleshooting

- No browser search box: confirm `themeConfig.algolia` is present in `docusaurus.config.ts`.
- No results after deploy: confirm `ALGOLIA_ADMIN_API_KEY` exists and the push job ran on `main`.
- Cross-docset results appear: confirm `contextualSearch: true` and `filterOnly(docset)` faceting in `scripts/push-search-index.ts`.
- API operations are missing: confirm the relevant OpenAPI file exists in `static/openapi/` and rerun `npm run build-search-index`.
