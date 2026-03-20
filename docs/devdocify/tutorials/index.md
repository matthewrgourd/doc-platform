---
sidebar_position: 1
slug: /tutorials
title: Tutorials
---

# Tutorials

Use tutorials for end-to-end learning paths where each step builds on the previous one.

## Tutorial path: first successful preview

Use this sequence to go from clone to validated preview:

1. Start local development:
   - `npm install --legacy-peer-deps`
   - `npm start`
2. Explore existing product docsets:
   - [TfL getting started](/tfl/getting-started)
   - [Petstore getting started](/petstore/getting-started)
3. Validate the production build:
   - `npm run build`
   - `npm run serve`
4. Confirm API playground behavior:
   - [TfL playground](/tfl/api-playground)
   - [Petstore playground](/petstore/api-playground)

## Expected outcome

You should be able to run the full docs experience locally and confirm that build + route behavior works before opening a PR.
