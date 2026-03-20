---
sidebar_position: 5
title: Inventory
---

# Inventory

The response body is a map of pet status codes to quantities. The sample server requires an API key for this endpoint.

## Request

```bash
curl "https://petstore3.swagger.io/api/v3/store/inventory" \
  -H "api_key: YOUR_API_KEY"
```

## Response

```json
{
  "available": 15,
  "pending": 3,
  "sold": 42
}
```

Keys are pet status values (`available`, `pending`, `sold`). Values are the count of pets in each status.
