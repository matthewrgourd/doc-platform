---
sidebar_position: 3
title: Login and logout
---

# Login and logout

Authenticate users with the login endpoint. Use logout to end the session.

## Login

Send a GET request with username and password as query parameters:

```bash
curl "https://petstore3.swagger.io/api/v3/user/login?username=theUser&password=12345"
```

## Response

Returns a session token (string):

```json
"logged in user session:1234567890"
```

Response headers include:

| Header | Description |
|---|---|
| `X-Rate-Limit` | Calls per hour allowed |
| `X-Expires-After` | UTC date when token expires |

## Logout

End the current session:

```bash
curl "https://petstore3.swagger.io/api/v3/user/logout"
```

Returns 200 on success.
