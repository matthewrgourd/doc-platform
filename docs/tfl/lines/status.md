---
sidebar_position: 2
title: Line status by mode
---

# Line status by mode

`GET /Line/Mode/{modes}/Status` returns real-time status and disruption information for all lines that belong to one or more **modes** (for example `tube` for London Underground). This is the **Lines** operation included in the [API playground](/tfl/api-playground).

## OpenAPI description (playground scope)

**[Download `tfl-playground.json`](/openapi/tfl-playground.json)** — documents this path plus `GET /StopPoint/Search/{query}` and `GET /BikePoint` only.

## Resource

Each item in the response array represents a **line** with identifiers, display name, mode, and nested `lineStatuses` (severity, disruption text, and related metadata). Additional fields may appear; clients should tolerate unknown properties.

## Operation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/Line/Mode/{modes}/Status` |
| **Base URL** | `https://api.tfl.gov.uk` |

## Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `modes` | Path | Yes | Comma-separated mode identifiers (no spaces). Examples: `tube`, `bus`, `dlr`, `overground`, `tram`, `national-rail`. |
| `detail` | Query | No | If `true`, requests richer disruption detail where the API supports it. Default `false`. |

## Responses

| Code | Description |
|---|---|
| `200` | Success — JSON array of line status objects. |
| `400` | Bad request — unknown or malformed `modes`. |
| `404` | No data for the requested combination. |
| `429` | Rate limited. |
| `500` | Server error. |

## Example requests

Single mode:

```bash
curl "https://api.tfl.gov.uk/Line/Mode/tube/Status"
```

Multiple modes:

```bash
curl "https://api.tfl.gov.uk/Line/Mode/tube,dlr/Status"
```

With detail:

```bash
curl "https://api.tfl.gov.uk/Line/Mode/tube/Status?detail=true"
```

## Other TfL line endpoints

The full Unified API also exposes paths such as `GET /Line/{ids}/Status` for specific line IDs. Those are **not** in the playground OpenAPI file; use TfL's full documentation when you need that surface.
