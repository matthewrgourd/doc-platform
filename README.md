# Helix Developer Docs

A reference implementation of an enterprise developer documentation portal, built with [Docusaurus](https://docusaurus.io/) and [Scalar](https://scalar.com/).

Demonstrates a multi-product documentation site with interactive API playground, containerised deployment, and CI/CD pipeline - the kind of developer portal used by companies like Stripe, Adyen, and Twilio.

## Features

- **Multi-product navigation** - separate doc sections for Payments, Connect, and Getting Started
- **Interactive API playground** - powered by Scalar, with "Try It" request builder and code samples
- **OpenAPI 3.0 reference** - auto-generated from a spec file, always in sync
- **Mermaid diagrams** - sequence diagrams, state machines, and flowcharts rendered natively
- **Tabbed code samples** - Node.js, Python, Go across all guides
- **Dark mode** - automatic, respects system preferences
- **Containerised** - multi-stage Docker build with nginx, health checks, and gzip compression
- **CI/CD** - GitHub Actions pipeline with lint, build, Docker push, and staging deploy
- **PR previews** - every pull request gets a preview deployment with a comment link
- **Monitoring** - Prometheus + Grafana stack with nginx metrics dashboard

## Quick start

```bash
npm install --legacy-peer-deps
npm start
```

The site runs at `http://localhost:3000`.

## Docker

This project uses [Colima](https://github.com/abiosoft/colima) as the container runtime (no Docker Desktop required).

```bash
brew install colima          # one-time setup
make colima-start            # start the runtime
make docker-run              # build and run the container
```

The site runs at `http://localhost:8080`. The container uses a multi-stage build (node for build, nginx for serving) and includes a health check at `/health`.

Or use docker compose:

```bash
make docker-compose-up     # production build
make docker-compose-dev    # dev server with hot reload
make docker-compose-down   # stop everything
```

## Monitoring

Launch the full observability stack (Prometheus + Grafana) alongside the docs site:

```bash
make monitoring-up
```

| Service | URL |
|---|---|
| Docs site | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin) |

Grafana comes pre-configured with a Prometheus datasource and an nginx dashboard showing active connections, request rates, and connection states.

```bash
make monitoring-logs    # tail all logs
make monitoring-down    # tear everything down
```

## Available commands

Run `make help` to see all commands:

```
colima-start         Start Colima container runtime
colima-stop          Stop Colima container runtime
colima-status        Check Colima status
dev                  Start local dev server
build                Build static site
serve                Build and serve locally
typecheck            Run TypeScript type checking
docker-build         Build Docker image
docker-run           Build and run in Docker
docker-stop          Stop Docker container
docker-compose-up    Run production build via docker compose
docker-compose-dev   Run dev server via docker compose (hot reload)
docker-compose-down  Stop all docker compose services
monitoring-up        Start docs + Prometheus + Grafana stack
monitoring-down      Stop monitoring stack
monitoring-logs      Tail logs from monitoring stack
clean                Remove build artifacts and caches
```

## CI/CD pipeline

The GitHub Actions pipeline (`ci.yml`) runs on every push and PR:

```
lint-and-typecheck --> build --> docker (push to GHCR) --> deploy-staging
```

Pull requests also trigger a preview deployment (`preview.yml`) that posts the preview URL as a PR comment.

## Project structure

```
docs/
  getting-started/       Onboarding guides (quickstart, auth, errors)
  payments/              Payments product area (accept, refund, webhooks)
  connect/               Connect product area (onboarding, payouts)
  changelog.md           Release notes
src/
  css/custom.css         Custom theme (Stripe-inspired)
  pages/index.tsx        Homepage redirect
static/
  openapi.yaml           OpenAPI 3.0 spec (powers Scalar playground)
.github/workflows/
  ci.yml                 Build, test, Docker push, staging deploy
  preview.yml            PR preview deployments
Dockerfile               Multi-stage build (node + nginx)
docker-compose.yml       Local production and dev containers
nginx.conf               Production nginx config with caching and gzip
Makefile                 Common DevOps commands
monitoring/
  prometheus/            Prometheus scrape config
  grafana/               Datasource, dashboard provisioning, and nginx dashboard
```

## Stack

| Component | Technology |
|---|---|
| Docs framework | [Docusaurus 3.9](https://docusaurus.io/) |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) + [Fira Code](https://fonts.google.com/specimen/Fira+Code) |
| API reference | [Scalar](https://scalar.com/) |
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| Container | Docker + nginx |
| CI/CD | GitHub Actions |
| Monitoring | [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/) |
| Registry | GitHub Container Registry (GHCR) |

## License

MIT
