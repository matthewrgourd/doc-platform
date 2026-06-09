# Skill: doc-platform-security-review

## Trigger conditions

Use this skill when a PR touches:
- OpenAPI specs (`static/openapi/`, `openapi/`)
- Auth config (`saml.config.*.json`, `rbac.config.*.json`, `assistant.config.*.json`)
- GitHub Actions workflows (`.github/workflows/`)
- Docs content that references auth flows, credentials, or endpoint URLs
- Any new environment variable or secret

## Runbook

### 1. Secrets and credentials check

Scan the diff for:
- [ ] No real API keys, tokens, passwords, or private URLs in any committed file
- [ ] No `authorization` or `x-api-key` header values in OpenAPI specs (use `<YOUR_TOKEN>` placeholders)
- [ ] `assistant.config.json` is absent from the commit. It is gitignored, and only `*.example.json` is committed.
- [ ] `saml.config.json` and `rbac.config.json` are absent from the commit
- [ ] No `.env` files committed
- [ ] `build/` directory not committed

If any of these fail, block the PR and remove the secret before proceeding.

### 2. OpenAPI spec review

For changes to `static/openapi/*.json` or `openapi/*.json`:

- [ ] Run `npm run normalize-openapi -- --input <file>`: must pass with no errors
- [ ] `servers[].url` values use HTTPS in production specs
- [ ] No internal hostnames, staging URLs, or localhost in production specs
- [ ] Example request/response bodies do not contain real user data or PII
- [ ] Curated playground specs (`static/openapi/`) include only the intended demo endpoints

### 3. GitHub Actions workflow review

For changes to `.github/workflows/`:

- [ ] No secret value is hardcoded. All sensitive values use `${{ secrets.NAME }}`
- [ ] New secrets are documented in `_planning/05-validation/ci-secrets-and-permissions.md`
- [ ] Workflows that create PRs or push commits use scoped tokens, not `GITHUB_TOKEN` with broad permissions
- [ ] `docs-draft-update.yml`: confirm the `--draft` flag is present on `gh pr create`. Auto-merge must not be possible
- [ ] No `pull_request_target` trigger without explicit `head.repo.full_name` checks

### 4. Docs content review

For new or changed docs pages that reference auth or credentials:

- [ ] All credential examples use obviously fake values (`sk-XXXX`, `your-api-key`, `<token>`)
- [ ] No screenshots or code blocks contain real tokens
- [ ] SAML setup docs reference IdP vendor docs rather than embedding private metadata
- [ ] Pages that describe protected routes are consistent with the RBAC config schema

### 5. Assistant config review

For changes to `assistant.config.example.json` or `scripts/validate-assistant-*.ts`:

- [ ] `npm run validate-assistant-quality` passes against the example config
- [ ] `citationMode` is not `"none"` in the example
- [ ] `safety.refusePromptInjection` and `safety.requireGrounding` are both `true` in the example
- [ ] `latencyBudgetMs` does not exceed 45000

### 6. Evidence line for PR

Add a security section to the PR description:

```
## Security checklist
- No secrets in diff: confirmed
- OpenAPI specs: normalize-openapi pass, no real credentials
- Workflows: scoped tokens, no hardcoded secrets
- Assistant config: validate-assistant-quality pass
```

Leave items out if they are not relevant to the change.

## Outputs

- PR description with security checklist evidence
- Any secrets removed or replaced with placeholders before merge
- New secrets documented in `_planning/05-validation/ci-secrets-and-permissions.md`
