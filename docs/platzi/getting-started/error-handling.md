---
title: Error handling
sidebar_position: 4
description: Common response codes for Platzi playground operations.
---

# Error handling

Common response patterns in this demo API:

- `200`: Request succeeded.
- `400`: Bad request (missing/invalid payload or parameters).
- `401`: Missing or invalid bearer token for protected endpoints.
- `404`: Resource not found.
- `429`: Rate limiting may be applied.
- `5xx`: Upstream server error.

## Expected example: profile without token

```bash
curl -i "https://api.escuelajs.co/api/v1/auth/profile"
```

Expected status: `401`.

## Debug checklist

- Confirm request path and method match the OpenAPI operation.
- Confirm `content-type: application/json` for POST payloads.
- Confirm bearer token is present for `/auth/profile`.
