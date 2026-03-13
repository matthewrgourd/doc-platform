---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Add your first pet to the store in under 5 minutes.

## Prerequisites

- A tool to make HTTP requests (curl, Postman, or the [API playground](/api-reference))
- No account required for basic operations

## 1. Add a pet

Send a POST request to create a new pet:

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/pet" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "doggie",
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "available"
  }'
```

## 2. Find pets by status

Retrieve pets with a given status (`available`, `pending`, or `sold`):

```bash
curl "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available"
```

## 3. Get a pet by ID

Use the pet ID from the create response:

```bash
curl "https://petstore3.swagger.io/api/v3/pet/1"
```

## Next steps

- [Add a pet](/pets/add-pet) - Full guide with categories and tags
- [Authentication](./authentication) - OAuth2 and API key for protected endpoints
- [Error handling](./error-handling) - Handle failures gracefully
