---
sidebar_position: 4
title: Error handling
---

# Error handling

The Petstore API uses conventional HTTP status codes. Codes in the `2xx` range indicate success, `4xx` indicate a client error, and `5xx` indicate a server error.

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

Invalid input returns a 400 or 422 with details about the problem:

```json
{
  "code": 400,
  "type": "error",
  "message": "Invalid ID supplied"
}
```

## Special cases

- **Get order by ID**: Use IDs `<= 5` or `> 10` for valid responses. Other values may generate exceptions.
- **Delete order**: Use IDs `< 1000`. Values `>= 1000` or non-integers generate errors.
- **Find pets by tags**: Deprecated in OpenAPI 3.0 but may still work. Prefer `findByStatus`.

## Handling errors in code

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```javascript
const res = await fetch('https://petstore3.swagger.io/api/v3/pet/99999');
if (!res.ok) {
  if (res.status === 404) {
    console.log('Pet not found');
  } else if (res.status === 400) {
    const err = await res.json();
    console.log(`Bad request: ${err.message}`);
  }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests

r = requests.get('https://petstore3.swagger.io/api/v3/pet/99999')
if not r.ok:
    if r.status_code == 404:
        print('Pet not found')
    elif r.status_code == 400:
        print(f"Bad request: {r.json().get('message', '')}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash
curl -w "\nHTTP %{http_code}\n" "https://petstore3.swagger.io/api/v3/pet/99999"
```

</TabItem>
</Tabs>
