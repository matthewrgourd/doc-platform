---
sidebar_position: 3
title: Authentication
---

# Authentication

The Helix API uses API keys to authenticate requests. You can manage your keys in the [Dashboard](https://dashboard.helix.dev/developers).

## API key types

| Key type | Prefix | Use case |
|---|---|---|
| **Secret key** | `sk_test_` / `sk_live_` | Server-side API calls (never expose to clients) |
| **Publishable key** | `pk_test_` / `pk_live_` | Client-side SDKs and Helix.js |

:::danger Keep secret keys safe
Your secret key can perform any API operation. Never expose it in client-side code, commit it to version control, or share it in plain text.
:::

## Authenticating requests

Include your secret key in the `Authorization` header as a Bearer token:

```bash
curl https://api.helix.dev/v1/payments \
  -H "Authorization: Bearer sk_test_your_key_here" \
  -H "Content-Type: application/json"
```

## Test mode vs live mode

Every account has separate test and live credentials. Test mode uses `sk_test_` and `pk_test_` prefixes and processes simulated transactions. No real money moves in test mode.

Switch to live mode by replacing your test keys with live keys. No other code changes are required.

```mermaid
graph LR
    A[Test mode] -->|Replace API keys| B[Live mode]
    A -->|sk_test_xxx| C[Simulated transactions]
    B -->|sk_live_xxx| D[Real transactions]
```

## Key rotation

To rotate a key without downtime:

1. Generate a new key in the Dashboard
2. Update your application to use the new key
3. Verify transactions succeed with the new key
4. Revoke the old key

Both keys remain valid until you explicitly revoke the old one.
