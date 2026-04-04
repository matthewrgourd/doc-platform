---
sidebar_position: 4
title: Air quality
---

# Air quality

`GET /AirQuality` returns the current air quality forecast for London, including pollution index levels and health advice for sensitive groups.

## Operation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/AirQuality` |
| **Base URL** | `https://api.tfl.gov.uk` |

## Parameters

None. The endpoint returns the current forecast without any required input.

## Responses

| Code | Description |
|---|---|
| `200` | Success — JSON object with forecast periods and pollutant levels. |
| `429` | Rate limited — slow down; see [Authentication](./authentication). |
| `500` | Server error — retry with backoff. |

## Example request

```bash
curl "https://api.tfl.gov.uk/AirQuality"
```

## Example response (abbreviated)

```json
{
  "updatePeriod": "daily",
  "forecastURL": "https://www.londonair.org.uk/forecast",
  "currentForecast": [
    {
      "forecastType": "Current",
      "forecastID": "low",
      "forecastBand": "Low",
      "forecastSummary": "Low air pollution forecast valid...",
      "nO2Band": "Low",
      "o3Band": "Low",
      "pM10Band": "Low",
      "pM25Band": "Low",
      "sO2Band": "Low"
    }
  ]
}
```

Forecast band values are typically `Low`, `Moderate`, `High`, or `Very High`. Parse defensively — additional properties may be present.

## Related

- [Quickstart](./quickstart) — runs this operation as step 4
- [API playground](/tfl/api-playground) — try it in the browser
