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
| `401` | Unauthorized - invalid or missing credentials (secured environments) |
| `404` | Resource not found |
| `429` | Rate limited - reduce request frequency |
| `500` | Server error - retry later |

## Authentication errors

In this demo, curated playground endpoints are configured for unauthenticated use. If you call secured endpoints in your own environment, include valid credentials to avoid `401` responses.
