---
sidebar_position: 1
slug: /reference
title: Reference
description: "Technical reference for DevDocify: CLI commands, navigation contract schema, route model, and configuration entry points."
---

# Reference

Use reference pages when you need exact facts, supported options, and stable technical contracts.

<div className="docs-hero-block">
  <p className="docs-eyebrow">System contracts</p>
  <p className="docs-hero-copy">
    CLI commands, navigation schema, route model, and configuration entry points.
  </p>
</div>

## Reference pages

<div className="docs-link-grid">
  <a href="/docs/reference/cli">CLI reference</a>
  <a href="/docs/reference/navigation-contract">Navigation contract</a>
</div>

## Current route model

<div className="docs-route-list">
  <p><code>/</code> marketing-first root surface</p>
  <p><code>/docs</code> first-party technical product docs (Diataxis)</p>
  <p><code>/tfl</code> demo TfL product docs</p>
  <p><code>/petstore</code> demo Petstore product docs</p>
  <p><code>/tfl/api-playground</code> and <code>/petstore/api-playground</code> interactive demo routes</p>
</div>

## Configuration entry points

- Site config: `docusaurus.config.ts`
- Sidebars: `sidebarsDevDocify.ts`, `sidebarsTfl.ts`, `sidebarsPetstore.ts`
- Navigation contract loader: `navigation-contract.ts`
- Navigation definitions: `docs/*/navigation.json`
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/preview.yml`
