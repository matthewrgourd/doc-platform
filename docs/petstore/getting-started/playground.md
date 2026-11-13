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

- The playground and its OpenAPI file describe **six operations** only: three `GET` operations, plus `POST`, `PUT`, and `DELETE` for pets.
- The page returns successful responses quickly.
- Use the demo for onboarding and documentation evaluation.

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

Requests return valid responses. You don't need to set up authentication.

## Related routes

- Playground: [/petstore/api-playground](/petstore/api-playground)
- Product docs start: [/petstore/getting-started](/petstore/getting-started)
