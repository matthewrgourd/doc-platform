---
sidebar_position: 3
title: Bike points
---

# Bike points

`GET /BikePoint` returns Santander Cycles (cycle hire) docking stations with locations and availability. It's one of the three **GET** operations in the [API playground](/tfl/api-playground).

## OpenAPI description (playground scope)

**[Download `tfl-playground.json`](/openapi/tfl-playground.json)** — includes this path plus `GET /Line/Mode/{modes}/Status` and `GET /StopPoint/Search/{query}` only.

## Resource

A **bike point** is a docking station. The live API returns identifiers, names, coordinates, and fields for available bikes and empty slots (exact property names vary; parse defensively).

## Operation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/BikePoint` |
| **Base URL** | `https://api.tfl.gov.uk` |

## Parameters

None required for this list operation on the public API.

## Responses

| Code | Description |
|---|---|
| `200` | Success — JSON array of bike point objects. |
| `429` | Rate limited — slow down; see [Authentication](./authentication). |
| `500` | Server error — retry with backoff. |

## Example request

```bash
curl "https://api.tfl.gov.uk/BikePoint"
```

## Related

- [Quickstart](./quickstart) — runs this **GET** as step 3
- [Search stops](/tfl/stoppoints/search) — companion playground **GET** for stop search
