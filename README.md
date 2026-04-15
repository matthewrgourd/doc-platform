# DevDocify

DevDocify is a reference implementation demonstrating the **Docusaurus**, **Scalar**, and **Vercel** stack for multi-product developer documentation. It shows how to structure a portal with multiple docsets, each with guides and an interactive API playground.

## Features

- **Multi-docset site** - TfL and Petstore as selectable products with separate doc sections and API playgrounds
- **Site overview homepage** - explains the tech stack and links to each product
- **Interactive API playground** - powered by Scalar, with "Try it" request builder and curated unauthenticated examples
- **Curated demo specs** - each API playground exposes 3 GET endpoints designed to return valid responses without authentication
- **Context-aware spec download links** - "Download API spec" appears only on API playground routes and points to the corresponding local demo spec
- **Route manifest builder** - walks the docs tree and emits a deterministic JSON manifest of all routes, docsets, and versions
- **Docset config schema** - CalVer versioning, lifecycle states (active/LTS/EOL), and registry validation
- **OpenAPI normalization** - validates OpenAPI 3.x specs, deduplicates servers, and sorts paths for deterministic output
- **OpenAPI overlay patches** - operationId-matched patches for parameter defaults and x-\* extensions without modifying source specs
- **Playground health checks** - probes live endpoints and fails CI on broken required probes
- **Include resolution engine** - resolves `<!-- include: snippets/name.md -->` directives with circular-reference detection
- **Variable substitution engine** - resolves `{{variable}}` / `{{variable|fallback}}` with a portal > docset > version > page scope chain
- **Content linter** - validates includes and variables across the docs tree with actionable file:line error output
- **Mermaid diagrams** - sequence diagrams, state machines, and flowcharts rendered natively
- **Tabbed code samples** - Node.js, Python, Go across all guides
- **Algolia DocSearch** - full-text search with contextual scoping per docset
- **AI assistant panel** - floating chat panel powered by Claude, answering questions in context
- **Dark mode** - automatic, respects system preferences
- **CI/CD** - GitHub Actions pipeline with typecheck, build, and optional Docker push
- **Optional self-hosted deployment** - Docker, nginx, Prometheus + Grafana for containerized or on-prem deployments

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

- `VERCEL_TOKEN` - create at [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_PROJECT_ID` - from your Vercel project **Settings → General** (or from `.vercel/project.json` after `vercel link`)

## Optional: self-hosted deployment

For containerized or on-prem deployments, the repo includes Docker, nginx, and a monitoring stack.

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

```bash
npm start                    # dev server
npm run build                # production build (runs manifest builder then Docusaurus)
npm run serve                # serve production build locally
npm run typecheck            # TypeScript type-check
npm run manifest             # build route manifest manually
npm run normalize-openapi    # validate and normalize OpenAPI specs
npm run apply-overlay        # apply overlay patches to a normalized spec
npm run health-check         # probe live API endpoints
npm run resolve-includes     # resolve include directives in a file
npm run resolve-variables    # resolve variable references in a file
npm run lint-content         # run full content lint (includes + variables)
npm run generate-fixture     # generate synthetic docs fixture for benchmarking
npm run benchmark            # benchmark manifest builder at scale
```

## CI/CD pipeline

`ci.yml` runs on every push and PR to `main`:

```
typecheck ──┐
            ├──▶ build ──▶ docker (push to GHCR) ──▶ deploy-staging
lint ───────┘
```

Docker and deploy-staging only run on push to `main`, not on PRs. PRs get a Vercel preview URL posted as a comment via `preview.yml`.

## Project structure

```
docs/
  _snippets/               Shared markdown snippets for include resolution
  api-reference/           API reference docs surface
  connect/                 Integration-oriented docs surface
  devdocify/               DevDocify product docs (Diataxis sections)
    tutorials/
    how-to/
    reference/
    explanation/
  guides/                  General guides docs surface
  payments/                Payments docs surface
  petstore/                Petstore demo docset
  tfl/                     TfL demo docset
  variables.json           Portal-level variable defaults
openapi/
  overlays/
    petstore.overlay.json  Overlay patches for Petstore spec
    tfl.overlay.json       Overlay patches for TfL spec
  health-checks.json       Endpoint probe config for health check script
scripts/
  build-route-manifest.ts  Walks docs tree, emits build/route-manifest.json
  docset.config.ts         Docset registry, CalVer schema, and validation
  normalize-openapi.ts     Validates and normalizes OpenAPI 3.x specs
  apply-overlay.ts         Applies operationId-matched overlay patches
  check-playground-health.ts  Probes live endpoints, fails on broken required probes
  resolve-includes.ts      Resolves include directives inline
  resolve-variables.ts     Resolves variable references with scope-chain lookup
  lint-content.ts          Validates includes and variables across the docs tree
  generate-fixture.ts      Generates synthetic docs fixtures for benchmarking
  benchmark-manifest.ts    Benchmarks manifest builder at 1k/5k/10k file scale
src/
  components/
    AiPanel/               Ask AI panel UI + markdown renderer
    ApiReferenceClient.tsx Scalar renderer used by API playground routes
  css/custom.css           Custom theme (Stripe-inspired heading hierarchy)
  pages/index.tsx          Site overview homepage
  pages/petstore/api-playground.tsx  Petstore API playground page route
  pages/tfl/api-playground.tsx       TfL API playground page route
  pages/status.mdx         Service status page
  pages/support.mdx        Support page
  pages/privacy.mdx        Privacy notice page
  pages/terms.mdx          Terms of use page
  theme/Layout/...         Root-level layout/provider customizations
  theme/Navbar/...         Swizzled navbar and mobile menu behavior
static/
  img/                     Static site assets
  openapi/
    petstore-playground.json  Curated Petstore demo spec (3 GET endpoints)
    tfl-playground.json       Curated TfL demo spec (3 GET endpoints)
.github/workflows/
  ci.yml                   Typecheck, build, Docker push, and deploy (gated by branch)
  link-check.yml           Scheduled external link checking
  preview.yml              PR preview comment (posts Vercel deployment URL)
vercel.json                Vercel build config (install, output dir)
Dockerfile                 Optional: multi-stage build (node + nginx)
docker-compose.yml         Optional: local containers and monitoring
Makefile                   Docker and monitoring commands
```

## Stack

| Component | Technology |
|---|---|
| Docs framework | [Docusaurus 3.9](https://docusaurus.io/) |
| Search | [Algolia DocSearch](https://docsearch.algolia.com/) |
| AI assistant | [Claude](https://claude.ai/) via Vercel AI SDK |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) + [Fira Code](https://fonts.google.com/specimen/Fira+Code) |
| API playground | [Scalar](https://scalar.com/) |
| Hosting | [Vercel](https://vercel.com/) |
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| CI/CD | GitHub Actions |
| Optional | Docker, nginx, Prometheus, Grafana, GHCR |

## License

MIT
