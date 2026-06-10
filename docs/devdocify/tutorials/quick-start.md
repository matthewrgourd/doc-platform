---
sidebar_position: 2
slug: /tutorials/quick-start
title: Quick start
description: "Install the Docify CLI, scaffold a new DevDocify project, run the dev server, validate content, and deploy to Vercel."
---

# Quick start

This tutorial walks you from installing the CLI to deploying a DevDocify site. It takes about ten minutes.

## What you'll build

A new documentation site running locally, with content validation and broken-link checks passing, ready to deploy to Vercel.

## Prerequisites

- Node.js 20.17.0 or later (includes npm)
- A GitHub account (for deployment)
- A Vercel account (for deployment)

---

## Step 1: Install the CLI

From the root of the `doc-platform` repository, link the CLI globally:

```bash
cd packages/cli && npm install && npm link
```

Confirm it is available:

```bash
docify --version
```

---

## Step 2: Create a project

Navigate to the directory where you want your project, then scaffold it:

```bash
cd ~
docify new my-docs
```

Change into the new directory and install dependencies:

```bash
cd my-docs
npm install
```

---

## Step 3: Start the dev server

```bash
docify dev
```

Or without the CLI: `npm start`.

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see your new docs site.

Edit `docs/index.md` and save. The browser should reload automatically.

Press `Ctrl+C` to stop the dev server when you are done.

---

## Step 4: Validate content

Run the content linter to catch common issues before you build:

```bash
docify validate
```

Or without the CLI: `npm run lint-content`.

The scaffolded project includes a placeholder `lint-content` script. Replace it with a real linter when you are ready.

---

## Step 5: Check for broken links

Build the site and check every internal link:

```bash
docify broken-links
```

Without the CLI, `npm run build` catches broken links because the scaffolded config sets `onBrokenLinks: 'throw'`. Fix any broken links reported before continuing.

---

## Step 6: Build and deploy

Build a production bundle:

```bash
docify build
```

Or without the CLI: `npm run build`.

Deploy to Vercel:

1. Push your project to a GitHub repository.
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the following in Vercel project settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `build` |
| Install command | `npm install` |

5. Click **Deploy**.

Vercel runs a build on every push to `main` and creates preview deployments for every pull request.

---

## What's next

- [Add a docset](/docs/how-to/add-docset)
- [Add an API playground](/docs/how-to/add-playground)
- [Configure search](/docs/how-to/configure-search)
- [Configure enterprise controls](/docs/how-to/configure-enterprise-controls)
- [Add PlantUML diagrams](/docs/how-to/add-plantuml-diagrams)
- [CLI reference](/docs/reference/cli)
