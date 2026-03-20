---
sidebar_position: 3
title: Line routes
---

# Line routes

Use `GET /Line/{ids}/Route` to retrieve the route and stop sequence for one or more lines.

## Request

```bash
curl "https://api.tfl.gov.uk/Line/victoria/Route"
```

## Response

The response includes route geometry, ordered stop points, and line metadata.
