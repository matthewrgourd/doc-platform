---
sidebar_position: 5
title: Delete a pet
---

# Delete a pet

Remove a pet from the store with a DELETE request.

## Request

```bash
curl -X DELETE "https://petstore3.swagger.io/api/v3/pet/1"
```

## API key (optional)

Some servers may require an API key in the header for delete operations:

```bash
curl -X DELETE "https://petstore3.swagger.io/api/v3/pet/1" \
  -H "api_key: YOUR_API_KEY"
```

## Response

- **200**: Pet deleted successfully
- **400**: Invalid pet value
- **404**: Pet not found
