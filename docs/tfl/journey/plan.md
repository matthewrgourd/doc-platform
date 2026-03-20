---
sidebar_position: 2
title: Plan a journey
---

# Plan a journey

Call `GET /Journey/JourneyResults/{from}/to/{to}` to retrieve route options between two locations.

## Request

Using stop IDs from [Search stops](/tfl/stoppoints/search):

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/1000123/to/1000124"
```

Using coordinates (`lat,lon` for each end):

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/51.5074,-0.1278/to/51.5154,-0.0922"
```

## Response

The response includes journey options with legs, duration, and step-by-step instructions.
