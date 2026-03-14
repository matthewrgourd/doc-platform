---
sidebar_position: 2
title: Line status
---

# Line status

Get the current status of one or more lines.

## Request

```bash
curl "https://api.tfl.gov.uk/Line/victoria/Status?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Multiple lines

Use comma-separated IDs:

```bash
curl "https://api.tfl.gov.uk/Line/victoria,central,jubilee/Status?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY"
```

## Response

Returns an array of line status objects with `id`, `name`, `lineStatuses` (disruptions, severity), and `created` timestamp.
