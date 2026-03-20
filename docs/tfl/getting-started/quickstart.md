---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Get your first TfL API response in under 5 minutes using the same **GET** operations as the [API playground](/tfl/api-playground).

## Prerequisites

- A tool to make HTTP requests (curl, Postman, or the [API playground](/tfl/api-playground))
- No account required for these demo operations

## OpenAPI description

**[Download `tfl-playground.json`](/openapi/tfl-playground.json)** — OpenAPI 3.0.3, playground **GET** subset only.

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

## Next steps

- [Line status by mode](/tfl/lines/status) — full reference for the mode status **GET**
- [Search stops](/tfl/stoppoints/search) — full reference for stop search **GET**
- [Bike points](/tfl/getting-started/bike-point) — full reference for **GET /BikePoint**
- [Authentication](./authentication) — no credentials on this demo; rate limiting notes
- [Error handling](./error-handling) — HTTP codes
