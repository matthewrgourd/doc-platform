---
sidebar_position: 2
title: Search stops
---

# Search stops

`GET /StopPoint/Search/{query}` finds stops and stations whose names or metadata match a free-text **query** (for example `waterloo`). This is the **Stop points** operation included in the [API playground](/tfl/api-playground).

## OpenAPI description (playground scope)

**[Download `tfl-playground.json`](/openapi/tfl-playground.json)** — documents this path plus `GET /Line/Mode/{modes}/Status` and `GET /BikePoint` only.

## Resource

The response is a **search result** object containing matches (with identifiers, names, coordinates, modes, and other fields). The exact JSON shape can evolve; treat unknown properties as optional.

## Operation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/StopPoint/Search/{query}` |
| **Base URL** | `https://api.tfl.gov.uk` |

## Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `query` | Path | Yes | Search text; URL-encode spaces and special characters. |

## Responses

| Code | Description |
|---|---|
| `200` | Success — JSON object with matches (may be empty). |
| `400` | Bad request — invalid or empty query after decoding. |
| `404` | No matches. |
| `429` | Rate limited. |
| `500` | Server error. |

## Example request

```bash
curl "https://api.tfl.gov.uk/StopPoint/Search/waterloo"
```

## Response (illustrative)

The payload includes structured matches; typical fields on each match include `id`, `name`, `lat`, `lon`, and `modes`. Confirm against a live response when building parsers.

## Related

- [Bike points](/tfl/getting-started/bike-point) — companion playground **GET** for cycle hire
- [Line status by mode](/tfl/lines/status) — companion playground **GET** for disruptions
