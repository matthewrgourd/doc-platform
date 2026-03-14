---
sidebar_position: 1
slug: /lines
title: Lines
---

# Lines

Query Tube, rail, and other line data. Get real-time status, routes, and disruption information.

## Line modes

| Mode | Description |
|---|---|
| tube | London Underground |
| bus | London Buses |
| dlr | Docklands Light Railway |
| overground | London Overground |
| national-rail | National Rail |
| tram | Tramlink |

## Key endpoints

- **Line status** - `GET /Line/{ids}/Status` - Current status and disruptions
- **Line routes** - `GET /Line/{ids}/Route` - Route geometry and stops
- **All lines** - `GET /Line/Mode/{modes}` - Lines by mode

## Guides

- [**Line status**](/tfl/lines/status) - Get real-time line status
- [**Line routes**](/tfl/lines/routes) - Retrieve route and stop sequences
