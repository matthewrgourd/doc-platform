---
sidebar_position: 1
slug: /explanation
title: Explanation
---

# Explanation

Use explanation pages when you want context on platform design choices and trade-offs.

<div className="docs-hero-block">
  <p className="docs-eyebrow">Rationale</p>
  <p className="docs-hero-copy">
    These decisions prioritize clarity for readers and maintainable delivery workflows for the
    team.
  </p>
</div>

## Why root and docs are split

- `devdocify.com` serves marketing intent and product positioning.
- `devdocify.com/docs` serves technical guidance and implementation detail.
- Keeping these surfaces distinct avoids mixing conversion copy with technical reference content.

## Why this site includes TfL and Petstore

- They demonstrate multi-docset navigation and authoring patterns.
- They provide realistic API playground examples without requiring private backend systems.
- They let the first-party docs explain platform behavior using live, inspectable examples.

## Why docs-as-code is central

- Versioned docs changes can be reviewed in pull requests.
- Build and link checks run before merge.
- Preview workflows make UI/content regressions visible before production.
