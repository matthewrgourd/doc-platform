---
sidebar_position: 5
slug: /how-to/configure-enterprise-controls
title: Configure SAML access
description: "How to protect a DevDocify portal or selected docsets with SAML SSO, and generate the matching nginx auth configuration."
---

# Configure SAML access

Use SAML SSO when your documentation site, or some of its docsets, should only be readable after signing in with your identity provider.

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

## 3. Verify before release

Validate the config again after any change:

```bash
npm run validate-saml
```

Keep `saml.config.json` out of source control unless your deployment policy explicitly allows it. Commit only `saml.config.example.json` changes.
