---
sidebar_position: 3
slug: /how-to/add-docset
title: Add a docset
description: "How to add a new product docset to a DevDocify site, including directory structure, navigation contract, plugin config, and sidebar wiring."
---

# Add a docset

Follow these steps to add a new product docset to your DevDocify site.

## Prerequisites

- You are in the project root.
- You can edit `docusaurus.config.ts`.
- You have the `docify` CLI installed.

## 1. Create the docs directory

Create a directory for your new product under `docs/`:

```bash
mkdir -p docs/myproduct/getting-started
```

Create a minimal index page:

```bash
touch docs/myproduct/getting-started/index.md
```

## 2. Add `navigation.json`

Create `docs/myproduct/navigation.json`. This file defines the sidebar for the docset:

```json
[
  {
    "type": "category",
    "label": "Getting started",
    "items": [
      {"type": "doc", "id": "getting-started/index", "label": "Overview"}
    ]
  }
]
```

See the [Navigation contract](/docs/reference/navigation-contract) for the schema and validation rules.

## 3. Add the docs plugin in `docusaurus.config.ts`

Add a `@docusaurus/plugin-content-docs` entry inside the `plugins` array:

```ts
[
  '@docusaurus/plugin-content-docs',
  {
    id: 'myproduct',
    path: 'docs/myproduct',
    routeBasePath: 'myproduct',
    sidebarPath: './sidebarsMyproduct.ts',
  },
],
```

## 4. Create a sidebars file

Create `sidebarsMyproduct.ts` at the project root:

```ts
import { loadNavigationContract } from './navigation-contract.js';
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  myproductSidebar: loadNavigationContract('docs/myproduct/navigation.json'),
};

export default sidebars;
```

## 5. Add a navbar item

In `docusaurus.config.ts`, add an entry to `themeConfig.navbar.items`:

```ts
{
  label: 'My Product',
  to: '/myproduct/getting-started',
  position: 'left',
},
```

## 6. Add a footer link (optional)

Add a link to `themeConfig.footer.links` in the relevant column.

## 7. Validate

Run validation to confirm your navigation contract is valid and the site builds:

```bash
docify validate
docify build
```

## 8. Verify in the browser

Run the dev server and verify the new docset route and sidebar:

```bash
docify dev
```

Open `http://localhost:3000/myproduct/getting-started` and confirm the sidebar loads your `navigation.json` entries.
