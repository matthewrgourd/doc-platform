---
sidebar_position: 2
slug: /how-to/add-playground
title: How to add an API playground
description: "Step-by-step instructions for adding an interactive API playground to a DevDocify docset."
---

# How to add an API playground

Follow these steps to add an interactive API playground to a DevDocify docset.

## Before you start

You need:

- An OpenAPI description file (`.json` or `.yaml`)
- An existing docset directory under `docs/`
- Write access to `docusaurus.config.ts`

## 1. Add your OpenAPI spec

Place your OpenAPI file in the `openapi/` directory at the project root:

```text
openapi/my-api.json
```

Keep the spec scoped to the operations you want to expose in the playground.

## 2. Install the OpenAPI plugin

Install the plugin if it isn't already present:

```bash
npm install docusaurus-plugin-openapi-docs @docusaurus/plugin-content-docs
```

## 3. Configure the plugin in `docusaurus.config.ts`

Add a plugin entry:

```ts
[
  'docusaurus-plugin-openapi-docs',
  {
    id: 'my-api',
    docsPluginId: 'my-api-docs',
    config: {
      myApi: {
        specPath: 'openapi/my-api.json',
        outputDir: 'docs/my-product/api-reference',
        sidebarOptions: {
          groupPathsBy: 'tag',
        },
      },
    },
  },
],
```

## 4. Create the playground page

Add a page under your docset base path, for example `/my-product/api-playground`, that renders the interactive explorer.

Use these pages as reference implementations:

- `src/pages/tfl/api-playground.tsx`
- `src/pages/petstore/api-playground.tsx`

## 5. Add a playground guide in your docset

Create `getting-started/playground.md` in your docset and explain:

1. What the playground demonstrates
2. Scope and limits (operations, auth requirements)
3. Try-it defaults and why you chose them
4. Expected response behavior
5. Where to go next

Add this file to your docset `navigation.json` under your Getting started category.

## 6. Validate

Run:

```bash
docify build
```

If you only want to check link integrity:

```bash
docify broken-links
```

## 7. Verify behavior

Start local dev and test at least one request in the playground UI:

```bash
docify dev
```

Confirm the route loads and the sample requests return expected responses.
