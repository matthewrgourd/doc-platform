---
sidebar_position: 2
slug: /how-to/add-playground
title: How to add an API playground
description: "Step-by-step instructions for adding an interactive API playground to a DevDocify docset."
---

# How to add an API playground

Follow these steps to add an interactive API playground to a DevDocify docset.

## Before you start

You'll need:

- An OpenAPI description file (JSON or YAML) for your API
- An existing docset directory under `docs/`
- Write access to `docusaurus.config.ts`

## 1. Add your OpenAPI spec

Place your OpenAPI file in the `openapi/` directory at the project root:

```
openapi/my-api.json
```

Keep the spec scoped to the operations you want to expose in the playground. Curated three-to-five operation specs work better than full API surface dumps for onboarding purposes.

## 2. Install the OpenAPI plugin

Install the plugin if it's not already present:

```bash
npm install docusaurus-plugin-openapi-docs @docusaurus/plugin-content-docs
```

## 3. Configure the plugin in docusaurus.config.ts

Add a plugin entry for your docset:

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

Add a playground page to your docset. A minimal page needs:

- A route under your docset base path (for example `/my-product/api-playground`)
- A React component that renders the interactive explorer

Use the TfL or Petstore playground pages as reference implementations:

- `src/pages/tfl/api-playground.tsx`
- `src/pages/petstore/api-playground.tsx`

## 5. Add a playground guide to your docset

Create a `getting-started/playground.md` file in your docset directory that explains:

1. What the playground demonstrates
2. Scope and limits (number of operations, auth requirements)
3. Try-it defaults and why you chose them
4. Expected response behavior
5. Where to go next

Add the file to your docset's `navigation.json` inside the Getting started category.

## 6. Validate

Run the following to confirm the build succeeds:

```bash
docify build
```

Or check for broken links specifically:

```bash
docify broken-links
```
