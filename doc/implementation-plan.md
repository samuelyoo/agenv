# Implementation Plan

## 1. Purpose

This document turns the TRD phases into a practical task checklist for the first working version of `agenv`. The plan is intentionally vertical-slice oriented so the project becomes usable early.

## 2. Milestones

### Milestone 1: Foundation skeleton

Goal: create a buildable package with a working CLI shell and manifest core.

Checklist:

- [ ] Initialize `package.json`, TypeScript config, and build scripts
- [ ] Add CLI entrypoint and command routing
- [ ] Create `src/` module layout from the TRD
- [ ] Add manifest types, schema, defaults, and normalization
- [ ] Add manifest load and save helpers
- [ ] Add baseline test runner and lint or format choice

Exit criteria:

- `agenv --help` works
- `agenv init --help` works
- manifest schema validates a recommended dashboard manifest

### Milestone 2: Repo inspection and planning

Goal: detect likely stack choices and compute deterministic planned outputs.

Checklist:

- [ ] Add `package.json` inspection helper
- [ ] Detect framework candidates: React, Next.js, Vite React
- [ ] Detect dependency hints for Tailwind, TanStack Query, TanStack Table, React Hook Form, and Zod
- [ ] Detect conflicting existing AI config files
- [ ] Implement `GenerationPlan` types
- [ ] Implement output-map-based planner
- [ ] Implement warning generation for unsupported combinations and scope conflicts

Exit criteria:

- planner returns stable file plans for fixture manifests
- warnings appear for unsupported mappings
- repo detection produces sensible defaults for fixture repos

### Milestone 3: File writer and diff engine

Goal: make planning observable and safe before full rendering breadth.

Checklist:

- [ ] Implement generated-header helpers
- [ ] Implement stable write behavior with unchanged-file detection
- [ ] Implement `diff` summary model
- [ ] Implement overwrite protection for non-generated files
- [ ] Implement dry-run support shared by `init` and `generate`

Exit criteria:

- `agenv diff` can report create, update, unchanged, and skipped states
- repeated writes do not rewrite unchanged files
- generated headers are recognized on subsequent runs

### Milestone 4: First vertical slice

Goal: ship one end-to-end useful target before broadening output support.

Checklist:

- [ ] Implement Codex adapter
- [ ] Render `AGENTS.md` from normalized manifest
- [ ] Implement `generate` using manifest load, planner, adapter render, and writer
- [ ] Add snapshot tests for `AGENTS.md`

Exit criteria:

- `agenv generate` can create `AGENTS.md` from a saved manifest
- `agenv diff` shows Codex file changes before write

### Milestone 5: Remaining MVP adapters

Goal: complete the documented target set.

Checklist:

- [ ] Implement Copilot adapter
- [ ] Implement Claude base adapter output
- [ ] Implement Claude skills output
- [ ] Implement Claude agent output
- [ ] Implement MCP adapter with preset registry and env placeholders
- [ ] Implement `.env.example` generation when MCP presets need placeholders

Exit criteria:

- one manifest can generate Codex, Copilot, Claude, and MCP outputs
- unsupported target features produce warnings instead of crashes

### Milestone 6: `init` wizard

Goal: create the dashboard-first onboarding flow promised in the PRD.

Checklist:

- [ ] Implement staged wizard flow
- [ ] Add recommended, semi-custom, and advanced depth branching
- [ ] Add preview step showing planned files and warnings
- [ ] Add `--yes` recommended-default path
- [ ] Add non-interactive flags for key manifest fields
- [ ] Implement `init --dry-run` and `init --json`

Exit criteria:

- a new repo can be initialized without editing JSON by hand
- the wizard asks only relevant follow-up questions
- the preview clearly distinguishes shared and local files

### Milestone 7: Diagnostics and hardening

Goal: make the tool safe, reviewable, and testable.

Checklist:

- [ ] Implement `doctor` command
- [ ] Add checks for malformed manifest, repo mismatch, invalid scope, and unsafe MCP config
- [ ] Add trust-sensitive warnings to `init`, `generate`, `diff`, and `doctor`
- [ ] Add fixture and integration tests
- [ ] Add snapshot coverage for all generated file families

