# Petstore API Docs

A reference implementation of an enterprise developer documentation portal, built with [Docusaurus](https://docusaurus.io/) and [Scalar](https://scalar.com/).

Demonstrates a multi-product documentation site with interactive API playground and CI/CD pipeline. Content is aligned with the [Swagger Petstore](https://petstore3.swagger.io/) OpenAPI 3.0 spec.

## Features

- **Multi-product navigation** - separate doc sections for Pets, Store, Users, and Getting Started
- **Interactive API playground** - powered by Scalar, with "Try it" request builder; uses the live Petstore API
- **OpenAPI 3.0 reference** - loaded from [Petstore spec](https://petstore3.swagger.io/api/v3/openapi.json), always in sync
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

The GitHub Actions pipeline (`ci.yml`) runs on every push and PR:

```
lint-and-typecheck --> build --> docker (push to GHCR) --> deploy-staging
```

Docker push and deploy run only on `main`. For static hosting (Vercel, Netlify, GitHub Pages), use the `build` output directly and skip the Docker job if desired.

## Project structure

```
docs/
  getting-started/       Onboarding guides (quickstart, auth, errors)
  pets/                  Pet management (add, find, update, delete, upload)
  store/                 Store orders and inventory
  users/                 User management (create, login, manage)
  changelog.md           Release notes
src/
  css/custom.css         Custom theme (Stripe-inspired)
  pages/index.tsx        Homepage redirect
.github/workflows/
  ci.yml                 Build, test, optional Docker push
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
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| CI/CD | GitHub Actions |
| Optional | Docker, nginx, Prometheus, Grafana, GHCR |

## License

MIT
