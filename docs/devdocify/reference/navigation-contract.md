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

Each node must declare a `type`:

- `doc`: `{"type":"doc","id":"path/to/doc","label":"Optional label"}`
- `category`: `{"type":"category","label":"Section","items":[...]}`
- `link`: `{"type":"link","label":"API playground","href":"/route"}`

## Validation behavior

Validation runs at build/start time and fails fast when the contract is invalid.

Examples of invalid input that fail the build with actionable errors:

- root is not an array
- missing or unsupported `type`
- `doc` node without `id`
- `link` node without `href`
- `category` node without non-empty `items`

## Deep nesting support

The contract parser is recursive and supports deeply nested category trees, including trees deeper than five levels.

## Why this model

- one navigation file per docset/version
- deterministic, validated behavior before publish
- easier ownership and change review for information architecture updates
