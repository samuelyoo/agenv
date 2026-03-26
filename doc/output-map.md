# Output Map

## 1. Purpose

This document defines the generated output surface for MVP `agenv`. It answers three questions:

1. which files may be generated
2. which target owns each file
3. whether each file is shared or local

The planner should treat this document as the source contract for path selection.

## 2. Output layers

Generated files are organized into three layers:

| Layer | Description |
| --- | --- |
| `base` | Repo-level config and shared conventions |
| `skills-agents` | Reusable skill and agent markdown templates |
| `prompts` | Bootstrap prompts and task prompts |

## 3. Scope model

| Scope | Meaning |
| --- | --- |
| `shared` | File is safe and intended for version control |
| `local` | File is machine-specific or trust-sensitive and should be gitignored |

Some target families generate both shared and local files when `setup.scope` is `mixed`.

## 4. Shared baseline outputs

These files are not owned by a single adapter, but are part of the overall plan.

| Path | Layer | Scope | Condition | Purpose |
| --- | --- | --- | --- | --- |
| `ai-workspace.json` | `base` | `shared` | always | Canonical manifest |
| `docs/ai-architecture.md` | `base` | `shared` | any target selected | Shared dashboard conventions summary |
| `docs/ai-prompts/bootstrap.md` | `prompts` | `shared` | `generated.prompts` is `master` or `pack` | One-shot bootstrap prompt |
| `docs/ai-prompts/README.md` | `prompts` | `shared` | `generated.prompts` is not `none` | Prompt-pack index |
| `.env.example` | `base` | `shared` | one or more MCP presets require env vars | Placeholder env variables only |
| `ai-workspace.local.json` | `base` | `local` | local overrides are needed | Local override manifest |

## 5. Target output map

### Codex

| Path | Layer | Scope | Condition | Notes |
| --- | --- | --- | --- | --- |
| `AGENTS.md` | `base` | `shared` | `targets.codex = true` | Primary Codex project instructions |

### GitHub Copilot

| Path | Layer | Scope | Condition | Notes |
| --- | --- | --- | --- | --- |
| `.github/copilot-instructions.md` | `base` | `shared` | `targets.copilot = true` | Repo-level Copilot instructions |

### Claude

| Path | Layer | Scope | Condition | Notes |
| --- | --- | --- | --- | --- |
| `.claude/README.md` | `base` | `shared` | `targets.claude = true` | Claude workspace overview |
| `.claude/skills/build-page-shell.md` | `skills-agents` | `shared` | `targets.claude = true` and `generated.skills = true` | Dashboard skill |
| `.claude/skills/build-data-table.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/build-filter-panel.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/build-kpi-cards.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/build-chart-section.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/connect-api-resource.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/build-form-flow.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/handle-loading-empty-error-states.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/enforce-accessibility-and-responsive-layout.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/skills/write-dashboard-tests.md` | `skills-agents` | `shared` | same as above | Dashboard skill |
| `.claude/agents/ui-builder.md` | `skills-agents` | `shared` | `targets.claude = true` and `generated.agents = true` | Agent template |
| `.claude/agents/data-integrator.md` | `skills-agents` | `shared` | same as above | Agent template |
| `.claude/agents/table-specialist.md` | `skills-agents` | `shared` | same as above | Agent template |
| `.claude/agents/chart-specialist.md` | `skills-agents` | `shared` | same as above | Agent template |
| `.claude/agents/form-builder.md` | `skills-agents` | `shared` | same as above | Agent template |
| `.claude/agents/qa-reviewer.md` | `skills-agents` | `shared` | same as above | Agent template |
| `.claude/settings.local.json` | `base` | `local` | `targets.claude = true` and local settings are needed | Local-only Claude settings |

### MCP

| Path | Layer | Scope | Condition | Notes |
| --- | --- | --- | --- | --- |
| `.mcp.json` | `base` | `shared` | `targets.mcp = true` and config is share-safe | Repo MCP config with env placeholders |
| `.mcp.local.json` | `base` | `local` | `targets.mcp = true` and local-only server config is required | Local MCP override config |

### Cursor

