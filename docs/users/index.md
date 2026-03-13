---
sidebar_position: 1
slug: /users
title: Users
---

# Users

Create and manage user accounts. Users can log in to access the store.

## User object

| Field | Type | Description |
|---|---|---|
| `id` | integer | User ID |
| `username` | string | Login name |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `email` | string | Email address |
| `password` | string | Password (plain text in API) |
| `phone` | string | Phone number |
| `userStatus` | integer | User status |

## Guides

- [**Create a user**](/users/create-user) - Add a new user
- [**Login and logout**](/users/login) - Authenticate users
- [**Manage users**](/users/manage-user) - Get, update, and delete users
