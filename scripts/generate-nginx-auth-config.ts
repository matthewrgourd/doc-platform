/**
 * SAML nginx auth config generator — Epic 5, Story 5.4
 *
 * Reads saml.config.json (or a path supplied via --config) and writes a
 * ready-to-include nginx snippet that enforces the declared protectedMode
 * at the proxy layer.
 *
 * Output: nginx-auth.conf.generated  (add to .gitignore — operator-specific)
 *
 * Usage:
 *   npx tsx scripts/generate-nginx-auth-config.ts
 *   npx tsx scripts/generate-nginx-auth-config.ts --config saml.config.json
 *   npx tsx scripts/generate-nginx-auth-config.ts --stdout   (print instead of write)
 *
 * Deployment targets:
 *   Docker/nginx — include the output file inside your server {} block:
 *     include /etc/nginx/nginx-auth.conf.generated;
 *
 *   Vercel — see the commented section at the end of the generated output.
 */

import fs from 'fs';
import path from 'path';
import {validateSamlConfig} from './validate-saml-config.js';
import type {SamlConfig, SamlDocsetRule} from './validate-saml-config.js';

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function indent(n: number, s: string): string {
  const pad = ' '.repeat(n);
  return s
    .split('\n')
    .map(line => (line.trim() === '' ? '' : pad + line))
    .join('\n');
}

function portalBlock(cfg: SamlConfig): string {
  return `
# ── SAML SSO: protectedMode=portal ──────────────────────────────────────────
# The entire portal requires authentication. Unauthenticated requests are
# redirected to the IdP via the SAML SP sidecar at /saml/*.
#
# Prerequisites:
#   - A SAML SP sidecar running on 127.0.0.1:9090 (e.g. oauth2-proxy, mod_auth_mellon)
#   - The sidecar must accept /saml/auth (subrequest), /saml/login, and /saml/acs
#
# Entity ID : ${cfg.entityId}
# ACS URL   : ${cfg.acsUrl}
# Session   : ${cfg.sessionDurationSeconds ?? 28800}s

# Internal auth subrequest endpoint — proxied to the SAML SP sidecar
location = /saml/auth {
    internal;
    proxy_pass              http://127.0.0.1:9090/auth;
    proxy_pass_request_body off;
    proxy_set_header        Content-Length   "";
    proxy_set_header        X-Original-URI   $request_uri;
    proxy_set_header        X-Original-Method $request_method;
}

# Login redirect — sidecar handles IdP redirect
location /saml/login {
    proxy_pass http://127.0.0.1:9090/login;
}

# Assertion Consumer Service — IdP posts SAML response here
location /saml/acs {
    proxy_pass http://127.0.0.1:9090/acs;
}

# Protected: entire portal
location / {
    auth_request /saml/auth;

    # On 401 from subrequest, redirect to login with return URL
    error_page 401 = @saml_login_redirect;

    auth_request_set $auth_session_cookie $upstream_http_set_cookie;
    add_header Set-Cookie $auth_session_cookie;

    try_files $uri $uri/ $uri.html /index.html;
}

location @saml_login_redirect {
    return 302 /saml/login?rd=$scheme://$host$request_uri;
}
`.trim();
}

function docsetBlock(rules: SamlDocsetRule[], cfg: SamlConfig): string {
  const protectedRules = rules.filter(r => r.protected);

  if (protectedRules.length === 0) {
    return `
# ── SAML SSO: protectedMode=docset ──────────────────────────────────────────
# No docset rules have protected=true. No auth_request directives added.
# Add rules with "protected": true to docsetRules in saml.config.json.
`.trim();
  }

  const locationBlocks = protectedRules
    .map(rule => {
      const rolesNote = rule.allowedRoles?.length
        ? `# Allowed roles: ${rule.allowedRoles.join(', ')} (enforced by SAML SP)`
        : '# Allowed roles: all authenticated users';

      return `
# Docset: ${rule.docsetId}
${rolesNote}
location /${rule.docsetId}/ {
    auth_request /saml/auth;
    error_page 401 = @saml_login_redirect;
    auth_request_set $auth_session_cookie $upstream_http_set_cookie;
    add_header Set-Cookie $auth_session_cookie;
    try_files $uri $uri/ $uri.html /index.html;
}`.trim();
    })
    .join('\n\n');

  return `
# ── SAML SSO: protectedMode=docset ──────────────────────────────────────────
# Per-docset auth. Only the docsets below require authentication.
#
# Entity ID : ${cfg.entityId}
# ACS URL   : ${cfg.acsUrl}
# Session   : ${cfg.sessionDurationSeconds ?? 28800}s

location = /saml/auth {
    internal;
    proxy_pass              http://127.0.0.1:9090/auth;
    proxy_pass_request_body off;
    proxy_set_header        Content-Length   "";
    proxy_set_header        X-Original-URI   $request_uri;
}

location /saml/login {
    proxy_pass http://127.0.0.1:9090/login;
}

location /saml/acs {
    proxy_pass http://127.0.0.1:9090/acs;
}

# Public routes — no auth required
location / {
    try_files $uri $uri/ $uri.html /index.html;
}

location @saml_login_redirect {
    return 302 /saml/login?rd=$scheme://$host$request_uri;
}

${indent(0, locationBlocks)}
`.trim();
}

