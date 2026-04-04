---
sidebar_position: 2
title: Plan a journey
---

# Plan a journey

`GET /Journey/JourneyResults/{from}/to/{to}` returns route options between two points across all TfL modes.

## Operation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/Journey/JourneyResults/{from}/to/{to}` |
| **Base URL** | `https://api.tfl.gov.uk` |

## Parameters

| Name | In | Required | Description |
|---|---|---|---|
| `from` | path | Yes | Origin — stop point ID, postcode, or place name |
| `to` | path | Yes | Destination — stop point ID, postcode, or place name |
| `mode` | query | No | Comma-separated modes to include (for example `tube,bus`) |
| `timeIs` | query | No | Whether `time` is `Departing` or `Arriving` (default: `Departing`) |
| `date` | query | No | Journey date in `YYYYMMDD` format |
| `time` | query | No | Journey time in `HHmm` format |

## Responses

| Code | Description |
|---|---|
| `200` | Success — JSON object with an array of journey options. |
| `300` | Disambiguation — `from` or `to` matched multiple locations; response lists candidates. |
| `400` | Bad request — `from` or `to` could not be resolved. |
| `429` | Rate limited — see [Authentication](../getting-started/authentication). |
| `500` | Server error — retry with backoff. |

## Example requests

Using stop IDs (recommended for precision):

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/1000032/to/1000123"
```

`1000032` is King's Cross St. Pancras. `1000123` is London Waterloo. Use [Search stops](/tfl/stoppoints/search) to find IDs for other stations.

Using postcodes:

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/WC1X8DS/to/SW1A2AA"
```

Filtering by mode:

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/1000032/to/1000123?mode=tube"
```

## Example response (abbreviated)

```json
{
  "journeys": [
    {
      "startDateTime": "2024-03-20T09:00:00",
      "arrivalDateTime": "2024-03-20T09:22:00",
      "duration": 22,
      "legs": [
        {
          "summary": "Take Jubilee line towards Waterloo",
          "mode": { "id": "tube", "name": "Tube" },
          "departureTime": "2024-03-20T09:05:00",
          "arrivalTime": "2024-03-20T09:22:00",
          "duration": 17
        }
      ]
    }
  ]
}
```

Leg and journey shapes include additional properties — always parse defensively.

## Related

- [Quickstart](../getting-started/quickstart) — runs this operation as step 5
- [Search stops](/tfl/stoppoints/search) — get stop IDs to use as `from` and `to`
- [API playground](/tfl/api-playground) — try it in the browser
