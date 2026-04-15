---
sidebar_position: 2
slug: /tutorials/quick-start
title: Quick start
description: "Install the Docify CLI, scaffold a new DevDocify project, run the dev server, validate content, and deploy to Vercel."
---

# Quick start

This tutorial walks you from installing the CLI to deploying a DevDocify site. It takes about ten minutes.

## What you'll build

A new documentation site running locally, with content validation and broken-link checks passing, ready to push to Vercel.

## Prerequisites

- Node.js 20.17.0 or later
- An npm account (for global install)
- A GitHub account (for the deploy step)
- A Vercel account (for the deploy step)

---

## Step 1 — Install the CLI

Install the Docify CLI globally:

```bash
npm install -g @devdocify/cli
```

Confirm it's working:

```bash
docify --version
```

---

## Step 2 — Create a project

Scaffold a new DevDocify project in a directory called `my-docs`:

```bash
docify new my-docs
```

The CLI creates the directory with a minimal Docusaurus project, a placeholder doc, and a `.gitignore`.

Change into the new directory and install dependencies:

```bash
cd my-docs
npm install
```

---

## Step 3 — Start the dev server

```bash
docify dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see your new docs site.

Edit `docs/index.md` and save — the browser reloads automatically.

Press `Ctrl+C` to stop the dev server when you're done.

---

## Step 4 — Validate content

Run the content linter to catch common issues before you build:

```bash
docify validate
```

If your project's `package.json` doesn't have a `lint-content` script yet, add one:

```json
"lint-content": "echo \"No linter configured\""
```

---

## Step 5 — Check for broken links

Build the site and check every internal link:

```bash
docify broken-links
```

Fix any broken links reported before continuing.

---

## Step 6 — Build and deploy

Build a production bundle:

```bash
docify build
```

To deploy to Vercel:

1. Push your project to a GitHub repository.
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the following in the Vercel project settings:
   - **Build command**: `npm run build`
   - **Output directory**: `build`
   - **Install command**: `npm install`
5. Click **Deploy**.

Vercel runs a build on every push to `main` and creates preview deployments for every pull request.

---

## What's next

- [Add a docset](/docs/how-to/add-docset) — bring a new product into your site
- [Add an API playground](/docs/how-to/add-playground) — add an interactive OpenAPI explorer
- [Configure search](/docs/how-to/configure-search) — set up Algolia DocSearch
- [CLI reference](/docs/reference/cli) — all commands and flags
