---
sidebar_position: 4
title: Manage users
---

# Manage users

Get, update, and delete users by username.

## Get user by username

```bash
curl "https://petstore3.swagger.io/api/v3/user/user1"
```

Use `user1` for testing. Returns 404 if the user isn't found.

## Update user

Send a PUT request with the full user object. The `username` in the path identifies the user to update:

```bash
curl -X PUT "https://petstore3.swagger.io/api/v3/user/user1" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 10,
    "username": "user1",
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@example.com",
    "password": "newpassword",
    "phone": "555-1234",
    "userStatus": 1
  }'
```

## Delete user

```bash
curl -X DELETE "https://petstore3.swagger.io/api/v3/user/user1"
```

On success you receive `200`. You may receive `400` for an invalid username or `404` if the user isn't found.
