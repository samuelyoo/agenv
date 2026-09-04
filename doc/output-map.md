# Generated output map

This is the path contract for agenv 3.0. The executable source of truth is `src/planner/output-map.ts`.

## Scopes and layers

- `shared` files are intended for version control.
- `local` files contain machine-specific choices and should be ignored.
- `base` contains core configuration, `skills-agents` contains reusable Claude resources, and `prompts` contains task prompts.

## Shared outputs

| Path | Layer | Condition |
| --- | --- | --- |
| `ai-workspace.json` | base | Always; canonical manifest |
| `docs/ai-architecture.md` | base | At least one target is enabled |
| `docs/ai-prompts/bootstrap.md` | prompts | Prompt mode is not `none` |
| `docs/ai-prompts/README.md` | prompts | Prompt mode is not `none` |
| `docs/ai-prompts/<name>.md` | prompts | Prompt mode is `pack`; names depend on project type |
| `.env.example` | base | At least one selected MCP preset requires environment variables |

`ai-workspace.local.json` is the local override output when setup scope is `local` or `mixed`.

## Platform instructions

| Target | Path | Layer | Scope |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | base | shared |
| GitHub Copilot | `.github/copilot-instructions.md` | base | shared |
| Claude Code | `.claude/CLAUDE.md` | base | shared |
| Claude Code skills | `.claude/skills/<name>/SKILL.md` | skills-agents | shared |
| Claude Code agents | `.claude/agents/<name>.md` | skills-agents | shared |
| Claude Code settings | `.claude/settings.local.json` | base | local |
| Cursor | `.cursor/rules/context.mdc` | base | shared |
| Cursor | `.cursor/rules/coding-style.mdc` | base | shared |
| Cursor | `.cursor/rules/framework.mdc` | base | shared |
| Cursor | `.cursor/rules/code-review.mdc` | base | shared |
| Windsurf | `.windsurf/rules/context.md` | base | shared |
| Windsurf | `.windsurf/rules/coding-style.md` | base | shared |
| Windsurf | `.windsurf/rules/framework.md` | base | shared |
| Windsurf | `.windsurf/rules/code-review.md` | base | shared |

Skill and agent names are selected from the project's type. Skills use one directory per skill and include required YAML frontmatter. Generated ownership comments are inserted after YAML frontmatter so platform discovery remains valid.

## MCP host configuration

MCP files are generated only when `targets.mcp` is enabled and the matching host target is enabled.

| Host target | Path | Format |
| --- | --- | --- |
| Claude Code | `.mcp.json` | JSON with top-level `mcpServers` |
| Codex | `.codex/config.toml` | TOML with `mcp_servers` tables |
| Cursor | `.cursor/mcp.json` | JSON with top-level `mcpServers` |
| GitHub Copilot / VS Code | `.vscode/mcp.json` | JSON with top-level `servers` |

Windsurf rules are generated, but its MCP configuration is user-level. The planner emits an installation warning instead of creating a misleading project file.

MCP output is trust-sensitive but contains no literal secrets. Each renderer uses its host's native environment placeholder syntax. Audit metadata stays in agenv's preset catalog and is never injected as an unsupported config key.

## Planning rules

- `base` mode generates base files only.
- `skills` adds skills; `agents` and `full` add skills and agents.
- Prompt files also depend on `generated.prompts`.
- A recognized generated file may be updated on later runs.
- An existing, unowned destination is skipped unless `--force` is supplied.
- Unsupported host mappings warn and skip only that file group.
- Every plan entry records target, path, layer, scope, purpose, ownership, trust sensitivity, and status.
