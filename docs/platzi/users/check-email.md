---
title: Check email
sidebar_position: 2
description: Validate whether an email can be used for a new account.
---

# Check email availability

Use `POST /users/is-available` with an `email` payload.

## Example

```bash
curl -X POST "https://api.escuelajs.co/api/v1/users/is-available" \
  -H "content-type: application/json" \
  -d '{"email":"john@mail.com"}'
```

## Response shape

```json
{"isAvailable": false}
```
