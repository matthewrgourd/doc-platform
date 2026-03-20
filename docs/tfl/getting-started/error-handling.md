---
sidebar_position: 5
title: Error handling
---

# Error handling

The TfL API uses conventional HTTP status codes. Codes in the `2xx` range indicate success, `4xx` indicate a client error, and `5xx` indicate a server error.

For the three playground **GET** operations, see response codes in **[tfl-playground.json](/openapi/tfl-playground.json)**.

## HTTP status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request. Check your parameters. |
| `401` | Unauthorized. Invalid or missing credentials (secured environments). |
| `404` | Resource not found. |
| `429` | Rate limited. Reduce request frequency. |
| `500` | Server error. Retry later. |

## Authentication errors

This demo uses public, unauthenticated **GET** requests only. A `401` response would mean the upstream service changed policy for your request path; it isn't expected for the three playground operations documented on this site.

## Rate limiting

If you receive `429`, slow down and cache results where possible. See [Authentication](./authentication).
