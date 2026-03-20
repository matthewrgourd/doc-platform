---
sidebar_position: 1
slug: /reference
title: Reference
---

# Reference

Use reference pages for exact facts, supported options, and stable technical contracts.

<div className="docs-hero-block">
  <p className="docs-eyebrow">System contracts</p>
  <p className="docs-hero-copy">
    Route behavior, command surface, and configuration entry points for the current implementation.
  </p>
</div>

## Current route model

<div className="docs-route-list">
  <p><code>/</code> marketing-first root surface</p>
  <p><code>/docs</code> first-party technical product docs (Diataxis)</p>
  <p><code>/tfl</code> demo TfL product docs</p>
  <p><code>/petstore</code> demo Petstore product docs</p>
  <p><code>/tfl/api-playground</code> and <code>/petstore/api-playground</code> interactive demo routes</p>
</div>

## Core tooling and commands

- Install dependencies: `npm install --legacy-peer-deps`
- Local dev: `npm start`
- Production build: `npm run build`
- Serve build locally: `npm run serve`

## Configuration entry points

- Site config: `docusaurus.config.ts`
- Sidebars: `sidebarsDevdocify.ts`, `sidebarsTfl.ts`, `sidebarsPetstore.ts`
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/preview.yml`
