---
sidebar_position: 2
slug: /reference/navigation-contract
title: Navigation contract
---

# Navigation contract

Navigation for each docset is defined in one file:

- `docs/devdocify/navigation.json`
- `docs/tfl/navigation.json`
- `docs/petstore/navigation.json`

These files are loaded and validated by `navigation-contract.ts` and then consumed by each sidebar entrypoint.

## Supported node types

Each node must declare `type`:

- `doc`: `{"type":"doc","id":"path/to/doc","label":"Optional label"}`
- `category`: `{"type":"category","label":"Section","items":[...]}`
- `link`: `{"type":"link","label":"API playground","href":"/route"}`

## Validation behavior

Validation runs at build/start time and fails fast when the contract is invalid.

Examples that fail validation:

- Root isn't an array.
- Missing or unsupported `type`.
- `doc` node without `id`.
- `link` node without `href`.
- `category` node without non-empty `items`.

## Deep nesting support

The parser is recursive and supports deeply nested category trees.

## Why this model

- One navigation file per docset or version.
- Deterministic behavior before publish.
- Easier ownership and review for information architecture changes.
