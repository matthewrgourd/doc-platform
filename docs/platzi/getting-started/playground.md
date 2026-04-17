---
title: Playground guide
sidebar_position: 5
description: Scope and intent of the Platzi Scalar playground.
---

# Playground guide

The Platzi playground is a curated subset of the live API for predictable demos.

## Included operations

- `GET /products`
- `GET /categories`
- `GET /users`
- `POST /users/is-available`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `GET /auth/profile`
- `GET /locations`

## Scope notes

- Data is shared and mutable on the public demo backend.
- IDs and content can change between requests.
- Use list/search endpoints for the most stable demos.

## Links

- Playground: [/platzi/api-playground](/platzi/api-playground)
- Download spec: [/openapi/platzi-playground.json](/openapi/platzi-playground.json)
- Intro docs: [/platzi/getting-started](/platzi/getting-started)
