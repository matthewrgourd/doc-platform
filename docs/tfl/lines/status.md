---
sidebar_position: 2
title: Line status
---

# Line status

Get the current status of one or more lines.

## Request

```bash
curl "https://api.tfl.gov.uk/Line/victoria/Status"
```

## Multiple lines

Use comma-separated IDs:

```bash
curl "https://api.tfl.gov.uk/Line/victoria,central,jubilee/Status"
```

## Response

Returns an array of line status objects with `id`, `name`, `lineStatuses` (disruptions, severity), and `created` timestamp.
