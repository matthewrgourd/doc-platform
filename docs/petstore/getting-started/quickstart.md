---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Run the three **unauthenticated GET** operations from the [API playground](/petstore/api-playground) using curl. Together they cover a simple read (`findByStatus`), a query-parameter login, and a logout.

## Prerequisites

- curl, Postman, or the [API playground](/petstore/api-playground)
- No API key for these demo calls

## OpenAPI description

**[Download `petstore-playground.json`](/openapi/petstore-playground.json)** — OpenAPI 3.0.3, playground **GET** subset only.

## 1. Find pets by status

```bash
curl "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available"
```

## 2. Log in (sample credentials)

```bash
curl "https://petstore3.swagger.io/api/v3/user/login?username=theUser&password=12345"
```

## 3. Log out

```bash
curl "https://petstore3.swagger.io/api/v3/user/logout"
```

## Next steps

- [Find pets by status](/petstore/pets/find-pets) — full reference for `GET /pet/findByStatus`
- [Login and logout](/petstore/users/login) — reference for session demo **GET**s
- [Authentication](./authentication) — if you extend beyond the playground
- [Error handling](./error-handling) — HTTP codes and sample error JSON
