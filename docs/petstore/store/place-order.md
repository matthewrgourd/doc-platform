---
sidebar_position: 2
title: Place an order
---

# Place an order

Create a new order for a pet with a POST request to `/store/order`.

## Order object

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer | No | Auto-generated |
| `petId` | integer | Yes | ID of the pet being ordered |
| `quantity` | integer | No | Number of items (default 1) |
| `shipDate` | string (date-time) | No | Shipping date |
| `status` | string | No | `placed`, `approved`, or `delivered` |
| `complete` | boolean | No | Whether the order is complete |

## Request

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```javascript
const res = await fetch('https://petstore3.swagger.io/api/v3/store/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    petId: 198772,
    quantity: 7,
    shipDate: new Date().toISOString(),
    status: 'placed',
    complete: false,
  }),
});
const order = await res.json();
console.log(order.id);
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests
from datetime import datetime

r = requests.post(
    'https://petstore3.swagger.io/api/v3/store/order',
    json={
        'petId': 198772,
        'quantity': 7,
        'shipDate': datetime.utcnow().isoformat() + 'Z',
        'status': 'placed',
        'complete': False,
    },
)
order = r.json()
print(order['id'])
```

</TabItem>
<TabItem value="curl" label="curl">

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/store/order" \
  -H "Content-Type: application/json" \
  -d '{
    "petId": 198772,
    "quantity": 7,
    "status": "placed",
    "complete": false
  }'
```

</TabItem>
</Tabs>

## Response

Returns the created order with an assigned `id`:

```json
{
  "id": 10,
  "petId": 198772,
  "quantity": 7,
  "shipDate": "2026-03-08T12:00:00.000Z",
  "status": "placed",
  "complete": false
}
```