Exit criteria:

- `doctor` returns non-zero for blocking issues
- repeated runs are deterministic
- fixture coverage exists for supported stacks

## 3. Recommended build order

To keep momentum high, the implementation order should be:

1. package scaffold
2. manifest schema and defaults
3. repo detection
4. planner
5. writer and diff
6. Codex adapter
7. `generate`
8. remaining adapters
9. `init`
10. `doctor`
11. test hardening

This gives the project a useful vertical slice early while keeping later work incremental.

## 4. Work breakdown by module

### CLI

- [ ] `src/cli/index.ts`
- [ ] `src/cli/commands/init.ts`
- [ ] `src/cli/commands/generate.ts`
- [ ] `src/cli/commands/diff.ts`
- [ ] `src/cli/commands/doctor.ts`
- [ ] `src/cli/commands/templates-list.ts`

### Manifest

- [ ] `src/manifest/schema.ts`
- [ ] `src/manifest/defaults.ts`
- [ ] `src/manifest/normalize.ts`
- [ ] `src/manifest/load.ts`
- [ ] `src/manifest/save.ts`

### Detection

- [ ] `src/detect/repo-inspector.ts`
- [ ] `src/detect/package-json.ts`
- [ ] `src/detect/frameworks.ts`
- [ ] `src/detect/dependencies.ts`
- [ ] `src/detect/existing-ai-files.ts`

### Planner

- [ ] `src/planner/build-plan.ts`
- [ ] `src/planner/output-map.ts`
- [ ] `src/planner/warnings.ts`

### Adapters

- [ ] `src/adapters/types.ts`
- [ ] `src/adapters/codex/*`
- [ ] `src/adapters/copilot/*`
- [ ] `src/adapters/claude/*`
- [ ] `src/adapters/mcp/*`

### Filesystem and diff

- [ ] `src/fs/write.ts`
- [ ] `src/fs/diff.ts`
- [ ] `src/fs/backups.ts`
- [ ] `src/fs/headers.ts`

### Diagnostics

- [ ] `src/doctor/run.ts`
- [ ] `src/doctor/checks/manifest.ts`
- [ ] `src/doctor/checks/compatibility.ts`
- [ ] `src/doctor/checks/security.ts`
- [ ] `src/doctor/checks/env.ts`
- [ ] `src/doctor/checks/paths.ts`
- [ ] `src/doctor/checks/repo-match.ts`

## 5. Test plan by milestone

### Early tests

- [ ] manifest validation unit tests
- [ ] defaults normalization unit tests
- [ ] output map unit tests

### Mid-stage tests

- [ ] planner fixture tests
- [ ] writer idempotence tests
- [ ] Codex snapshot tests

### Late-stage tests

- [ ] Claude snapshot tests
- [ ] Copilot snapshot tests
- [ ] MCP snapshot tests
- [ ] `init --yes --dry-run` integration test
- [ ] `generate` integration test
- [ ] `diff` integration test
- [ ] `doctor` integration test

## 6. Risks to watch during implementation

- Scope creep around non-dashboard project types
- Vendor-specific abstractions leaking into the shared manifest
- Unclear overwrite behavior for pre-existing user files
- MCP support drifting into install or execution logic
- Prompt-pack breadth expanding before the base generation path is stable

## 7. Definition of first working version

The first working version is reached when all of the following are true:

- a repo can run `agenv init --yes --dry-run`
- a saved manifest can drive `agenv generate`
- `AGENTS.md` generation works end to end
- `diff` shows changes without writing
- `doctor` catches clearly broken setups
- generated output is deterministic across repeated runs

## 8. Immediate next step

The highest-leverage next build step is:

1. scaffold the package
2. implement manifest schema and defaults
3. add repo detection
4. add planner types and output map
5. wire `generate` to a first Codex adapter

That sequence should produce the first real usable slice with the least churn.
