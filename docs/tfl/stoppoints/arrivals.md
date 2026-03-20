---
sidebar_position: 3
title: Arrivals
---

# Arrivals

`GET /StopPoint/{ids}/Arrivals` returns the next arrivals at a stop.

## Request

```bash
curl "https://api.tfl.gov.uk/StopPoint/490000077G/Arrivals"
```

Use a stop `id` from a search or line route response in place of `490000077G`.

## Response

The response body is a JSON array. Each item typically includes `lineName`, `platformName`, `expectedArrival`, and `timeToStation` (seconds).
