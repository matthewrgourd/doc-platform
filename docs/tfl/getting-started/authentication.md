---
sidebar_position: 4
title: Authentication
---

# Authentication

The TfL demo playground doesn't require authentication. It uses public GET examples with prefilled values.

## Playground behavior

The [API playground](/tfl/api-playground) includes these unauthenticated demo endpoints:

- `GET /Line/Mode/{modes}/Status`
- `GET /StopPoint/Search/{query}`
- `GET /BikePoint`

Their contract is defined only in **[tfl-playground.json](/openapi/tfl-playground.json)** (downloadable from this site). That file isn't the full TfL Unified API description.

## Rate limits

Anonymous public traffic can be **rate limited**. If you receive `429 Too Many Requests`, reduce how often you call the API, add backoff between retries, and cache responses where you can.
