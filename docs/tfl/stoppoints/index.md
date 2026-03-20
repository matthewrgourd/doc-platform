---
sidebar_position: 1
slug: /stoppoints
title: Stop points
---

# Stop points

Search for stops and stations, and get real-time arrivals. The [API playground](/tfl/api-playground) includes **stop search** only.

## Playground endpoint (in this site’s OpenAPI)

- **Search** — `GET /StopPoint/Search/{query}` — [Guide](/tfl/stoppoints/search) — **[tfl-playground.json](/openapi/tfl-playground.json)**

## Other endpoints on the live API

These aren't in the downloadable playground spec:

- **Arrivals** — `GET /StopPoint/{ids}/Arrivals` — [Arrivals guide](/tfl/stoppoints/arrivals)
- **By ID** — `GET /StopPoint/{ids}` — stop details

Cycle hire listing for the demo is documented under [Bike points](/tfl/getting-started/bike-point) (`GET /BikePoint`).

## Guides

- [**Search stops**](/tfl/stoppoints/search) — playground **GET** with full reference
- [**Arrivals**](/tfl/stoppoints/arrivals) — next departures (outside playground spec)
