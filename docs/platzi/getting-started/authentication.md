---
title: Authentication
sidebar_position: 3
description: JWT login, refresh, and profile retrieval for Platzi demo endpoints.
---

# Authentication

The Platzi demo API uses JWT for protected endpoints.

## Login

```bash
curl -X POST "https://api.escuelajs.co/api/v1/auth/login" \
  -H "content-type: application/json" \
  -d '{"email":"john@mail.com","password":"changeme"}'
```

Response includes `access_token` and `refresh_token`.

## Profile (requires bearer token)

```bash
curl "https://api.escuelajs.co/api/v1/auth/profile" \
  -H "authorization: Bearer <access_token>"
```

## Refresh token

```bash
curl -X POST "https://api.escuelajs.co/api/v1/auth/refresh-token" \
  -H "content-type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'
```

Use the [API playground](/platzi/api-playground) to run these flows interactively.
