---
title: Quickstart
sidebar_position: 2
description: Run the core Platzi playground operations with curl.
---

# Quickstart

Run the same operations exposed in the [API playground](/platzi/api-playground).

## 1) List products

```bash
curl "https://api.escuelajs.co/api/v1/products?offset=0&limit=5"
```

## 2) List categories

```bash
curl "https://api.escuelajs.co/api/v1/categories"
```

## 3) Check if an email is available

```bash
curl -X POST "https://api.escuelajs.co/api/v1/users/is-available" \
  -H "content-type: application/json" \
  -d '{"email":"john@mail.com"}'
```

## 4) Login to get tokens

```bash
curl -X POST "https://api.escuelajs.co/api/v1/auth/login" \
  -H "content-type: application/json" \
  -d '{"email":"john@mail.com","password":"changeme"}'
```

## 5) Query locations

```bash
curl "https://api.escuelajs.co/api/v1/locations?size=3"
```

Next: [Authentication](/platzi/getting-started/authentication)
