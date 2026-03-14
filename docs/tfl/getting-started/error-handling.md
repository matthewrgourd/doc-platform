---
sidebar_position: 4
title: Error handling
---

# Error handling

The TfL API uses conventional HTTP status codes. Codes in the `2xx` range indicate success, `4xx` indicate a client error, and `5xx` indicate a server error.

## HTTP status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request - check your parameters |
| `401` | Unauthorized - invalid or missing app_id/app_key |
| `404` | Resource not found |
| `429` | Rate limited - reduce request frequency |
| `500` | Server error - retry later |

## Missing credentials

If you omit `app_id` or `app_key`, the API returns an error. Ensure both parameters are included in every request.
