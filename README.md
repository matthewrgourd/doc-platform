# API Documentation Platform

A reference implementation demonstrating the **Docusaurus**, **Scalar**, and **Vercel** tech stack for multi-product API documentation. Shows how to structure a site with multiple products, each with its own docs and interactive API playground.

## Features

- **Multi-product site** - Petstore and TfL as selectable products with separate doc sections and API references
- **Site overview homepage** - explains the tech stack and links to each product
- **Interactive API playground** - powered by Scalar, with "Try it" request builder; Petstore uses the live API, TfL uses the [TfL Unified API](https://api.tfl.gov.uk)
- **OpenAPI / Swagger reference** - Petstore (OpenAPI 3.0), TfL (Swagger 2.0), always in sync
- **Mermaid diagrams** - sequence diagrams, state machines, and flowcharts rendered natively
- **Tabbed code samples** - Node.js, Python, Go across all guides
- **Dark mode** - automatic, respects system preferences
- **CI/CD** - GitHub Actions pipeline with lint, build, and optional Docker push
- **Optional self-hosted deployment** - Docker, nginx, Prometheus + Grafana for containerised or on-prem deployments

## Quick start

```bash
npm install --legacy-peer-deps
npm start
```

The site runs at `http://localhost:3000`.

To preview the production build locally:

```bash
npm run build
npm run serve
```

Serves at `http://localhost:3000` (or the next available port).

## Deploy to Vercel

1. Push your repo to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New** → **Project** and import your `doc-platform` repo.
4. Vercel auto-detects Docusaurus. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install --legacy-peer-deps`
5. Click **Deploy**. The site will be live at `https://your-project.vercel.app`.

Each push to `main` triggers a new deployment. PRs get preview URLs automatically.

**PR preview comments:** To post the Vercel preview URL as a comment on each PR, add these [GitHub repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets):

- `VERCEL_TOKEN` – create at [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_PROJECT_ID` – from your Vercel project **Settings → General** (or from `.vercel/project.json` after `vercel link`)

## Optional: self-hosted deployment

For containerised or on-prem deployments, the repo includes Docker, nginx, and a monitoring stack.

**Docker** (requires [Colima](https://github.com/abiosoft/colima) or Docker Desktop):

```bash
make docker-run              # build and run (port 8080)
# or
make docker-compose-up       # production build via compose
make docker-compose-dev      # dev server with hot reload
```

**Monitoring** (Prometheus + Grafana):

```bash
make monitoring-up
```

| Service | URL |
|---|---|
| Docs site | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin) |

```bash
make monitoring-down    # tear down
```

## Available commands

Run `make help` to see all commands. Core workflow: `dev`, `build`, `serve`. Docker and monitoring commands are optional.

## CI/CD pipeline

**CI** (`ci.yml`) runs on every push and PR to `main`:

```
lint-and-typecheck --> build
```

**Deploy** (`deploy.yml`) runs only on push to `main`:

```
docker (push to GHCR) --> deploy-staging
```

PRs and feature branches only run lint and build. Docker and deploy run exclusively when merging to `main`. For static hosting (Vercel, Netlify, GitHub Pages), use the `build` output directly and skip the Docker job if desired.

## Project structure

```
docs/
  petstore/              Petstore product
    getting-started/     Onboarding guides (quickstart, auth, errors)
    pets/                Pet management (add, find, update, delete, upload)
    store/               Store orders and inventory
    users/               User management (create, login, manage)
  tfl/                   TfL API product
    getting-started/     Overview, quickstart, auth, error handling
    lines/               Line status and routes
    stoppoints/          Stop search and arrivals
    journey/              Journey planning
src/
  css/custom.css         Custom theme (Stripe-inspired)
  pages/index.tsx        Site overview homepage
.github/workflows/
  ci.yml                 Lint, typecheck, build (all branches/PRs)
  deploy.yml             Docker push and deploy (main only)
  preview.yml             PR preview (posts Vercel deployment URL)
vercel.json              Vercel build config (install, output dir)
Dockerfile               Optional: multi-stage build (node + nginx)
docker-compose.yml       Optional: local containers and monitoring
Makefile                 Commands (core + optional Docker/monitoring)
```

## Stack

| Component | Technology |
|---|---|
| Docs framework | [Docusaurus 3.9](https://docusaurus.io/) |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) + [Fira Code](https://fonts.google.com/specimen/Fira+Code) |
| API reference | [Scalar](https://scalar.com/) |
| Hosting | [Vercel](https://vercel.com/) |
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| CI/CD | GitHub Actions |
| Optional | Docker, nginx, Prometheus, Grafana, GHCR |

## License

MIT
