---
sidebar_position: 8
slug: /how-to/admin-dashboard
title: Set up the admin dashboard
description: "How to set up and use the DevDocify admin dashboard for portal configuration, deployment visibility, analytics, and user management."
---

# Set up the admin dashboard

The admin dashboard is a standalone Next.js app that provides a web interface for managing portal configuration, monitoring deployments, viewing analytics, and controlling user access. It uses Supabase for authentication.

## Prerequisites

- Node.js 20 or later.
- A [Supabase](https://supabase.com) project with authentication enabled.
- The `admin/` directory in your DevDocify project.

## 1. Configure Supabase credentials

Copy the example environment file:

```bash
cp admin/.env.local.example admin/.env.local
```

Set the two required values in `admin/.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project **Settings > API > Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project **Settings > API > anon public** key |

Do not commit `.env.local`. It is already in `.gitignore`.

## 2. Set up authentication providers

### Email and password

Email/password authentication works out of the box with Supabase. Create users in the Supabase dashboard under **Authentication > Users**.

### GitHub OAuth

To enable "Continue with GitHub" login:

1. Go to **GitHub > Settings > Developer settings > OAuth Apps** and create a new app.
2. Set the authorization callback URL to `http://localhost:3100/auth/callback` (for local dev) or your production admin URL.
3. In Supabase, go to **Authentication > Providers > GitHub** and enter the client ID and secret from GitHub.

## 3. Run locally

```bash
cd admin
npm install
npm run dev
```

The dashboard runs at `http://localhost:3100`. The docs site runs on port 3000, so both can run simultaneously.

## 4. Dashboard pages

### Dashboard

The home page shows summary stats: portal count, recent deployments, page views, and custom domain count.

### Portals

View and edit portal configuration:

- **Docsets** table showing all registered docsets with route counts and versioning status.
- **Domain configuration** with editable primary domain, alias list, and legacy redirect rules.
- **RBAC assignments** showing role-to-principal mappings.

Changes are validated before save.

### Deployments

Monitor deployment status without switching to Vercel or GitHub:

- **Production deployment** card with commit, timestamp, and live URL.
- **Preview deployments** table with PR numbers, branch names, and preview URLs.
- **Domain verification** status with actionable DNS instructions for unverified domains.

### Analytics

View docs usage with a 7-day or 30-day toggle:

- Page views and search query totals.
- Top pages table ranked by views.
- Per-docset breakdown with traffic share percentages.

### Settings

Manage users and access control:

- List users with current role assignments (admin, maintainer, contributor, viewer).
- Add or remove users and change roles inline.
- View the audit log of access changes.

## 5. Build for production

```bash
cd admin
npm run build
npm run start
```

The production server runs on port 3100. Deploy to your preferred hosting provider (Vercel, Docker, or any Node.js host).
