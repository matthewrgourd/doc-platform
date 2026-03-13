---
sidebar_position: 3
title: Authentication
---

# Authentication

Some Petstore endpoints require authentication. The API supports two methods: OAuth2 and API key.

## OAuth2 (pet operations)

For pet endpoints that require `write:pets` or `read:pets` scopes, use OAuth2 implicit flow:

1. Redirect users to the authorization URL with your client ID and scopes
2. The user approves access
3. Your app receives an access token in the callback
4. Include the token in the `Authorization` header as a Bearer token

```bash
curl "https://petstore3.swagger.io/api/v3/pet/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## API key (store inventory)

The store inventory endpoint uses an API key in the header:

```bash
curl "https://petstore3.swagger.io/api/v3/store/inventory" \
  -H "api_key: YOUR_API_KEY"
```

:::tip Try it in the playground
The [API reference](/api-reference) includes an interactive playground. Click "Authorize" to add your credentials and try authenticated requests.
:::

## Public endpoints

Many endpoints work without authentication:

- `GET /pet/findByStatus` - Find pets by status
- `GET /pet/{petId}` - Get pet by ID (some servers allow unauthenticated access)
- `POST /store/order` - Place an order
- `GET /store/order/{orderId}` - Get order by ID
- `GET /user/login` - Log in
- `GET /user/{username}` - Get user by username

Check the API reference for each endpoint's requirements.
