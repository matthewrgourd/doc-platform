---
sidebar_position: 3
title: Authentication
---

# Authentication

The demo playground on this site doesn't require authentication. It uses public GET examples with prefilled values.

## Playground behavior

The [API playground](/tfl/api-playground) includes these unauthenticated demo endpoints:

- `GET /Line/Mode/{modes}/Status`
- `GET /StopPoint/Search/{query}`
- `GET /BikePoint`

## Authentication for extended usage

If you expand beyond the curated demo, use your TfL credentials where required:

```bash
curl "https://api.tfl.gov.uk/Line/victoria/Status?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Rate limits

TfL applies rate limits to protect the API. For high-volume use, contact TfL about commercial access.
