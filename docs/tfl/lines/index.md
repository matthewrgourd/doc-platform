---
sidebar_position: 1
slug: /lines
title: Lines
---

# Lines

Query Tube, rail, and other line data. The [API playground](/tfl/api-playground) highlights **line status by mode** (`GET /Line/Mode/{modes}/Status`).

## Line modes

| Mode | Description |
|---|---|
| tube | London Underground |
| bus | London Buses |
| dlr | Docklands Light Railway |
| overground | London Overground |
| national-rail | National Rail |
| tram | Tramlink |

## Playground endpoint (documented in this site’s OpenAPI)

- **Line status by mode** — `GET /Line/Mode/{modes}/Status` — [Guide](/tfl/lines/status) — included in **[tfl-playground.json](/openapi/tfl-playground.json)**

## Other endpoints on the live API

These are common on `api.tfl.gov.uk` but **not** part of the downloadable playground spec:

- `GET /Line/{ids}/Status` — status for specific line IDs
- `GET /Line/{ids}/Route` — route geometry and stops
- `GET /Line/Mode/{modes}` — line metadata by mode

## Guides

- [**Line status by mode**](/tfl/lines/status) — playground **GET** with full reference
- [**Line routes**](/tfl/lines/routes) — additional TfL route examples (outside playground spec)
