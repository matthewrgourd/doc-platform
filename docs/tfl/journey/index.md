---
sidebar_position: 1
slug: /journey
title: Journey
---

# Journey

Plan routes between two locations using public transport.

## Key endpoints

- **Journey results** - `GET /Journey/JourneyResults/{from}/to/{to}` - Plan a route
- **Meta** - `GET /Journey/Meta/Modes` - Available journey modes

## Parameters

| Parameter | Description |
|---|---|
| `from` | Origin stop ID or lat,lon |
| `to` | Destination stop ID or lat,lon |
| `mode` | Transport modes (tube, bus, etc.) |
| `date` | Date for journey (YYYYMMDD) |
| `time` | Time for journey (HHmm) |

## Guides

- [**Plan a journey**](/tfl/journey/plan) - Get route options between two points
