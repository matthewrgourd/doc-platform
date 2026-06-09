---
sidebar_position: 7
slug: /how-to/deploy
title: Deploy to Vercel
description: "How to deploy a DevDocify site to Vercel with continuous deployment, preview builds, quality gates, and optional Algolia index pushes."
---

# Deploy to Vercel

DevDocify deploys to Vercel as a static Docusaurus site. This guide covers project import, build settings, preview deployments, CI quality gates, and optional production search updates.

## Prerequisites

- Your project is in a GitHub repository.
- You have a [Vercel account](https://vercel.com).
- Dependencies install successfully with `npm install --legacy-peer-deps`.

## 1. Push to GitHub

Make sure your project is committed and pushed:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## 2. Import the project in Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New > Project**.
3. Select your GitHub repository from the list.
4. Click **Import**.

## 3. Configure build settings

Use the same settings as `vercel.json`:

| Setting | Value |
|---|---|
| Framework preset | Other |
| Build command | `npm run build` |
| Output directory | `build` |
| Install command | `npm install --legacy-peer-deps` |

If you change package managers, update both Vercel project settings and `vercel.json`.

## 4. Add environment variables

Add sensitive values under **Settings > Environment Variables** in the Vercel dashboard or as GitHub Actions secrets.

| Variable | Where to set it | Required |
|---|---|---|
| `ALGOLIA_ADMIN_API_KEY` | GitHub Actions secret | Only when CI should push search index updates |
| `ALGOLIA_APP_ID` | GitHub Actions secret or environment variable | Optional, overrides the script default |
| `ALGOLIA_INDEX_NAME` | GitHub Actions secret or environment variable | Optional, overrides `devdocify` |

The public Algolia search-only key can live in `docusaurus.config.ts`. Do not commit admin keys.

## 5. Deploy

Click **Deploy**. Vercel installs dependencies, runs `npm run build`, and publishes the `build/` directory.

After the first deployment succeeds, every push to `main` creates a production deployment. Every pull request gets a preview deployment at a unique URL.

## CI quality gates

The GitHub Actions pipeline runs these checks before release:

| Job | Purpose |
|---|---|
| `typecheck` | Runs TypeScript checks. |
| `lint` | Validates includes and variables in the docs tree. |
| `validate-assistant` | Validates assistant safety and quality policy. |
| `build` | Builds the Docusaurus site and uploads the build artifact. |
| `lighthouse` | Runs Lighthouse CI against the built site. |
| `health-check` | Probes configured API playground endpoints. |

Pushes to `main` also run Docker image publishing, staging deploy, and the optional Algolia index push. Pull requests skip those push-only jobs.

## RBAC publish gate

`rbac-check.yml` runs separately on pushes to `main`. It checks whether the GitHub actor has `content.publish` in `rbac.config.json`.

If `rbac.config.json` is absent, the workflow exits successfully and logs that no real config is present. The example config is not used for enforcement.

## Preview deployments

Use preview deployments to:

- Confirm the build passes before merging.
- Check that new routes resolve correctly.
- Review content and UI changes in a real browser.
- Verify search, API playgrounds, and assistant UI behavior before production.

Run this command locally before opening a pull request:

```bash
npm run build
```

For link-specific validation, run:

```bash
npm run lint-content
```

## Custom domain

To attach a custom domain:

1. Go to **Settings > Domains** in your Vercel project.
2. Enter your domain and follow the DNS configuration instructions.
3. Vercel provisions a TLS certificate automatically.
