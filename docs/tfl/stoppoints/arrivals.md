---
sidebar_position: 3
title: Arrivals
---

# Arrivals

Get the next arrivals at a stop.

## Request

```bash
curl "https://api.tfl.gov.uk/StopPoint/490000077G/Arrivals?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

Use the stop `id` from a search or line route response.

## Response

Returns an array of arrivals with `lineName`, `platformName`, `expectedArrival`, and `timeToStation` (seconds).
