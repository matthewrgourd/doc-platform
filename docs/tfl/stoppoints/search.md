---
sidebar_position: 2
title: Search stops
---

# Search stops

Find stops and stations by name.

## Request

```bash
curl "https://api.tfl.gov.uk/StopPoint/Search/waterloo"
```

## Response

Returns matching stop points with `id`, `name`, `lat`, `lon`, `modes`, and other metadata.
