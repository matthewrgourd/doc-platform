---
sidebar_position: 2
title: Plan a journey
---

# Plan a journey

Get route options between two locations.

## Request

Using stop IDs (from StopPoint Search):

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/1000123/to/1000124?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

Using coordinates:

```bash
curl "https://api.tfl.gov.uk/Journey/JourneyResults/51.5074,-0.1278/to/51.5154,-0.0922?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Response

Returns journey options with legs, duration, and step-by-step instructions.
