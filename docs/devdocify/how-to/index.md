---
sidebar_position: 1
slug: /how-to
title: How-to guides
description: "How-to guides for DevDocify: edit docs safely, preserve route boundaries, configure multi-docset navigation, and validate output before merge."
---

# How-to guides

Use how-to guides when you need to finish a specific task quickly.

<div className="docs-hero-block">
  <p className="docs-eyebrow">Execution guides</p>
  <p className="docs-hero-copy">
    Use these pages for operational work: editing docs safely, preserving route boundaries, and
    validating output before merge.
  </p>
</div>

## How to add documentation content safely

1. Add or update docs content in the correct docset path:
   - `docs/devdocify/*` for first-party product docs
   - `docs/tfl/*` and `docs/petstore/*` for demo product docs
2. Update the related sidebar file when needed:
   - `sidebarsDevDocify.ts`
   - `sidebarsTfl.ts`
   - `sidebarsPetstore.ts`
3. Run quality checks locally:
   - `npm run build`
4. Open a PR and validate preview output before merge.

## How to verify root/docs split

1. Confirm root (`/`) presents marketing-oriented context.
2. Confirm `/docs` is technical product documentation.
3. Confirm product demos remain scoped to `/tfl` and `/petstore`.

These checks protect the information architecture agreed in Story 7.1.

## API playground explanation guides

<div className="docs-link-grid">
  <a href="/docs/how-to/playground-overview">Playground explanation template</a>
  <a href="/docs/how-to/petstore-playground">Petstore playground guide</a>
  <a href="/docs/how-to/tfl-playground">TfL playground guide</a>
</div>
