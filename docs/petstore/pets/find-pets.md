---
sidebar_position: 3
title: Find pets
---

# Find pets

Find pets in the store by status or by tags.

## Find by status

Returns pets matching the given status. Use `available`, `pending`, or `sold`:

```bash
curl "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available"
```

The response is an array of pet objects:

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

## Find by tags

Returns pets that have any of the given tags. Multiple tags are comma-separated:

```bash
curl "https://petstore3.swagger.io/api/v3/pet/findByTags?tags=tag1,tag2,tag3"
```

:::caution Deprecated
`findByTags` is deprecated in OpenAPI 3.0. Prefer `findByStatus` when possible.
:::

## Get pet by ID

Fetch a single pet by its ID:

```bash
curl "https://petstore3.swagger.io/api/v3/pet/1"
```

Returns 404 if the pet is not found.
