---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Get your first TfL API response in under 5 minutes.

## Prerequisites

- A tool to make HTTP requests (curl, Postman, or the [API playground](/tfl/api-playground))
- No account required for these demo operations

## 1. Get line status

Fetch tube line status:

```bash
curl "https://api.tfl.gov.uk/Line/Mode/tube/Status"
```

## 2. Search for stops

Find stops by name:

```bash
curl "https://api.tfl.gov.uk/StopPoint/Search/waterloo"
```

## 3. Get bike point data

List cycle hire docking stations:

```bash
curl "https://api.tfl.gov.uk/BikePoint"
```

## Next steps

- [Lines](/tfl/lines) - Line status, routes, and disruptions
- [Stop points](/tfl/stoppoints) - Search stops and get arrivals
- [Journey](/tfl/journey) - Plan routes between locations
