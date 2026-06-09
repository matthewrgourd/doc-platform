# DevDocify

DevDocify is a reference implementation demonstrating the **Docusaurus**, **Scalar**, and **Vercel** stack for multi-product developer documentation. It shows how to structure a portal with multiple docsets, each with guides and an interactive API playground.

Live site: [https://www.devdocify.com](https://www.devdocify.com)

## Features

- **Multi-docset site** - TfL, Petstore, and Platzi as selectable products with separate doc sections and API playgrounds
- **Site overview homepage** - explains the tech stack and links to each product
- **Interactive API playground** - powered by Scalar, with "Try it" request builder and curated unauthenticated examples
- **Curated demo specs** - each API playground uses a local OpenAPI subset aligned to its demo routes
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
- **PlantUML diagrams** - fenced ` ```plantuml ` blocks rendered as SVG via remote encoding; no Java dependency in CI
- **Tabbed code samples** - Node.js, Python, Go across all guides
- **Algolia search** - docset/version-aware index with API operations indexed separately; index built in `postbuild` and pushed to Algolia on deploy
- **`llms.txt` generation** - generated at `postbuild` with canonical URLs for all docs and API reference routes
- **AI assistant panel** - floating chat panel powered by Claude, answering questions in context
- **Analytics emission** - structured event schema with typed payloads; `page.view` and interaction events emitted via Vercel Analytics
- **SAML SSO config generator** - `scripts/generate-nginx-auth-config.ts` produces nginx `auth_request` snippets for portal-wide or per-docset enforcement
- **RBAC enforcement** - role/capability schema validated in CI; `rbac-check` workflow gates pushes to main on `content.publish` capability
- **Assistant quality gate** - eight policy rules enforced in CI; regression prompt categories and fallback policy validated on every PR
- **Link integrity** - internal broken links fail the build; redirects supported via `@docusaurus/plugin-client-redirects`; external links checked weekly
- **Lighthouse CI** - performance, accessibility, and best-practices audits on every build
- **Docs-draft automation** - `.github/workflows/docs-draft-update.yml` proposes doc updates when target code changes, with mandatory human approval before merge
- **Dark mode** - automatic, respects system preferences
- **CI/CD** - GitHub Actions pipeline with typecheck, lint, build, health checks, Lighthouse, Docker push, Algolia push, and staging deploy
- **Optional self-hosted deployment** - Docker, nginx, Prometheus + Grafana for containerized or on-prem deployments

## Docs taxonomy (Diataxis)

The primary product docs under `/docs` are organized by the Diataxis model:

- **Tutorials** - guided, end-to-end learning paths
- **How-to guides** - task-focused implementation steps
- **Reference** - exact facts, schemas, and command contracts
- **Explanation** - design rationale and trade-offs

Demo API docsets live alongside this at:

- `/tfl`
- `/petstore`
- `/platzi`

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

### Ask AI backend and preview behavior

The Ask AI panel in this repo calls `https://chat.devdocify.com/api/widget-chat` from the browser.

For production and Vercel preview environments to work:

- `chat-devdocify` must be deployed and healthy.
- The widget API CORS policy must allow:
  - `https://www.devdocify.com`
  - `https://devdocify.com`
  - `http://localhost:*`
  - `https://doc-platform*.vercel.app` preview origins

If preview origins are not allowed by CORS, Ask AI requests fail in browser and the panel shows:
`Sorry, something went wrong. Please try again.`

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

**Core dev**

```bash
npm start                         # dev server
npm run build                     # production build (runs postbuild: manifest + search index + llms.txt)
npm run serve                     # serve production build locally
npm run typecheck                 # TypeScript type-check
```

**Content quality (CI gates)**

```bash
npm run lint-content              # validate includes and variables across the docs tree
npm run health-check              # probe live API endpoints
npm run validate-assistant-quality  # enforce assistant policy rules (8 rules, CI gate)
```

**Config validation**

```bash
npm run validate-saml             # validate saml.config.json schema
npm run validate-rbac             # validate rbac.config.json schema
npm run validate-analytics-event  # validate an analytics event payload
npm run validate-assistant        # validate assistant.config.json schema
npm run check-rbac-permission     # check actor capability against rbac.config.json
npm run generate-nginx-auth-config  # generate nginx auth_request config from saml.config.json
```

**OpenAPI tooling**

```bash
npm run normalize-openapi         # validate and normalize OpenAPI specs
npm run apply-overlay             # apply overlay patches to a normalized spec
```

**Build outputs**

```bash
npm run manifest                  # build route manifest manually
npm run build-search-index        # build Algolia search index from docs tree
npm run push-search-index         # push built index to Algolia (requires ALGOLIA_ADMIN_API_KEY)
npm run generate-llms-txt         # generate llms.txt with canonical doc and API route URLs
```

**Content resolution**

```bash
npm run resolve-includes          # resolve include directives in a file
npm run resolve-variables         # resolve variable references in a file
```

**Benchmarks**

```bash
npm run generate-fixture          # generate synthetic docs fixture for benchmarking
npm run benchmark                 # benchmark manifest builder at scale
npm run benchmark-build           # full Docusaurus build benchmark at configurable fixture scale
```

## CI/CD pipeline

`ci.yml` runs on every push and PR to `main`:

```
typecheck ──────┐
lint ───────────┼──▶ validate-assistant ──▶ build ──▶ lighthouse
                │                               └──▶ health-check
                │                               └──▶ docker ──▶ deploy-staging  (push only)
                │                               └──▶ push-search-index          (push only)
                └──────────────────────────────────────────────────────────────────────────
```

`rbac-check.yml` runs separately on push to `main`, gating deploys on `content.publish` capability.

`link-check.yml` runs on a weekly schedule to check external links.

`docs-draft-update.yml` proposes doc updates when monitored code changes, with a mandatory human approval gate.

Docker, deploy-staging, and push-search-index only run on push to `main`, not on PRs. PRs get a Vercel preview URL posted as a comment via `preview.yml`.

## Project structure

```
docs/
  _snippets/               Shared content snippets (resolved via include directives)
  devdocify/               DevDocify product docs
    tutorials/             Guided learning paths
    how-to/                Task-oriented implementation guides
    reference/             Commands, contracts, and technical facts
    explanation/           Architecture and rationale
  petstore/                Petstore product docs
    getting-started/       Onboarding guides (quickstart, auth, errors)
    pets/                  Pet management (add, find, update, delete, upload)
    store/                 Store orders and inventory
    users/                 User management (create, login, manage)
  tfl/                     TfL API product docs
    getting-started/       Overview, quickstart, auth, error handling
    lines/                 Line status and routes
    stoppoints/            Stop search and arrivals
    journey/               Journey planning
  platzi/                  Platzi Fake Store API product docs
    getting-started/       Overview, quickstart, auth, error handling
    products/              Product listing and pagination guides
    users/                 User and email-availability guides
    locations/             Location query guides
  variables.json           Portal-level variable defaults
openapi/
  overlays/
    petstore.overlay.json  Overlay patches for Petstore spec
    tfl.overlay.json       Overlay patches for TfL spec
  health-checks.json       Endpoint probe config for health check script
scripts/
  build-route-manifest.ts       Walks docs tree, emits build/route-manifest.json
  docset.config.ts              Docset registry, CalVer schema, and validation
  normalize-openapi.ts          Validates and normalizes OpenAPI 3.x specs
  apply-overlay.ts              Applies operationId-matched overlay patches
  check-playground-health.ts    Probes live endpoints, fails on broken required probes
  resolve-includes.ts           Resolves include directives inline
  resolve-variables.ts          Resolves variable references with scope-chain lookup
  lint-content.ts               Validates includes and variables across the docs tree
  build-search-index.ts         Builds Algolia search index (docs + API ops, with facets)
  push-search-index.ts          Pushes built index to Algolia via replaceAllObjects
  generate-llms-txt.ts          Generates llms.txt with canonical doc and API route URLs
  validate-saml-config.ts       Validates saml.config.json schema
  validate-rbac-config.ts       Validates rbac.config.json schema and exports hasCapability()
  check-rbac-permission.ts      CLI: checks actor capability against rbac.config.json
  generate-nginx-auth-config.ts Generates nginx auth_request config from saml.config.json
  validate-analytics-event.ts   Validates analytics event payloads against schema
  validate-assistant-config.ts  Validates assistant.config.json schema
  validate-assistant-quality.ts Enforces assistant quality policy (8 rules, CI gate)
  generate-fixture.ts           Generates synthetic docs fixtures for benchmarking
  benchmark-manifest.ts         Benchmarks manifest builder at 1k/5k/10k file scale
  benchmark-build.ts            Full Docusaurus build benchmark at configurable fixture scale
src/
  analytics/
    types.ts                 Frontend-safe analytics event type declarations
    client.ts                emitEvent() backed by @vercel/analytics track(); SSR-safe
    hooks.ts                 usePageViewAnalytics(): emits page.view on route change
  components/
    ApiReferenceClient.tsx   Scalar renderer used by API playground routes
  css/custom.css             Custom theme (Stripe-inspired heading hierarchy)
  pages/index.tsx            Site overview homepage
  pages/petstore/api-playground.tsx  Petstore API playground page route
  pages/tfl/api-playground.tsx       TfL API playground page route
  pages/platzi/api-playground.tsx    Platzi API playground page route
  pages/status.mdx           Service status page
  pages/support.mdx          Support page
  pages/privacy.mdx          Privacy notice page
  pages/terms.mdx            Terms of use page
  remark/
    remark-plantuml.ts       Remark plugin: renders ```plantuml blocks as remote SVG images
  theme/
    Navbar/...               Swizzled navbar and mobile menu behavior
    Root.tsx                 App root; mounts analytics hooks
static/
  openapi/
    petstore-playground.json   Curated Petstore demo spec (playground subset)
    tfl-playground.json        Curated TfL demo spec (playground subset)
    platzi-playground.json     Curated Platzi demo spec (products, users, auth, locations)
.github/workflows/
  ci.yml                     Typecheck, lint, build, Lighthouse, health check, Docker, Algolia push, staging deploy
  preview.yml                PR preview comment (posts Vercel deployment URL)
  rbac-check.yml             Gates pushes to main on content.publish RBAC capability
  link-check.yml             Weekly external link integrity check
  docs-draft-update.yml      Proposes doc updates on code changes; requires human approval
rbac.config.example.json     Example RBAC config (roles, capabilities, principals)
saml.config.example.json     Example SAML SSO config (IdP metadata, protected modes)
assistant.config.example.json  Example assistant quality config (rules, thresholds)
vercel.json                  Vercel build config (install, output dir)
Dockerfile                   Optional: multi-stage build (node + nginx)
docker-compose.yml           Optional: local containers and monitoring
Makefile                     Docker and monitoring commands
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
| Diagrams | [Mermaid](https://mermaid.js.org/), [PlantUML](https://plantuml.com/) |
| CI/CD | GitHub Actions |
| Optional | Docker, nginx, Prometheus, Grafana, GHCR |

## License

MIT
