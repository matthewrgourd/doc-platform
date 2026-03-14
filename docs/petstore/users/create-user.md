---
sidebar_position: 2
title: Create a user
---

# Create a user

Create a new user with a POST request to `/user`, or create multiple users with `/user/createWithList`.

## Create a single user

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/user" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "theUser",
    "firstName": "John",
    "lastName": "James",
    "email": "john@email.com",
    "password": "12345",
    "phone": "12345",
    "userStatus": 1
  }'
```

## Create multiple users

Send an array of user objects:

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/user/createWithList" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "username": "user1",
      "firstName": "Alice",
      "lastName": "Smith",
      "email": "alice@example.com",
      "password": "secret",
      "userStatus": 1
    },
    {
      "username": "user2",
      "firstName": "Bob",
      "lastName": "Jones",
      "email": "bob@example.com",
      "password": "secret",
      "userStatus": 1
    }
  ]'
```

## Response

Both endpoints return the created user object(s) on success.
