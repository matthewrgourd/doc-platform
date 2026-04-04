---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Try the [API playground](/petstore/api-playground) operations using curl. The examples cover the full range of HTTP methods available in the playground — GET, POST, PUT, and DELETE — all without authentication.

## Prerequisites

- curl, Postman, or the [API playground](/petstore/api-playground)
- No API key for these demo calls

## OpenAPI description

**[Download `petstore-playground.json`](/openapi/petstore-playground.json)** — OpenAPI 3.0.3 description of all playground operations.

## 1. Find pets by status (GET)

```bash
curl "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available"
```

## 2. Add a pet (POST)

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/pet" \
  -H "Content-Type: application/json" \
  -d '{"name": "Rex", "photoUrls": ["https://example.com/rex.jpg"], "status": "available"}'
```

The response includes a server-assigned `id`. Use it in the next two steps.

## 3. Update a pet (PUT)

```bash
curl -X PUT "https://petstore3.swagger.io/api/v3/pet" \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "name": "Rex (updated)", "photoUrls": ["https://example.com/rex.jpg"], "status": "pending"}'
```

## 4. Delete a pet (DELETE)

```bash
curl -X DELETE "https://petstore3.swagger.io/api/v3/pet/1"
```

## 5. Log in (GET)

```bash
curl "https://petstore3.swagger.io/api/v3/user/login?username=theUser&password=12345"
```

## 6. Log out (GET)

```bash
curl "https://petstore3.swagger.io/api/v3/user/logout"
```

## Next steps

- [Find pets](/petstore/pets/find-pets) — full reference for `GET /pet/findByStatus`
- [Add a pet](/petstore/pets/add-pet) — full reference for `POST /pet`
- [Update a pet](/petstore/pets/update-pet) — full reference for `PUT /pet`
- [Delete a pet](/petstore/pets/delete-pet) — full reference for `DELETE /pet/{petId}`
- [Login and logout](/petstore/users/login) — reference for session demo GETs
- [Authentication](./authentication) — if you extend beyond the playground
- [Error handling](./error-handling) — HTTP codes and sample error JSON
