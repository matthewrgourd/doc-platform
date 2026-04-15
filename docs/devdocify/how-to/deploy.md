---
sidebar_position: 5
slug: /how-to/deploy
title: Deploy to Vercel
description: "How to deploy a DevDocify site to Vercel with continuous deployment and preview builds on pull requests."
---

# Deploy to Vercel

DevDocify deploys well to Vercel. This guide covers importing a project, setting build configuration, and getting preview deployments on every pull request.

## Prerequisites

- Your project is in a GitHub (or GitLab/Bitbucket) repository
- You have a [Vercel account](https://vercel.com)

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

In the Vercel project configuration screen, set:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build command | `npm run build` |
| Output directory | `build` |
| Install command | `npm install` |

If you're using pnpm, replace the install and build commands accordingly:

```
pnpm install
pnpm run build
```

## 4. Add environment variables

If your project uses environment variables (for example, Algolia credentials or feature flags), add them under **Settings > Environment Variables** in the Vercel dashboard.

For Algolia, the public search API key is safe to include in source. Anything sensitive should go in environment variables rather than committed to the repository.

## 5. Deploy

Click **Deploy**. Vercel pulls the repository, runs the install and build commands, and publishes the output.

After the initial deploy succeeds, every push to `main` triggers a new production deployment automatically.

## Preview deployments

Every pull request gets a preview deployment at a unique URL. Vercel posts the preview URL as a comment on the pull request.

Use the preview to:
- Confirm the build passes before merging
- Check that new routes resolve correctly
- Review content and UI changes in a real browser

Run `docify broken-links` locally before opening a PR to catch link errors before the Vercel build runs.

## Custom domain

To attach a custom domain:

1. Go to **Settings > Domains** in your Vercel project.
2. Enter your domain and follow the DNS configuration instructions.
3. Vercel provisions a TLS certificate automatically.
