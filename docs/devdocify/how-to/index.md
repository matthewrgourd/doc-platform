---
sidebar_position: 1
slug: /how-to
title: How-to guides
---

# How-to guides

Use how-to guides when you need to complete a specific job quickly.

## How to add documentation content safely

1. Add or update docs content in the correct docset path:
   - `docs/devdocify/*` for first-party product docs
   - `docs/tfl/*` and `docs/petstore/*` for demo product docs
2. Update the related sidebar file when needed:
   - `sidebarsDevdocify.ts`
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
