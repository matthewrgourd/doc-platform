---
sidebar_position: 8
slug: /how-to/admin-dashboard
title: Set up the admin dashboard
description: "How to set up and use the DevDocify admin dashboard for portal configuration, deployment visibility, analytics, and user management."
---

# Set up the admin dashboard

The admin dashboard is a standalone Next.js app that provides a web interface for managing portal configuration, monitoring deployments, viewing analytics, and controlling user access. It uses Supabase for authentication.

## Prerequisites

- Node.js 24 or later.
- A [Supabase](https://supabase.com) project with authentication enabled.
- The `admin/` directory in your DevDocify project.

## 1. Configure Supabase credentials

Copy the example environment file:

```bash
cp admin/.env.local.example admin/.env.local
```

Set these values in `admin/.env.local`, and in your hosting provider for production:

| Variable | Required | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project **Settings > API > Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase project **Settings > API > anon public** key |
| `ADMIN_ALLOWED_EMAILS` | Yes | Comma-separated emails allowed into the dashboard. Anyone else is signed out. If it's empty, nobody can get in. |
| `CRON_SECRET` | Production on Vercel | Any long random string, for example from `openssl rand -hex 32`. See [Keep the Supabase project awake](#6-keep-the-supabase-project-awake). |

Do not commit `.env.local`. It is already in `.gitignore`.

## 2. Create the admin user

The dashboard signs in with email and password. Create the user in the Supabase dashboard under **Authentication > Users**, and add the same email to `ADMIN_ALLOWED_EMAILS`.

Turn off public sign-ups under **Authentication > Sign In / Providers**, so nobody else can create an account in the project.

## 3. Run locally

```bash
cd admin
npm install
npm run dev
```

The dashboard runs at `http://localhost:3100`. The docs site runs on port 3000, so both can run simultaneously.

## 4. Dashboard pages

Apart from sign-in, the dashboard pages show hard-coded **sample data**. They aren't connected to live deployments, analytics, or user records, and the dashboard doesn't save changes. Each page shows a notice saying so.

### Dashboard

The home page shows summary stats: portal count, recent deployments, page views, and custom domain count.

### Portals

View and edit portal configuration:

- **Docsets** table showing all registered docsets with route counts and versioning status.
- **Domain configuration** with editable primary domain, alias list, and legacy redirect rules.
- **Role assignments** showing role-to-principal mappings.

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
- Add or remove users and change roles inline. Changes last until the page reloads.
- View the audit log of access changes.

## 5. Build for production

```bash
cd admin
npm run build
npm run start
```

The production server runs on port 3100. Deploy to your preferred hosting provider (Vercel, Docker, or any Node.js host). On Vercel, set the project's **Root Directory** to `admin`.

## 6. Keep the Supabase project awake

Free Supabase projects pause after 7 days without activity, and a paused project breaks sign-in. `admin/vercel.json` schedules a daily Vercel Cron job that calls `/api/keepalive`, which reads one row from the `keepalive` table.

1. Create the table and allow anonymous reads. In the Supabase SQL editor:

   ```sql
   create table if not exists public.keepalive (id int primary key);
   insert into public.keepalive values (1) on conflict do nothing;
   alter table public.keepalive enable row level security;
   create policy "anon can read keepalive" on public.keepalive for select to anon using (true);
   ```

2. Set `CRON_SECRET` for the Production environment of the Vercel project. Vercel sends it with each cron request, and the route rejects requests without it.

3. After you deploy, open **Settings > Cron Jobs** for the project in Vercel.

4. Click **Run**. Confirm that `/api/keepalive` returns `200`.

Self-hosted deployments have no Vercel Cron. Call `/api/keepalive` daily with the `Authorization: Bearer <CRON_SECRET>` header from any scheduler instead.