| Path | Layer | Scope | Condition | Notes |
| --- | --- | --- | --- | --- |
| `.cursor/rules/context.mdc` | `base` | `shared` | `targets.cursor = true` | Cursor project context rule |
| `.cursor/rules/coding-style.mdc` | `base` | `shared` | `targets.cursor = true` | Cursor coding style rule |
| `.cursor/rules/framework.mdc` | `base` | `shared` | `targets.cursor = true` | Cursor framework-specific rule |
| `.cursor/rules/code-review.mdc` | `base` | `shared` | `targets.cursor = true` | Cursor code review rule |

### Windsurf

| Path | Layer | Scope | Condition | Notes |
| --- | --- | --- | --- | --- |
| `.windsurf/rules/context.md` | `base` | `shared` | `targets.windsurf = true` | Windsurf project context rule |
| `.windsurf/rules/coding-style.md` | `base` | `shared` | `targets.windsurf = true` | Windsurf coding style rule |
| `.windsurf/rules/framework.md` | `base` | `shared` | `targets.windsurf = true` | Windsurf framework-specific rule |
| `.windsurf/rules/code-review.md` | `base` | `shared` | `targets.windsurf = true` | Windsurf code review rule |

## 6. Prompt-pack outputs

Prompt outputs are shared by default because they are documentation artifacts, not secrets.

| Path | Layer | Scope | Condition |
| --- | --- | --- | --- |
| `docs/ai-prompts/build-page-shell.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/build-data-table.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/build-filter-panel.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/build-kpi-cards.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/build-chart-section.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/connect-api-resource.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/build-form-flow.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/handle-loading-empty-error-states.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/enforce-accessibility-and-responsive-layout.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/write-dashboard-tests.md` | `prompts` | `shared` | `generated.prompts = pack` |
| `docs/ai-prompts/ui-builder.md` | `prompts` | `shared` | `generated.prompts = pack` and `generated.agents = true` |
| `docs/ai-prompts/data-integrator.md` | `prompts` | `shared` | same as above |
| `docs/ai-prompts/table-specialist.md` | `prompts` | `shared` | same as above |
| `docs/ai-prompts/chart-specialist.md` | `prompts` | `shared` | same as above |
| `docs/ai-prompts/form-builder.md` | `prompts` | `shared` | same as above |
| `docs/ai-prompts/qa-reviewer.md` | `prompts` | `shared` | same as above |

## 7. Mode-to-output rules

### `setup.mode = base`

- Generate only `base` layer files.
- Do not generate skills, agents, or prompt packs.

### `setup.mode = skills`

- Generate `base` layer files.
- Generate skill templates when a target supports them.
- Do not generate agent templates unless explicitly enabled later.

### `setup.mode = agents`

- Generate `base` layer files.
- Generate skill templates and agent templates.
- Prompt files still depend on `generated.prompts`.

### `setup.mode = full`

- Generate all selected layers subject to target support and prompt settings.
- In practice, `generated.prompts = pack` is the more complete prompt setup because it adds richer best-practice prompt files beyond the generic bootstrap prompt.

## 8. Scope-to-output rules

### `setup.scope = shared`

- Generate only shared outputs.
- Do not create local manifests or local settings files.

### `setup.scope = local`

- Generate local-only configuration where applicable.
- Still generate `ai-workspace.json` as the shared baseline manifest because the planner requires a canonical project file.
- Route target settings that contain machine-specific values into local files.

### `setup.scope = mixed`

- Generate all shared outputs.
- Generate local files only when the selected target or preset requires them.

## 9. Conflict rules

- Generated files with a recognized header may be overwritten on later runs.
- Existing non-generated files at mapped destinations must cause a warning and be marked `skipped` unless explicit overwrite is enabled.
- Local files must never be written into tracked shared paths.

## 10. Unsupported mapping rules

- If a selected target cannot represent a chosen feature, the planner must emit a warning and skip only the unsupported file group.
- Unsupported mappings must not block unrelated targets.
- The output map is authoritative for file destinations. Adapters may not invent extra files outside this map in MVP.

## 11. Planner result expectations

Every planned file should carry at minimum:

- `target`
- `path`
- `layer`
- `scope`
- `purpose`
- `generated`
- `trustSensitive`
- `status`

This allows `generate`, `diff`, and `doctor` to reason about the same file set consistently.
