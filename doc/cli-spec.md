# CLI specification

This is the public command contract for agenv 3.0. The executable source of truth is `src/cli/index.ts`. The binary requires Node.js 20 or newer and operates on the current directory.

## Commands

| Command | Important options | Behavior |
| --- | --- | --- |
| `agenv init` | `--yes`, `--dry-run`, `--json`, `--targets`, `--project-type`, `--framework`, `--language`, `--setup-depth`, `--setup-mode`, `--config-scope`, `--prompts` | Inspect the repository and create the canonical manifest |
| `agenv import` | `--json`, `--write`, `--from` | Scan modern and legacy platform files; report by default |
| `agenv generate` | `--dry-run`, `--json`, `--force`, `--watch`, `--targets`, `--layer`, `--scope` | Render enabled outputs from the manifest |
| `agenv diff` | `--json`, `--targets`, `--layer`, `--scope`, `--explain` | Preview the same plan without writing |
| `agenv doctor` | `--json`, `--strict`, `--ci`, `--targets`, `--fix`, `--explain <code>` | Diagnose manifest, ownership, environment, and platform configuration |
| `agenv audit` | `--json`, `--strict` | Check security, MCP trust, pack provenance, and ownership |
| `agenv add pack <id>` | `--json`, `--list` | Add a built-in pack reference |
| `agenv add preset <id>` | `--json`, `--list` | Add a verified MCP preset |
| `agenv install` | `--dry-run`, `--json` | Resolve packs and write `ai-workspace.lock` |
| `agenv pack <dir>` | `--json` | Validate a local pack directory |
| `agenv templates list` | `--json` | List starter templates |
| `agenv update` | none | Install the latest global npm release |

Every command supports its generated `--help`; the root supports `--version`.

## Init values

- Targets: `codex`, `copilot`, `claude`, `mcp`, `cursor`, `windsurf`
- Project types: `dashboard`, `web-app`, `api-service`, `full-stack`, `library`, `cli-tool`, `mobile`
- Frameworks: `react`, `nextjs`, `vite-react`, `express`, `fastify`, `hono`, `koa`, `django`, `flask`, `fastapi`, `gin`, `echo`, `actix`, `axum`, `spring`, `rails`, `none`
- Languages: `ts`, `python`, `go`, `rust`, `java`, `ruby`, `other`
- Setup depth: `recommended`, `semi-custom`, `advanced`
- Setup mode: `base`, `skills`, `agents`, `full`
- Scope: `shared`, `local`, `mixed`
- Prompts: `none`, `starter`, `master`, `pack`

In non-interactive mode, agenv uses detected framework and language values. A detected backend framework selects `api-service`; an unframed generic repository selects `library`; frontend frameworks select `web-app`, unless `--project-type` overrides the inference.

## Manifest resolution

Commands look for `ai-workspace.json`, `ai-workspace.yaml`, then `ai-workspace.yml`. A local JSON/YAML override is merged automatically when present. Pack installations are locked in `ai-workspace.lock`.

## Output and safety

- `--dry-run` never writes.
- `import` is report-only unless `--write` is given.
- Human-readable output uses paths relative to the repository.
- `--json` produces machine-readable output on commands that expose it.
- Existing files not owned by agenv are skipped unless `generate --force` is used.
- `doctor --ci` emits JSON and treats errors or warnings as a failed CI result.
- `doctor --fix` applies only findings with a registered safe fix.
- Repeated generation from unchanged inputs is deterministic.

## Exit behavior

| Code | Meaning |
| --- | --- |
| `0` | Command completed successfully |
| `1` | Validation, diagnosis, audit, or runtime failure |
| `2` | Commander-level invalid usage |

Strict doctor/audit modes turn warnings into a non-zero result. `diff` returns success when changes are present because it is a preview, not a policy gate.

## Examples

```bash
agenv init --yes --targets codex,claude,cursor,mcp
agenv import --from claude,cursor,mcp --json
agenv generate --dry-run
agenv diff --explain
agenv doctor --ci
agenv audit --strict
agenv add preset github
agenv install
```