function noneBlock(): string {
  return `
# ── SAML SSO: protectedMode=none ────────────────────────────────────────────
# SSO is configured but NOT enforced (dry-run mode).
# No auth_request directives are active.
# Change protectedMode to "portal" or "docset" to enable enforcement.

location / {
    try_files $uri $uri/ $uri.html /index.html;
}
`.trim();
}

function vercelNote(cfg: SamlConfig): string {
  const scope = cfg.protectedMode === 'portal'
    ? 'all deployments'
    : cfg.protectedMode === 'docset'
      ? `specific deployments (map docset rules to deployment environments)`
      : 'not enforced (protectedMode=none)';

  return `
# ── Vercel deployment note ───────────────────────────────────────────────────
# For Vercel Pro/Enterprise, use Vercel Authentication instead of nginx auth_request.
# Add to vercel.json:
#
# {
#   "authentication": {
#     "deploymentType": "all_deployments"
#   }
# }
#
# Scope: ${scope}
# See: https://vercel.com/docs/security/vercel-authentication
#
# For per-docset protection on Vercel, deploy each docset as a separate project
# and enable Vercel Authentication per project.
`.trim();
}

function generateConfig(cfg: SamlConfig): string {
  const header = `# nginx auth config — generated by scripts/generate-nginx-auth-config.ts
# Generated: ${new Date().toISOString()}
# protectedMode: ${cfg.protectedMode}
#
# USAGE: include this file inside your nginx server {} block.
# DO NOT commit this file — it may contain environment-specific values.
`;

  let body: string;
  if (cfg.protectedMode === 'portal') {
    body = portalBlock(cfg);
  } else if (cfg.protectedMode === 'docset') {
    body = docsetBlock(cfg.docsetRules ?? [], cfg);
  } else {
    body = noneBlock();
  }

  return [header, body, '', vercelNote(cfg)].join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {configPath: string; stdout: boolean} {
  const args = process.argv.slice(2);
  const stdout = args.includes('--stdout');
  const idx = args.indexOf('--config');
  const configPath = idx !== -1 && args[idx + 1]
    ? path.resolve(process.cwd(), args[idx + 1])
    : path.resolve(process.cwd(), 'saml.config.json');
  return {configPath, stdout};
}

const {configPath, stdout} = parseArgs();

if (!fs.existsSync(configPath)) {
  console.error(`[nginx-auth-config] ERROR: config file not found: ${configPath}`);
  console.error('  Copy saml.config.example.json to saml.config.json and fill in your IdP details.');
  process.exit(1);
}

let cfg: SamlConfig;
try {
  cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[nginx-auth-config] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const validationErrors = validateSamlConfig(cfg);
const hardErrors = validationErrors.filter(e => e.level === 'error');
if (hardErrors.length > 0) {
  console.error('[nginx-auth-config] ERROR: saml.config.json is invalid — run npm run validate-saml first.');
  for (const e of hardErrors) {
    console.error(`  ${e.field}: ${e.message}`);
  }
  process.exit(1);
}

const output = generateConfig(cfg);

if (stdout) {
  process.stdout.write(output + '\n');
} else {
  const outPath = path.resolve(process.cwd(), 'nginx-auth.conf.generated');
  fs.writeFileSync(outPath, output + '\n', 'utf8');
  console.log(`[nginx-auth-config] written: ${outPath}`);
  console.log(`[nginx-auth-config] protectedMode: ${cfg.protectedMode}`);
  console.log('[nginx-auth-config] add nginx-auth.conf.generated to .gitignore');
  console.log('[nginx-auth-config] in nginx.conf server{} block: include /path/to/nginx-auth.conf.generated;');
}
