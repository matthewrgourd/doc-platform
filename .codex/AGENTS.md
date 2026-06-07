# DevDocify — agent guidance

This file configures agent behavior for the `doc-platform` repository.
It supplements `CLAUDE.md` and applies to any AI coding agent working in this repo.

---

## Planning-first behavior

For any task that touches more than one file or introduces a new script, workflow,
or config pattern, plan before coding:

1. Read the relevant planning doc in `_planning/04-delivery/sprint-planning/` to
   understand the scope, acceptance criteria, and definition of done for the story.
2. Read the relevant worklog (e.g. `post-mvp-epic-N-story-N-M-worklog.md`) to
   understand exactly what was specified.
3. Read existing files that the new work depends on before writing new code.
4. Implement only what the story specifies — do not expand scope.

After implementing:
- Confirm `npm run typecheck` passes.
- Confirm the relevant `npm run` scripts (see `package.json`) run without errors.
- Mark the sprint review checklist items as `[x]` if all criteria are met.

---

## File and script conventions

- All build/validation scripts live in `scripts/` and are TypeScript (`.ts`).
- Scripts are invoked via `npx tsx scripts/<name>.ts` and are exposed as npm scripts
  in `package.json`.
- New scripts must export their core logic as named functions so they can be imported
  by other scripts without triggering CLI side-effects. See `validate-assistant-config.ts`
  for the `isMain` guard pattern.
- OpenAPI specs live in `static/openapi/` (curated demo specs) and `openapi/` (raw inputs).
- Docset content lives in `docs/<docset>/`.
- Sidebar files are `sidebars<Docset>.ts` at the repo root.

---

## Security checklist for docs and API surface changes

Before merging any change that modifies OpenAPI specs, auth config, or API playground routes:

- [ ] No real credentials, tokens, or private URLs in committed files.
- [ ] No `authorization` header examples with real values in OpenAPI specs.
- [ ] `assistant.config.json` is gitignored — never commit the real config.
- [ ] SAML and RBAC config files (`saml.config.json`, `rbac.config.json`) are gitignored.
- [ ] Any new environment variable is documented in the relevant example config file.
- [ ] `validate-saml-config.ts`, `validate-rbac-config.ts`, and `validate-assistant-quality.ts`
     all pass against example configs.

---

## Test and verification expectations

Verification is done by running the project's npm scripts, not by writing unit test files.
Before marking a story done:

| Check | Command |
|---|---|
| TypeScript types | `npm run typecheck` |
| Content lint (includes + variables) | `npm run lint-content` |
| Route manifest | `npm run manifest` |
| Playground health | `npm run health-check` |
| Search index | `npm run build-search-index` |
| Assistant quality | `npm run validate-assistant-quality` |
| Full build | `npm run build` |

Run only the checks relevant to the change. A full `npm run build` is required before
marking any story that touches Docusaurus config, sidebars, or docs content as done.

---

## Doc update requirements

When behavior changes, update docs before the PR is marked ready for review:

- If a script's CLI interface changes: update the JSDoc header in the script file.
- If a GitHub Actions workflow changes: update `_planning/05-validation/` if the change
  affects a documented gate or SLO.
- If a new npm script is added: add it to the table in `CLAUDE.md` if it is a primary
  workflow command.
- If a config schema changes: update the relevant example config file and the
  `validate-*` script that checks it.

---

## Planning artifact paths

| Artifact type | Location |
|---|---|
| Epic plans | `_planning/04-delivery/sprint-planning/post-mvp-epic-N-plan.md` |
| Task boards | `_planning/04-delivery/sprint-planning/post-mvp-epic-N-task-board.md` |
| Story worklogs | `_planning/04-delivery/sprint-planning/post-mvp-epic-N-story-N-M-worklog.md` |
| Sprint review checklists | `_planning/04-delivery/sprint-planning/post-mvp-epic-N-sprint-review-checklist.md` |
| ADRs | `_planning/03-product-design/adrs/` |
| Validation docs | `_planning/05-validation/` |
| Baseline | `_planning/00-current-state/baseline.md` |
