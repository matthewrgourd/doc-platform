---
sidebar_position: 1
slug: /getting-started
title: Overview
---

# Overview

The Transport for London (TfL) Unified API provides real-time data for London's transport network: Tube, bus, cycle hire, roads, and more.

## Choose your path

<div className="grid-cards">

| Path | Description | Time |
|---|---|---|
| [**Quickstart**](/tfl/getting-started/quickstart) | Get your first API response in under 5 minutes | ~5 min |
| [**Lines**](/tfl/lines) | Explore Tube and rail line data | ~15 min |
| [**StopPoints**](/tfl/stoppoints) | Find stops and stations | ~15 min |
| [**Journey**](/tfl/journey) | Plan routes between locations | ~20 min |

</div>

## How the API works

```mermaid
sequenceDiagram
    participant Your App
    participant TfL API

    Your App->>TfL API: GET /Line/{ids} (with app_id & app_key)
    TfL API-->>Your App: Line status

    Your App->>TfL API: GET /StopPoint/Search
    TfL API-->>Your App: Stop results

    Your App->>TfL API: GET /Journey/JourneyResults
    TfL API-->>Your App: Route options
```

## Base URL

All API requests are made to:

```
https://api.tfl.gov.uk
```

You must register for an Application ID and Key and append them as query parameters: `app_id` and `app_key`.

## API reference

Use the [API reference](/tfl/api-reference) to explore all endpoints, try requests in the browser, and view response schemas.
