---
sidebar_position: 1
slug: /getting-started
title: Overview
---

# Overview

The Transport for London (TfL) Unified API provides real-time transport data, including line status, stop search, and cycle hire locations.

## Choose your path

<div className="grid-cards">

| Path | Description | Time |
|---|---|---|
| [**Quickstart**](/tfl/getting-started/quickstart) | Get your first API response in under 5 minutes | ~5 min |
| [**Lines**](/tfl/lines) | Explore Tube and rail line data | ~15 min |
| [**Stop points**](/tfl/stoppoints) | Find stops and stations | ~15 min |
| [**Journey**](/tfl/journey) | Plan routes between locations | ~20 min |

</div>

## How the API works

```mermaid
sequenceDiagram
    participant Your App
    participant TfL API

    Your App->>TfL API: GET /Line/Mode/{modes}/Status
    TfL API-->>Your App: Line status

    Your App->>TfL API: GET /StopPoint/Search/{query}
    TfL API-->>Your App: Stop results

    Your App->>TfL API: GET /BikePoint
    TfL API-->>Your App: Bike point results
```

## Base URL

All API requests are made to:

```
https://api.tfl.gov.uk
```

For this demo site, playground examples use public endpoints that don't require credentials.

## API playground

Use the [API playground](/tfl/api-playground) to run three curated demo endpoints in the browser:

- `GET /Line/Mode/{modes}/Status`
- `GET /StopPoint/Search/{query}`
- `GET /BikePoint`

These playground examples are configured with sample values and don't require authentication.
