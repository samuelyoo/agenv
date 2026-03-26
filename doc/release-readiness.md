# Release Readiness — agenv

## 1. Public Contract

agenv's public contract is defined across three pillars:

1. **Manifest schema** — `src/manifest/schema.ts` (Zod). All valid manifests conform to this schema.
2. **Output map** — `src/planner/output-map.ts`. Every generated file path, its target, layer, scope, and trust sensitivity is defined here.
3. **CLI surface** — `src/cli/index.ts`. Commands: `init`, `generate`, `diff`, `doctor`, `templates list`.

Breaking changes to any of these require a major version bump.

## 2. Versioning Source of Truth

- `package.json` → `version` field is the **single source of truth**
- The CLI reads version from `package.json` at runtime via `createRequire` (see `src/cli/index.ts`)
- No hardcoded version strings exist anywhere else
- CHANGELOG.md tracks all version history

## 3. Generated Output Contract by Target

| Target | Files | Trust-Sensitive |
|--------|-------|-----------------|
| `codex` | `AGENTS.md` | No |
| `copilot` | `.github/copilot-instructions.md` | No |
| `claude` | `.claude/README.md`, `.claude/skills/*.md`, `.claude/agents/*.md`, `.claude/settings.local.json` | `settings.local.json` only |
| `mcp` | `.mcp.json`, `.mcp.local.json` | Yes (both) |
| `cursor` | `.cursor/rules/context.mdc`, `.cursor/rules/coding-style.mdc`, `.cursor/rules/framework.mdc`, `.cursor/rules/code-review.mdc` | No |
| `windsurf` | `.windsurf/rules/context.md`, `.windsurf/rules/coding-style.md`, `.windsurf/rules/framework.md`, `.windsurf/rules/code-review.md` | No |

Additional shared outputs (all targets):
- `ai-workspace.json` — canonical manifest (also accepted: `.yaml`, `.yml`)
- `docs/ai-architecture.md` — shared conventions summary
- `docs/ai-prompts/*.md` — prompt packs (when `generated.prompts = "pack"`)
- `.env.example` — when MCP presets require env vars

## 4. Security & Trust Model

### MCP Trust Levels

Every MCP preset in `src/mcp/presets.ts` has a `trustLevel`:

| Level | Meaning | Scope |
|-------|---------|-------|
| `safe` | Read-only or low-risk | Shared (`.mcp.json`) |
| `review` | Network access or data exposure | Shared with `_trustNote` annotation |
| `dangerous` | File system write, code execution | Local only (`.mcp.local.json`) |

Current preset trust assignments (15 presets):

| Preset | Trust Level |
|--------|------------|
| `brave-search`, `memory`, `sentry`, `notion`, `sequential-thinking` | safe |
| `github`, `postgres`, `sqlite`, `fetch`, `slack`, `linear`, `stripe`, `atlassian` | review |
| `filesystem`, `puppeteer` | dangerous |

### Trust-Sensitive Outputs

Files marked `trustSensitive: true` in the output map:
- `.mcp.json` — shared MCP config (env var placeholders only, no secrets)
- `.mcp.local.json` — local MCP overrides (may contain real credentials)

### Security Reporting

Vulnerabilities should be reported via GitHub Security Advisories:
`https://github.com/samuelyoo/agenv/security/advisories/new`

See `SECURITY.md` for the full disclosure policy (3/7/30 day response timeline).

## 5. Release Checklist

Before any release:

- [ ] All tests pass: `npx vitest run`
- [ ] Type check clean: `npx tsc --noEmit`
- [ ] Build succeeds: `npx tsc -p tsconfig.json`
- [ ] `package.json` version updated
- [ ] CHANGELOG.md updated with all changes
- [ ] README output table matches `src/planner/output-map.ts`
- [ ] `doc/output-map.md` target sections match source
- [ ] No hardcoded version strings (CLI reads from package.json)
- [ ] `doctor --ci` exits clean on a freshly-generated workspace
- [ ] Trust-sensitive files are correctly scoped (dangerous presets → local only)

## 6. Breaking-Change Policy

A breaking change is any modification to:

1. Manifest schema field names or types (removals, renames, type changes)
2. Generated file paths (moves, renames, deletions)
3. CLI command names or required flag semantics
4. MCP preset IDs (renames or removals)

Breaking changes require:
- Major version bump (semver)
- CHANGELOG entry under `### Breaking Changes`
- Migration notes if schema changes affect existing manifests
