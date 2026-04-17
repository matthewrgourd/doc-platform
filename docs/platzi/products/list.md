---
title: List and paginate
sidebar_position: 2
description: Retrieve product lists with offset and limit.
---

# List and paginate products

Use `GET /products` with `offset` and `limit`.

## Example

```bash
curl "https://api.escuelajs.co/api/v1/products?offset=0&limit=10"
```

## Notes

- `offset` controls how many records to skip.
- `limit` controls max records returned.
- Data can change because this is a shared public demo API.
