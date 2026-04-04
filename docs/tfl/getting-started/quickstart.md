---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Get your first TfL API responses in under 5 minutes using the same operations as the [API playground](/tfl/api-playground).

## Prerequisites

- A tool to make HTTP requests (curl, Postman, or the [API playground](/tfl/api-playground))
- No account required for these demo operations

## OpenAPI description

**[Download `tfl-playground.json`](/openapi/tfl-playground.json)** — OpenAPI 3.0.3 description of all playground operations.

## 1. Get line status

`GET /Line/Mode/{modes}/Status` — fetch status for all lines in a mode (for example tube):

```bash
curl "https://api.tfl.gov.uk/Line/Mode/tube/Status"
```

Optional query: `detail=true` for richer disruption detail when the API supports it.

## 2. Search for stops

`GET /StopPoint/Search/{query}` — find stops and stations by name:

```bash
curl "https://api.tfl.gov.uk/StopPoint/Search/waterloo"
```

## 3. Get bike point data

`GET /BikePoint` — list cycle hire docking stations:

```bash
curl "https://api.tfl.gov.uk/BikePoint"
```

## 4. Get air quality forecast

`GET /AirQuality` — current and forecast air quality for London, no parameters required:

```bash
curl "https://api.tfl.gov.uk/AirQuality"
```

## 5. Plan a journey

`GET /Journey/JourneyResults/{from}/to/{to}` — route options between two points using stop IDs:

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/1000032/to/1000123"
```

`1000032` is King's Cross St. Pancras and `1000123` is London Waterloo. You can also use postcodes or free-text place names.

## Next steps

- [Line status by mode](/tfl/lines/status) — full reference for `GET /Line/Mode/{modes}/Status`
- [Search stops](/tfl/stoppoints/search) — full reference for `GET /StopPoint/Search/{query}`
- [Bike points](/tfl/getting-started/bike-point) — full reference for `GET /BikePoint`
- [Air quality](/tfl/getting-started/air-quality) — full reference for `GET /AirQuality`
- [Plan a journey](/tfl/journey/plan) — full reference for journey planning
- [Authentication](./authentication) — no credentials on this demo; rate limiting notes
- [Error handling](./error-handling) — HTTP codes
