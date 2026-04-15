---
sidebar_position: 6
slug: /getting-started/playground
title: TfL playground guide
description: "What the TfL API playground demonstrates, what defaults are pre-filled, and how to interpret the demo behavior."
---

# TfL playground guide

This guide explains what the TfL API playground demonstrates and how to interpret the demo behavior.

## What this playground demonstrates

The TfL playground demonstrates interactive API exploration with practical transport-focused examples and no-auth defaults.

## Scope and limits

- The playground and its OpenAPI file describe **three GET operations** only.
- Defaults are tuned for fast successful responses.
- The demo is intended for onboarding and platform evaluation.

## OpenAPI description

Download the canonical spec bundled with this site:

**[tfl-playground.json](/openapi/tfl-playground.json)**

## Included demo operations

- `GET /Line/Mode/{modes}/Status`
- `GET /StopPoint/Search/{query}`
- `GET /BikePoint`

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
