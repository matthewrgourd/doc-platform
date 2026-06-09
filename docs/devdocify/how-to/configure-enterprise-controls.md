---
sidebar_position: 5
slug: /how-to/configure-enterprise-controls
title: Configure enterprise controls
description: "How to configure SAML SSO, RBAC publish checks, assistant quality validation, and analytics schemas for a DevDocify site."
---

# Configure enterprise controls

Use these controls when your documentation site needs protected access, publish approval checks, assistant policy validation, or typed analytics events.

## Prerequisites

- You are in the project root.
- You can create uncommitted local config files.
- You have Node.js installed and dependencies available.
- You know whether access control should apply to the whole portal or only selected docsets.

## 1. Configure SAML SSO

Copy the example config and fill in your identity provider details:

```bash
cp saml.config.example.json saml.config.json
```

Set `protectedMode` to one of these values:

| Value | Behavior |
|---|---|
| `none` | SSO is configured but not enforced. Use this for dry runs. |
| `portal` | The whole portal requires authentication. |
| `docset` | Only docsets listed in `docsetRules` require authentication. |

Validate the config:

```bash
npm run validate-saml
```

Do not commit `saml.config.json`. It can contain environment-specific values.

## 2. Generate nginx auth configuration

Generate the nginx `auth_request` snippet from `saml.config.json`:

```bash
npm run generate-nginx-auth-config
```

To inspect the output without writing a generated file, pass `--stdout`:

```bash
npm run generate-nginx-auth-config -- --stdout
```

The generated config is intended for Docker or nginx deployments. For Vercel Pro or Enterprise projects, use Vercel Authentication instead of nginx `auth_request`.

## 3. Configure RBAC publish checks

Copy the example role assignment file:

```bash
cp rbac.config.example.json rbac.config.json
```

Edit `rbac.config.json` so the expected publishers have a role that includes `content.publish`.

Validate the file:

```bash
npm run validate-rbac
```

Check one actor locally:

```bash
npm run check-rbac-permission -- --actor your-github-username --capability content.publish
```

The `rbac-check.yml` workflow runs on pushes to `main`. If `rbac.config.json` is absent, the workflow exits successfully and reports that no real config is present. The example config is documentation only and is not used for enforcement.

## 4. Validate assistant policy

The assistant quality gate uses `assistant.config.json`. Copy the example only when you need a local production-style config:

```bash
cp assistant.config.example.json assistant.config.json
```

Validate the assistant quality policy:

```bash
npm run validate-assistant-quality
```

The CI workflow also creates a temporary copy from `assistant.config.example.json` when no real config exists, so pull requests can still validate the policy defaults.

## 5. Check analytics schemas

DevDocify emits typed analytics events through `src/analytics/client.ts`. Print the accepted event schema:

```bash
npm run validate-analytics-event -- --schema
```

Use that schema when you add new event emitters. Keep `src/analytics/types.ts` in sync with `scripts/validate-analytics-event.ts`.

## 6. Verify before release

Run the validation commands that match the controls you enabled:

```bash
npm run validate-saml
npm run validate-rbac
npm run validate-assistant-quality
npm run validate-analytics-event -- --schema
```

Commit only source files and example config changes. Keep real SAML, RBAC, and assistant configuration files out of source control unless your deployment policy explicitly allows them.
