---
sidebar_position: 4
title: Error handling
---

# Error handling

The Helix API uses conventional HTTP status codes to indicate success or failure. Codes in the `2xx` range indicate success, `4xx` indicate a client error, and `5xx` indicate a server error.

## Error response format

All errors return a JSON body with a consistent structure:

```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "Your card was declined. Please try a different payment method.",
    "param": "payment_method",
    "request_id": "req_abc123"
  }
}
```

## Error types

| Type | Description |
|---|---|
| `api_error` | An unexpected error on Helix's servers (rare) |
| `authentication_error` | Invalid or missing API key |
| `card_error` | The card was declined or failed verification |
| `invalid_request_error` | The request had invalid parameters |
| `rate_limit_error` | Too many requests in a short period |

## HTTP status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request  - check your parameters |
| `401` | Unauthorized  - invalid API key |
| `402` | Payment failed (card declined, insufficient funds) |
| `404` | Resource not found |
| `429` | Rate limited  - back off and retry |
| `500` | Server error  - retry with exponential backoff |

## Handling errors in code

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```javascript
try {
  const payment = await helix.payments.create({
    amount: 2000,
    currency: 'usd',
    payment_method: 'pm_card_visa',
    confirm: true,
  });
} catch (err) {
  if (err.type === 'card_error') {
    console.log(`Card declined: ${err.message}`);
  } else if (err.type === 'rate_limit_error') {
    // Retry after a delay
  } else {
    console.error(`Unexpected error: ${err.message}`);
  }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
try:
    payment = helix.Payment.create(
        amount=2000,
        currency="usd",
        payment_method="pm_card_visa",
        confirm=True,
    )
except helix.CardError as e:
    print(f"Card declined: {e.user_message}")
except helix.RateLimitError:
    # Retry after a delay
    pass
except helix.HelixError as e:
    print(f"Unexpected error: {e}")
```

</TabItem>
</Tabs>

## Idempotency

To safely retry requests without risking duplicate operations, include an `Idempotency-Key` header:

```bash
curl https://api.helix.dev/v1/payments \
  -H "Authorization: Bearer sk_test_your_key_here" \
  -H "Idempotency-Key: unique-request-id-123" \
  -d '{"amount": 2000, "currency": "usd"}'
```

Helix stores the result of the original request and returns it for any subsequent requests with the same key, for up to 24 hours.
