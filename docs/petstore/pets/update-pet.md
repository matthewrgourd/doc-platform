---
sidebar_position: 4
title: Update a pet
---

# Update a pet

Update an existing pet by ID. Use PUT to replace the entire pet, or POST with form data for partial updates.

## Update with PUT

Send the full pet object. The `id` in the body must match the pet you're updating:

```bash
curl -X PUT "https://petstore3.swagger.io/api/v3/pet" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "doggie",
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "sold"
  }'
```

## Update with form data (POST)

For partial updates, use POST to `/pet/{petId}` with form fields:

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/pet/1" \
  -d "name=Updated%20Name" \
  -d "status=pending"
```

| Field | Description |
|---|---|
| `name` | New pet name |
| `status` | New status (`available`, `pending`, `sold`) |

Only include the fields you want to change.
