---
sidebar_position: 2
title: Add a pet
---

# Add a pet

Create a new pet in the store with a POST request to `/pet`.

## Minimal request

```json
{
  "name": "doggie",
  "photoUrls": ["https://example.com/photo.jpg"],
  "status": "available"
}
```

`name` and `photoUrls` are required. `status` can be `available`, `pending`, or `sold`.

## Full request with category and tags

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```javascript
const res = await fetch('https://petstore3.swagger.io/api/v3/pet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'doggie',
    category: { id: 1, name: 'Dogs' },
    photoUrls: ['https://example.com/photo.jpg'],
    tags: [{ id: 1, name: 'friendly' }],
    status: 'available',
  }),
});
const pet = await res.json();
console.log(pet.id);
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests

r = requests.post(
    'https://petstore3.swagger.io/api/v3/pet',
    json={
        'name': 'doggie',
        'category': {'id': 1, 'name': 'Dogs'},
        'photoUrls': ['https://example.com/photo.jpg'],
        'tags': [{'id': 1, 'name': 'friendly'}],
        'status': 'available',
    },
)
pet = r.json()
print(pet['id'])
```

</TabItem>
<TabItem value="curl" label="curl">

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/pet" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "doggie",
    "category": {"id": 1, "name": "Dogs"},
    "photoUrls": ["https://example.com/photo.jpg"],
    "tags": [{"id": 1, "name": "friendly"}],
    "status": "available"
  }'
```

</TabItem>
</Tabs>

## Response

A successful response returns the created pet with an assigned `id`:

```json
{
  "id": 10,
  "name": "doggie",
  "category": { "id": 1, "name": "Dogs" },
  "photoUrls": ["https://example.com/photo.jpg"],
  "tags": [{ "id": 1, "name": "friendly" }],
  "status": "available"
}
```

## Content types

The API accepts `application/json`, `application/xml`, and `application/x-www-form-urlencoded`. Use the same content type in the `Content-Type` header.
