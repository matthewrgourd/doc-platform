---
sidebar_position: 3
title: Find pets by status
---

# Find pets by status

`GET /pet/findByStatus` returns pets whose inventory `status` matches a query parameter. This is the **Pets** operation included in the [API playground](/petstore/api-playground) and in the downloadable description below.

## OpenAPI description (playground scope)

The machine-readable contract for the demo **GET** operations (this endpoint plus user login and logout) is maintained in this repository:

**[Download `petstore-playground.json`](/openapi/petstore-playground.json)** (JSON, OpenAPI 3.0.3)

It documents only those three paths. Other operations on the public sample server are not part of that file.

## Resource

A **pet** is an item in the sample store with a name, photo URLs, optional category and tags, and a `status` of `available`, `pending`, or `sold`.

## Operation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/pet/findByStatus` |
| **Base URL** | `https://petstore3.swagger.io/api/v3` |

## Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `status` | Query | Yes | One of `available`, `pending`, or `sold`. |

## Request headers

| Header | Required | Description |
|---|---:|---|
| `Accept` | No | Use `application/json` (default for examples). |

## Responses

| Code | Description | Body |
|---|---|---|
| `200` | Success | JSON array of pet objects (may be empty). |
| `400` | Bad request | Often JSON with `code`, `type`, and `message` (for example invalid `status`). |
| `500` | Server error | Retry with backoff. |

### Example success body

```json
[
  {
    "id": 1,
    "name": "doggie",
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "available"
  }
]
```

## Example request

```bash
curl "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available"
```

## Related playground operations

- [Login and logout](/petstore/users/login) — `GET /user/login` and `GET /user/logout` in the same OpenAPI file.
