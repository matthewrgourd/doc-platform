---
sidebar_position: 2
slug: /reference/cli
title: CLI reference
description: "Complete reference for all docify CLI commands, flags, and examples."
---

# CLI reference

The Docify CLI (`@devdocify/cli`) provides commands for local development, content validation, SEO analysis, project scaffolding, and configuration management.

## Installation

```bash
npm install -g @devdocify/cli
```

## Global flags

| Flag | Description |
|---|---|
| `-v, --version` | Print the installed CLI version |
| `-h, --help` | Print help for a command |

---

## docify dev

Starts the local development server. Detects the package manager in use (pnpm, yarn, bun, or npm) and runs the `start` script.

**Requires**: a `docusaurus.config.ts` or `docusaurus.config.js` in the current directory.

```bash
docify dev
```

The command streams all output from the underlying build process. Press `Ctrl+C` to stop the server.

---

## docify build

Builds the documentation site for production. Detects the package manager and runs the `build` script.

**Requires**: a `docusaurus.config.ts` or `docusaurus.config.js` in the current directory.

```bash
docify build
```

Output is written to the `build/` directory. Exits with code 1 if the build fails.

---

## docify validate

Runs the `lint-content` script defined in `package.json`.

**Requires**: a `docusaurus.config.ts` or `docusaurus.config.js` in the current directory.

```bash
docify validate
```

Add a `lint-content` script to `package.json` to integrate your linter of choice (Vale, markdownlint, or custom scripts).

---

## docify broken-links

Builds the site and parses the build output for broken link errors reported by Docusaurus. Prints each broken source page and its unresolvable target.

**Requires**: a `docusaurus.config.ts` or `docusaurus.config.js` in the current directory.

```bash
docify broken-links
```

Exits with code 1 if any broken links are found.

---

## docify new \<directory\>

Scaffolds a new DevDocify project in `<directory>`. Creates the directory and writes the following files:

- `package.json`
- `docusaurus.config.ts`
- `docs/index.md`
- `src/css/custom.css`
- `.gitignore`

```bash
docify new my-docs
```

Does **not** require a DevDocify project to be present in the current directory.

---

## docify update

Updates the CLI to the latest published version.

```bash
docify update
```

Runs `npm install -g @devdocify/cli@latest`. Does not require a DevDocify project to be present.

---

## docify score \<url\>

Fetches a URL and checks for six SEO signals. Prints a tick or cross for each check and returns a score out of 6.

```bash
docify score https://your-docs-site.example.com/docs
```

Checks performed:

| Check | What it looks for |
|---|---|
| Title tag | `<title>` element present and non-empty |
| Meta description | `<meta name="description">` with non-empty content |
| Canonical link | `<link rel="canonical">` present |
| og:title | `<meta property="og:title">` present |
| og:description or og:image | At least one of the two OG tags present |
| Robots or sitemap | `<meta name="robots">` present, or `sitemap.xml` returns 200 |

---

## docify analytics

Prints guidance for accessing Algolia search analytics.

```bash
docify analytics
```

No network requests are made. The command prints the Algolia dashboard URL and describes what analytics are available.

---

## docify a11y

Prints guidance for running accessibility tests with axe-core.

```bash
docify a11y
```

No network requests are made. The command explains how to run `npx axe-cli <url>` against a local or deployed site.

---

## docify config

Reads and writes CLI configuration stored in `~/.docify/config.json`.

### List all config

```bash
docify config
```

### Read a single value

```bash
docify config <key>
```

### Set a value

```bash
docify config <key> <value>
```

**Example:**

```bash
docify config defaultPm pnpm
```

### Reset all config

```bash
docify config --reset
```

---

## Project detection

Most commands require the current directory to contain a `docusaurus.config.ts` or `docusaurus.config.js` file. If neither is found, the command prints a helpful error and exits with code 1.

Commands that skip this check: `new`, `update`, `config`, `score`, `analytics`, `a11y`.

---

## Package manager detection

`docify dev`, `docify build`, `docify validate`, and `docify broken-links` detect the package manager by checking for lock files in the current directory:

| Lock file | Package manager used |
|---|---|
| `pnpm-lock.yaml` | pnpm |
| `bun.lockb` | bun |
| `yarn.lock` | yarn |
| (none found) | npm |
