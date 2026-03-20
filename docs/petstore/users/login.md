---
sidebar_position: 3
title: Login and logout
---

# Login and logout

The playground documents two **session-style GET** operations on the public Swagger Petstore sample. They are useful for trying query parameters and response headers without API keys.

:::warning
Sending passwords in the query string is **not** a production pattern. The Swagger sample does this for teaching only.
:::

## OpenAPI description (playground scope)

**[Download `petstore-playground.json`](/openapi/petstore-playground.json)** — includes `GET /user/login`, `GET /user/logout`, and `GET /pet/findByStatus` only.

## Log in

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/user/login` |
| **Base URL** | `https://petstore3.swagger.io/api/v3` |

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `username` | Query | Yes | Sample default `theUser`. |
| `password` | Query | Yes | Sample default `12345`. |

### Responses

| Code | Description |
|---|---|
| `200` | Session string returned (JSON string body). Check response headers for rate-limit hints. |
| `400` | Invalid username or password (JSON error body possible). |

### Response headers (success)

| Header | Description |
|---|---|
| `X-Rate-Limit` | Calls per hour allowed (sample server). |
| `X-Expires-After` | UTC date/time after which the session may expire. |

### Example

```bash
curl "https://petstore3.swagger.io/api/v3/user/login?username=theUser&password=12345"
```

### Example body

```json
"logged in user session:1234567890"
```

## Log out

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/user/logout` |
| **Base URL** | `https://petstore3.swagger.io/api/v3` |

### Parameters

None.

### Responses

| Code | Description |
|---|---|
| `200` | Logout acknowledged (string body on sample server). |
| `500` | Server error. |

### Example

```bash
curl "https://petstore3.swagger.io/api/v3/user/logout"
```

## Related

- [Find pets by status](/petstore/pets/find-pets) — companion playground **GET** on pets.
