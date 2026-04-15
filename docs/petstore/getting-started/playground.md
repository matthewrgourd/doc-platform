---
sidebar_position: 5
slug: /getting-started/playground
title: Petstore playground guide
description: "What the Petstore API playground demonstrates, what defaults are pre-filled, and how to interpret the demo behavior."
---

# Petstore playground guide

This guide explains what the Petstore API playground demonstrates and how to use it productively.

## What this playground demonstrates

The Petstore playground demonstrates a low-friction "try API now" flow with no-auth demo endpoints and useful defaults.

## Scope and limits

- The playground and its OpenAPI file describe **three GET operations** only.
- The page is designed to return successful responses quickly.
- Behavior is intentionally optimized for onboarding and documentation evaluation.

## OpenAPI description

Download the canonical spec bundled with this site (not the upstream full API):

**[petstore-playground.json](/openapi/petstore-playground.json)**

## Included demo operations

- `GET /pet/findByStatus`
- `GET /user/login`
- `GET /user/logout`

## Try-it defaults

Defaults are pre-filled to reduce setup time:

- `status=available` for `findByStatus`
- `username=theUser` and `password=12345` for login

## Expected response behavior

Requests should return valid responses without reader-managed authentication setup.

## Related routes

- Playground: [/petstore/api-playground](/petstore/api-playground)
- Product docs start: [/petstore/getting-started](/petstore/getting-started)
