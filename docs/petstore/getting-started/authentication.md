---
sidebar_position: 3
title: Authentication
---

# Authentication

The Petstore demo playground doesn't require authentication. It uses public GET examples with prefilled values.

## Playground behavior

The [API playground](/petstore/api-playground) includes these unauthenticated demo endpoints:

- `GET /pet/findByStatus`
- `GET /user/login`
- `GET /user/logout`

## Authentication for extended usage

If you expand beyond the demo endpoints, your Petstore environment can use OAuth2 or API keys.

For endpoints that require `write:pets` or `read:pets`, send a bearer token:

```bash
curl "https://petstore3.swagger.io/api/v3/pet/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

For inventory operations that require an API key, send it in the header:

```bash
curl "https://petstore3.swagger.io/api/v3/store/inventory" \
  -H "api_key: YOUR_API_KEY"
```

Check your environment settings to confirm which endpoints require authentication.
