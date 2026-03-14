---
sidebar_position: 2
title: Search stops
---

# Search stops

Find stops and stations by name.

## Request

```bash
curl "https://api.tfl.gov.uk/StopPoint/Search/oxford%20circus?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Response

Returns matching stop points with `id`, `name`, `lat`, `lon`, `modes`, and other metadata.
