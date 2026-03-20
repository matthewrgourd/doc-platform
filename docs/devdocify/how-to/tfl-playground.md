---
sidebar_position: 4
slug: /how-to/tfl-playground
title: TfL playground guide
---

# TfL playground guide

This guide explains what the TfL API playground demonstrates and how to interpret the demo behavior.

## What this playground demonstrates

The TfL playground demonstrates interactive API exploration with practical transport-focused examples and no-auth defaults.

## Scope and limits

- This is a curated subset of TfL endpoints.
- Defaults are tuned for fast successful responses.
- The demo is intended for onboarding and platform evaluation.

## Included demo operations

- `GET /Line/Mode/{modes}/Status`
- `GET /StopPoint/Search/{query}`
- `GET /Line/{ids}/Route/Sequence/{direction}`

## Try-it defaults

Defaults are pre-filled to reduce setup time:

- `modes=tube`
- `detail=false`
- `query=waterloo`

## Expected response behavior

Requests should return useful data without requiring user-provided credentials.

## Related routes

- Playground: [/tfl/api-playground](/tfl/api-playground)
- Product docs start: [/tfl/getting-started](/tfl/getting-started)
