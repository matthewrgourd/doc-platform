# Skill: doc-platform-verification-loop

## Trigger conditions

Use this skill when:
- A story implementation is complete and needs pre-merge verification
- Preparing a PR for review (attach evidence)
- Debugging a failing CI check

## Runbook

### 1. Run targeted checks for the change type

Match the change to the relevant subset of checks. Do not run all checks for every change.

| Change type | Required checks |
|---|---|
| New/modified script in `scripts/` | `typecheck`, script's own `npm run <script>` against example input |
| Docusaurus config, sidebars, docs content | `typecheck`, `lint-content`, `build` |
| GitHub Actions workflow | YAML syntax only (no local runner needed) |
| OpenAPI spec | `normalize-openapi`, `health-check` |
| Assistant config schema | `validate-assistant`, `validate-assistant-quality` |
| SAML/RBAC config | `validate-saml`, `validate-rbac` |
| Route or content structure change | `manifest`, `build` |
| Any release candidate | full sequence below |

### 2. Full verification sequence (release candidate)

Run in this order — stop and fix on first failure:

```bash
npm run typecheck
npm run lint-content
npm run validate-assistant-quality
npm run manifest
npm run build
npm run health-check
```

### 3. Attach evidence to PR

For each check that ran, note in the PR description:
- Command run
- Pass/fail status
- Key output lines (errors, warnings, timing)

Example format:
```
## Verification evidence
- `npm run typecheck` — pass
- `npm run build` — pass, 0 errors, 2 warnings (pre-existing CSS minimizer)
- `npm run health-check` — pass, 6/6 endpoints returned 200
```

### 4. Preview link (Vercel)

After pushing the branch, wait for the Vercel preview deployment to complete.
Attach the preview URL to the PR. Verify:
- [ ] Navigation works on both desktop and mobile
- [ ] Changed pages render correctly
- [ ] API playground loads and responds (if playground routes are affected)
- [ ] No 404s on changed routes

### 5. Debugging failing CI

If a CI check fails:

1. Read the full job log — do not guess the cause from the job name alone.
2. Check if the failure is pre-existing on `main` before assuming it is caused by your change.
3. For build failures: run `npm run build` locally to reproduce.
4. For link check failures: check `onBrokenLinks` setting in `docusaurus.config.ts`.
5. For health check failures: check `static/openapi/*.json` against the live endpoints.
6. For typecheck failures: check the import path — scripts use `.js` extensions in imports
   (TypeScript resolves these to `.ts` at compile time with `moduleResolution: bundler`).

## Outputs

- PR description with evidence block
- Preview URL attached to PR
- All required CI checks green before requesting review
