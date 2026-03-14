---
sidebar_position: 3
title: Get order by ID
---

# Get order by ID

Retrieve an order by its ID with a GET request to `/store/order/{orderId}`.

## Request

```bash
curl "https://petstore3.swagger.io/api/v3/store/order/1"
```

## Valid IDs

For the public Petstore server, use IDs `<= 5` or `> 10` for valid responses. IDs between 6 and 10 may generate exceptions.

## Response

```json
{
  "id": 1,
  "petId": 198772,
  "quantity": 7,
  "shipDate": "2026-03-08T12:00:00.000Z",
  "status": "approved",
  "complete": false
}
```

## Errors

- **400**: Invalid ID supplied
- **404**: Order not found
