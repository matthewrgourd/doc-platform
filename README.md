# Helix Developer Docs

A reference implementation of an enterprise developer documentation portal, built with [Docusaurus](https://docusaurus.io/) and [Scalar](https://scalar.com/).

Demonstrates a multi-product documentation site with interactive API playground  - the kind of developer portal used by companies like Stripe, Adyen, and Twilio.

## Features

- **Multi-product navigation**  - separate doc sections for Payments, Connect, and Getting Started
- **Interactive API playground**  - powered by Scalar, with "Try It" request builder and code samples
- **OpenAPI 3.0 reference**  - auto-generated from a spec file, always in sync
- **Mermaid diagrams**  - sequence diagrams, state machines, and flowcharts rendered natively
- **Tabbed code samples**  - Node.js, Python, Go across all guides
- **Dark mode**  - automatic, respects system preferences
- **Enterprise-ready**  - versioning-ready structure, changelog, error handling patterns

## Quick start

```bash
npm install --legacy-peer-deps
npm start
```

The site runs at `http://localhost:3000`.

## Project structure

```
docs/
├── getting-started/     # Onboarding guides (quickstart, auth, errors)
├── payments/            # Payments product area (accept, refund, webhooks)
├── connect/             # Connect product area (onboarding, payouts)
└── changelog.md         # Release notes
src/
├── css/custom.css       # Custom theme (Stripe-inspired)
└── pages/index.tsx      # Homepage redirect
static/
└── openapi.yaml         # OpenAPI 3.0 spec (powers Scalar playground)
```

## Stack

| Component | Technology |
|---|---|
| Docs framework | [Docusaurus 3.9](https://docusaurus.io/) |
| API reference | [Scalar](https://scalar.com/) |
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| Syntax highlighting | [Prism](https://prismjs.com/) |

## Build for production

```bash
npm run build
npm run serve
```

## License

MIT
