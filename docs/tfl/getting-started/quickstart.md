---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Get your first TfL API response in under 5 minutes.

## Prerequisites

- Register at [TfL API](https://api.tfl.gov.uk) for an Application ID and Key
- A tool to make HTTP requests (curl, Postman, or the [API playground](/tfl/api-reference))

## 1. Get line status

Fetch the status of the Victoria line:

```bash
curl "https://api.tfl.gov.uk/Line/victoria/Status?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## 2. Search for stops

Find stops by name:

```bash
curl "https://api.tfl.gov.uk/StopPoint/Search/oxford%20circus?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## 3. Get bike point data

List cycle hire docking stations:

```bash
curl "https://api.tfl.gov.uk/BikePoint?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Next steps

- [Lines](/tfl/lines) - Line status, routes, and disruptions
- [StopPoints](/tfl/stoppoints) - Search stops and get arrivals
- [Journey](/tfl/journey) - Plan routes between locations
