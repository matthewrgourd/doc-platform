# Skill: doc-platform-planning

## Trigger conditions

Use this skill when:
- Starting a new story or epic slice
- Framing a new ADR for an architectural decision
- Breaking down a vague requirement into a task board

## Runbook

### 1. Read the epic and story context

```
_planning/04-delivery/epics-and-stories.md          — full epic/story map
_planning/04-delivery/sprint-planning/post-mvp-epic-N-plan.md   — sprint plan
_planning/04-delivery/sprint-planning/post-mvp-epic-N-task-board.md  — current task status
```

Identify:
- The story's acceptance criteria (exact, testable conditions)
- Dependencies on other stories or scripts
- The definition of done

### 2. Check implementation readiness

Before writing code, confirm:
- All input contracts (schemas, config shapes) are defined
- Scripts or modules this story imports already exist and are stable
- The relevant example config file exists (`*.config.example.json`)

If a dependency is missing, create a planning note before proceeding.

### 3. Write the worklog before coding

Create `_planning/04-delivery/sprint-planning/post-mvp-epic-N-story-N-M-worklog.md`
with these sections:
- Summary (1–2 sentences)
- Work to be done (bullet list matching acceptance criteria)
- Acceptance criteria checklist (copied from the story, formatted as `- [ ]`)

This doubles as a pre-implementation spec review.

### 4. ADR framing (when a non-obvious trade-off exists)

If the implementation requires a significant architectural choice:
1. Check `_planning/03-product-design/adrs/` for an existing ADR on the topic.
2. If none exists, draft a new ADR with:
   - Status: Proposed
   - Context (what problem and constraints)
   - Decision options (2–3, with pros/cons)
   - Decision (chosen option with rationale)
   - Consequences (what changes, what new risks)
3. Get the ADR reviewed before implementation begins.

### 5. Task board update

After implementation:
- Mark completed tasks `[x]` in the task board.
- Mark the sprint review checklist items `[x]` when verified.
- If new tasks were discovered, add them to the task board before marking the story done.

## Outputs

- Worklog file (pre-coding spec + post-coding evidence)
- Updated task board (`[x]` items)
- Updated sprint review checklist
- ADR (if a significant trade-off was resolved)
