---
sidebar_position: 3
title: Authentication
---

# Authentication

The TfL API uses Application ID and Key for authentication. Register at [api.tfl.gov.uk](https://api.tfl.gov.uk) to obtain credentials.

## Query parameters

Append `app_id` and `app_key` to every request:

```bash
curl "https://api.tfl.gov.uk/Line/victoria/Status?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Rate limits

TfL applies rate limits to protect the API. For high-volume use, contact TfL about commercial access.

:::tip Try it in the playground
The [API reference](/tfl/api-reference) includes an interactive playground. Add your credentials to try authenticated requests.
:::
