---
project_name: doc-platform
user_name: Matt
date: '2026-03-20'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
status: complete
optimized_for_llm: true
---

# Project context for AI agents

_This file captures unobvious rules and patterns for implementing changes in this repo. Read it before editing code or docs._

---

## Technology stack and versions

| Area | Choice |
|------|--------|
| Runtime | Node **20.x** (`engines` in `package.json`) |
| Framework | **Docusaurus 3.9.2** (`@docusaurus/core`, `preset-classic`) |
| React | **19.x** |
| TypeScript | **~5.6.2** (editor/typecheck; build is Docusaurus/webpack) |
| API docs UI | **@scalar/docusaurus** ^0.5.23 |
| MDX | **@mdx-js/react** ^3 |
| Diagrams | **@docusaurus/theme-mermaid** (enable `markdown.mermaid: true`) |
| YAML | **yaml** ^2.8 (if parsing/generating in tooling) |

Install uses **`npm install --legacy-peer-deps`** (documented in README) because of peer dependency edges in the stack.

---

## Critical implementation rules

### Language-specific (TypeScript / JS)

- `tsconfig.json` extends `@docusaurus/tsconfig`; it is mainly for IDE/typecheck, not a separate app compile step. Run **`npm run typecheck`** (`tsc`) after non-trivial TS changes.
- Prefer **type-only imports** where applicable (`import type { ... }`).
- Docusaurus **future v4** flag is enabled in `docusaurus.config.ts`; do not remove without checking upgrade notes.

### Framework-specific (Docusaurus)

- **Three separate docs plugin instances**: default preset docs id `devdocify` (`path: docs/devdocify`, `routeBasePath: 'docs'`), plus plugins `tfl` and `petstore` with their own `path`, `routeBasePath`, and **sidebar files** (`sidebarsDevdocify.ts`, `sidebarsTfl.ts`, `sidebarsPetstore.ts`). Adding a doc page requires updating the correct sidebar.
- **`onBrokenLinks: 'throw'`** — internal links must resolve or the build fails. Run **`npm run build`** before considering work done.
- **Blog is disabled** (`blog: false` in preset). Do not assume blog routes exist.
- **Homepage and marketing-style pages** live under `src/pages/` (MDX/TSX). Product guides live under `docs/{devdocify,tfl,petstore}/`.
- **Curated OpenAPI JSON** for playgrounds lives under **`static/openapi/`** (e.g. `petstore-playground.json`, `tfl-playground.json`). Playground pages and download links should stay aligned with those specs (same operations and copy).
- **Navbar/footer** links in `docusaurus.config.ts` must stay consistent with real routes (`/docs`, `/tfl`, `/petstore`, playground paths).

### Testing rules

- No project test runner in `package.json` today. **Verification = `npm run build`** (and `npm run typecheck` when TS changed). If you add Vitest/Jest later, document the command here.

### Code quality and style

- No ESLint/Prettier config files in repo root; follow existing **formatting and tone** in neighboring files.
- **Documentation prose**: prefer clear, direct English; use **contractions** where natural (negations like *don't*, *isn't*) per [Google developer documentation style — contractions](https://developers.google.com/style/contractions). **US English** for user-facing copy (e.g. *containerized*).
- **Diátaxis**-style separation is intentional (tutorials, how-to, reference, explanation) on the devdocify hub; do not collapse lanes without discussion.

### Development workflow

- **Docusaurus cache**: `npm run clear` if you see stale build behavior.
- **Internal-only files**: `_bmad/` (BMAD method assets) and `.cursor/` are gitignored; **`_bmad-output/`** is intended for **committed** planning/context artifacts like this file unless you choose to ignore it.
- **Local-only doc**: `docs/tool-delegation-strategy.md` is listed in `.gitignore` — do not rely on it being in the repo for others.

### Critical don't-miss rules

- Do **not** point playground or tutorials at **full** upstream OpenAPI URLs if the site promise is **curated anonymous GETs**; keep **playground spec + markdown** in sync.
- Do **not** change `url` / `baseUrl` in config without understanding impact on **sitemap, OG URLs, and broken link checks** (currently `https://petstore3.swagger.io` / `/` — may be placeholder for demos).
- **Scalar / theme CSS**: custom layout lives in `src/css/custom.css`; check light/dark when changing global styles.
- After editing **sidebars**, confirm **category labels and slugs** match folder structure.

---

## Usage guidelines

**For AI agents**

- Read this file (and `README.md` for run/deploy) before large changes.
- Prefer **minimal diffs**; match patterns in adjacent files.
- Run **`npm run build`** before finishing; fix broken links and MDX errors.

**For humans**

- Update this file when the stack, doc topology, or verification commands change.
- BMAD **next steps** (if you are driving the method): from `_bmad/bmm/workflows/`, typical order is **1-analysis/create-product-brief** → **2-plan-workflows/create-prd** → **3-solutioning/** → **4-implementation/**, or use **bmad-quick-flow/quick-spec** for a shorter path. **`document-project`** is useful for generating deep repo documentation into planning artifacts.

Last updated: 2026-03-20
