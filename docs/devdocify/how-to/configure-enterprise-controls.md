---
sidebar_position: 5
slug: /how-to/configure-enterprise-controls
title: Configure SAML access
description: "How to protect a DevDocify portal or selected docsets with SAML SSO, and generate the matching nginx auth configuration."
---

# Configure SAML access

Use SAML single sign-on (SSO) to make readers sign in with your identity provider before they read your docs, or selected docsets.

## Prerequisites

- A terminal open at the project root
- Node.js, with project dependencies installed (`npm install --legacy-peer-deps`)
- A decision on scope: access control for the whole portal, or only for selected docsets

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

Don't commit `saml.config.json`. It can contain environment-specific values.

## 2. Generate nginx auth configuration

Generate the nginx `auth_request` snippet from `saml.config.json`:

```bash
npm run generate-nginx-auth-config
```

To inspect the output without writing a generated file, pass `--stdout`:

```bash
npm run generate-nginx-auth-config -- --stdout
```

Use the generated config for Docker or nginx deployments. For Vercel Pro or Enterprise projects, use Vercel Authentication instead of nginx `auth_request`.

## 3. Verify before release

Validate the config again after any change:

```bash
npm run validate-saml
```

Keep `saml.config.json` out of source control unless your deployment policy explicitly allows it. Commit only `saml.config.example.json` changes.
