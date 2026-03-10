---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Process your first test payment in under 5 minutes.

## Prerequisites

- An Helix account ([sign up](https://dashboard.helix.dev))
- Your test API key (available in the Dashboard under **Developers → API keys**)

## 1. Install the SDK

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```bash
npm install @helix/node
```

</TabItem>
<TabItem value="python" label="Python">

```bash
pip install helix-python
```

</TabItem>
<TabItem value="go" label="Go">

```bash
go get github.com/helix/helix-go
```

</TabItem>
</Tabs>

## 2. Create a payment

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```javascript
import Helix from '@helix/node';

const helix = new Helix('sk_test_your_key_here');

const payment = await helix.payments.create({
  amount: 2000,
  currency: 'usd',
  description: 'Order #1234',
  payment_method: 'pm_card_visa',
  confirm: true,
});

console.log(payment.id);     // pay_1a2b3c4d
console.log(payment.status); // "succeeded"
```

</TabItem>
<TabItem value="python" label="Python">

```python
import helix

helix.api_key = "sk_test_your_key_here"

payment = helix.Payment.create(
    amount=2000,
    currency="usd",
    description="Order #1234",
    payment_method="pm_card_visa",
    confirm=True,
)

print(payment.id)      # pay_1a2b3c4d
print(payment.status)  # "succeeded"
```

</TabItem>
<TabItem value="go" label="Go">

```go
package main

import (
    "fmt"
    "github.com/helix/helix-go"
)

func main() {
    client := helix.NewClient("sk_test_your_key_here")

    payment, _ := client.Payments.Create(&helix.PaymentParams{
        Amount:        helix.Int64(2000),
        Currency:      helix.String("usd"),
        Description:   helix.String("Order #1234"),
        PaymentMethod: helix.String("pm_card_visa"),
        Confirm:       helix.Bool(true),
    })

    fmt.Println(payment.ID)     // pay_1a2b3c4d
    fmt.Println(payment.Status) // "succeeded"
}
```

</TabItem>
</Tabs>

## 3. Verify the result

A successful payment returns a `Payment` object with `status: "succeeded"`. You'll also receive a `payment.succeeded` webhook if you've [configured webhooks](/payments/webhooks).

:::tip Test cards
Use these card numbers in test mode:

| Card | Number | Behaviour |
|---|---|---|
| Visa (success) | `4242 4242 4242 4242` | Always succeeds |
| Visa (decline) | `4000 0000 0000 0002` | Always declines |
| 3D Secure | `4000 0027 6000 3184` | Requires authentication |
:::

## Next steps

- [Accept a Payment](/payments/accept-a-payment)  - Build a complete server-side payment flow
- [Error Handling](./error-handling)  - Handle declines and failures gracefully
- [Webhooks](/payments/webhooks)  - Receive real-time payment notifications
