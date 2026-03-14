---
sidebar_position: 4
title: Cancel an order
---

# Cancel an order

Delete an order with a DELETE request to `/store/order/{orderId}`.

## Request

```bash
curl -X DELETE "https://petstore3.swagger.io/api/v3/store/order/1"
```

## Valid IDs

Use IDs `< 1000` for successful deletion. IDs `>= 1000` or non-integer values generate API errors.

## Response

- **200**: Order deleted successfully
- **400**: Invalid ID supplied
- **404**: Order not found
