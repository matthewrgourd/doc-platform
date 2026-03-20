---
sidebar_position: 1
slug: /reference
title: Reference
---

# Reference

Use reference pages for exact facts, supported options, and stable technical contracts.

## Current route model

- `/` - marketing-first root surface.
- `/docs` - first-party technical product docs (Diataxis).
- `/tfl` - demo TfL product docs.
- `/petstore` - demo Petstore product docs.
- `/tfl/api-playground` and `/petstore/api-playground` - interactive demo routes.

## Core tooling and commands

- Install dependencies: `npm install --legacy-peer-deps`
- Local dev: `npm start`
- Production build: `npm run build`
- Serve build locally: `npm run serve`

## Configuration entry points

- Site config: `docusaurus.config.ts`
- Sidebars: `sidebarsDevdocify.ts`, `sidebarsTfl.ts`, `sidebarsPetstore.ts`
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/preview.yml`
