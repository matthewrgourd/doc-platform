---
sidebar_position: 4
title: Error handling
---

# Error handling

The Petstore API uses conventional HTTP status codes. Codes in the `2xx` range indicate success, `4xx` indicate a client error, and `5xx` indicate a server error.

For the three playground **GET** operations, see response tables in **[petstore-playground.json](/openapi/petstore-playground.json)** (invalid `status` on `findByStatus`, login failures, and server errors).

## HTTP status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request - check your parameters |
| `401` | Unauthorized - invalid or missing credentials |
| `404` | Resource not found (pet, order, or user) |
| `422` | Validation exception - invalid input |
| `500` | Server error - retry with exponential backoff |

## Validation errors

Invalid input often returns `400` or `422` with a JSON body:

```json
{
  "code": 400,
  "type": "error",
  "message": "Invalid ID supplied"
}
```

## Playground-oriented examples

### Invalid `status` on find by status

```bash
curl -w "\nHTTP %{http_code}\n" "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=invalid"
```

### Login failure (bad password)

```bash
curl -w "\nHTTP %{http_code}\n" "https://petstore3.swagger.io/api/v3/user/login?username=theUser&password=wrong"
```

## Handling errors in code

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```javascript
const res = await fetch(
  'https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available',
);
if (!res.ok) {
  if (res.status === 400) {
    const err = await res.json();
    console.log(`Bad request: ${err.message}`);
  }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests

r = requests.get(
    'https://petstore3.swagger.io/api/v3/pet/findByStatus',
    params={'status': 'available'},
)
if not r.ok:
    if r.status_code == 400:
        print(f"Bad request: {r.json().get('message', '')}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash
curl -w "\nHTTP %{http_code}\n" "https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available"
```

</TabItem>
</Tabs>

## Other operations on the sample server

Endpoints such as store orders or pet updates can return additional error patterns. Those operations are **not** described in the playground OpenAPI file.
