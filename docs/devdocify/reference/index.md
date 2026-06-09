---
sidebar_position: 1
slug: /reference
title: Reference
description: "Technical reference for DevDocify: CLI commands, navigation contract schema, route model, automation scripts, and configuration entry points."
---

# Reference

Use reference pages when you need exact facts, supported options, and stable technical contracts.

<div className="docs-hero-block">
  <p className="docs-eyebrow">System contracts</p>
  <p className="docs-hero-copy">
    CLI commands, navigation schema, route model, automation scripts, and configuration entry points.
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
  <p><code>/platzi</code> demo Platzi Fake Store docs</p>
  <p><code>/tfl/api-playground</code>, <code>/petstore/api-playground</code>, and <code>/platzi/api-playground</code> interactive demo routes</p>
</div>

## Configuration entry points

- Site config: `docusaurus.config.ts`
- Sidebars: `sidebarsDevdocify.ts`, `sidebarsTfl.ts`, `sidebarsPetstore.ts`, `sidebarsPlatzi.ts`
- Navigation contract loader: `navigation-contract.ts`
- Navigation definitions: `docs/*/navigation.json`
- SAML config example: `saml.config.example.json`
- RBAC config example: `rbac.config.example.json`
- Assistant config example: `assistant.config.example.json`
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/preview.yml`, `.github/workflows/rbac-check.yml`, `.github/workflows/link-check.yml`, `.github/workflows/docs-draft-update.yml`

## Automation scripts

| Script | Purpose |
|---|---|
| `scripts/build-route-manifest.ts` | Builds the route manifest for all docsets. |
| `scripts/build-search-index.ts` | Builds the local docs and API operation search index. |
| `scripts/push-search-index.ts` | Pushes the built search index to Algolia. |
| `scripts/generate-llms-txt.ts` | Generates `llms.txt` with canonical docs and API route URLs. |
| `scripts/validate-saml-config.ts` | Validates SAML configuration. |
| `scripts/generate-nginx-auth-config.ts` | Generates nginx `auth_request` configuration from SAML settings. |
| `scripts/validate-rbac-config.ts` | Validates RBAC role assignments. |
| `scripts/check-rbac-permission.ts` | Checks whether an actor has a capability such as `content.publish`. |
| `scripts/validate-analytics-event.ts` | Validates analytics event payloads and prints the event schema. |
| `scripts/validate-assistant-quality.ts` | Enforces assistant policy and grounding requirements. |
| `scripts/benchmark-build.ts` | Benchmarks full Docusaurus builds at synthetic fixture scale. |
