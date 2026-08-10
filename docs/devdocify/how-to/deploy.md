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

## Custom domains

DevDocify supports single-domain, multi-domain, and legacy domain redirect configurations. Domain setup is managed through `domains.config.json` and automated via the Vercel API.

### Single domain

To attach one custom domain:

1. Go to **Settings > Domains** in your Vercel project.
2. Enter your domain and follow the DNS configuration instructions.
3. Vercel provisions a TLS certificate automatically.

Or use the CLI:

```bash
VERCEL_TOKEN=<token> VERCEL_PROJECT_ID=<id> npm run manage-domains add docs.example.com
```

### Multi-domain setup

For multiple domains (e.g. apex redirect, per-docset subdomains), use the domain configuration file.

1. Copy the example config:

```bash
cp domains.config.example.json domains.config.json
```

2. Edit `domains.config.json` with your domains:

```json
{
  "primaryDomain": "docs.example.com",
  "aliases": [
    { "domain": "example.com", "redirectToPrimary": true }
  ],
  "docsetDomains": [
    { "domain": "api.example.com", "docsetId": "petstore", "basePath": "/" }
  ]
}
```

3. Validate the configuration:

```bash
npm run validate-domains -- --config domains.config.json
```

4. Sync all domains to Vercel:

```bash
VERCEL_TOKEN=<token> VERCEL_PROJECT_ID=<id> npm run manage-domains sync --config domains.config.json
```

5. Check verification status:

```bash
VERCEL_TOKEN=<token> VERCEL_PROJECT_ID=<id> npm run manage-domains list
```

### Legacy domain redirects

When migrating from an old domain, configure redirects so existing bookmarks and external links continue working.

Add entries to the `legacyRedirects` array in `domains.config.json`:

```json
{
  "legacyRedirects": [
    {
      "fromDomain": "old-docs.example.com",
      "toDomain": "docs.example.com",
      "statusCode": 308,
      "preservePath": true
    }
  ]
}
```

Generate the Vercel redirect rules:

```bash
npm run generate-domain-redirects -- --config domains.config.json --output vercel.redirects.json
```

Merge the generated `redirects` array into your `vercel.json`.

### DNS configuration

Configure DNS records at your DNS provider. Common patterns:

| Domain type | Record | Name | Value |
|---|---|---|---|
| Subdomain (www, docs, api) | CNAME | `www` | `cname.vercel-dns.com` |
| Apex domain | A | `@` | `76.76.21.21` |

After adding DNS records, verify the domain:

```bash
VERCEL_TOKEN=<token> VERCEL_PROJECT_ID=<id> npm run manage-domains verify docs.example.com
```

### Troubleshooting

- **Domain not verifying.** DNS propagation can take up to 48 hours. Run `npm run manage-domains verify <domain>` to check status and see required DNS records.
- **SSL certificate pending.** Vercel provisions TLS certificates automatically after DNS verification. Allow a few minutes after verification completes.
- **Redirect loops.** Run `npm run validate-domains` to detect redirect chains or circular references in your domain configuration.

## Self-hosted deployment

For containerized or on-premises deployments, DevDocify includes a Docker image and a Helm chart for Kubernetes.

### Docker

Build and run the production image locally. Requires [Colima](https://github.com/abiosoft/colima) or Docker Desktop.

```bash
make docker-run              # build and run on port 8080
```

Or use Docker Compose for a full stack with monitoring:

```bash
make docker-compose-up       # production build via compose
make monitoring-up           # add Prometheus + Grafana
```

| Service | URL |
|---|---|
| Docs site | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

### Kubernetes with Helm

The `charts/devdocify/` Helm chart deploys the docs site to any Kubernetes cluster.

1. Install the chart:

```bash
helm install devdocify charts/devdocify
```

2. Verify the pods are running:

```bash
kubectl get pods -l app.kubernetes.io/name=devdocify
```

3. Access the site via port-forward:

```bash
kubectl port-forward svc/devdocify 8080:80
```

The site is available at `http://localhost:8080`.

#### Configuration

Override values with `--set` or a custom values file:

```bash
helm install devdocify charts/devdocify \
  --set replicaCount=3 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=docs.example.com
```

Key values:

| Value | Default | Description |
|---|---|---|
| `replicaCount` | `2` | Number of pod replicas |
| `image.repository` | `ghcr.io/matthewrgourd/doc-platform` | Container image |
| `image.tag` | Chart `appVersion` | Image tag |
| `service.port` | `80` | Service port |
| `ingress.enabled` | `true` | Create an Ingress resource |
| `autoscaling.enabled` | `false` | Enable HorizontalPodAutoscaler |
| `autoscaling.minReplicas` | `2` | Minimum replicas when autoscaling |
| `autoscaling.maxReplicas` | `10` | Maximum replicas when autoscaling |

The chart includes liveness and readiness probes on `/health`, which nginx serves with a 200 response.
