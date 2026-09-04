# Release readiness

## Public contract

agenv's public contract is defined by:

1. `src/manifest/schema.ts` — accepted manifests.
2. `src/planner/output-map.ts` — generated destinations, scopes, and conditions.
3. `src/cli/index.ts` and `src/cli/commands/` — commands and flags.
4. `src/mcp/presets.ts` — supported preset IDs and verified provenance.

Removing or renaming fields, output paths, commands, or preset IDs requires a major package version and migration notes. `package.json` is the single package-version source.

## Current output contract

| Target | Files |
| --- | --- |
| Codex | `AGENTS.md`; `.codex/config.toml` for MCP |
| GitHub Copilot | `.github/copilot-instructions.md`; `.vscode/mcp.json` for MCP |
| Claude Code | `.claude/CLAUDE.md`, `.claude/skills/<name>/SKILL.md`, `.claude/agents/<name>.md`, local settings; `.mcp.json` for MCP |
| Cursor | `.cursor/rules/*.mdc`; `.cursor/mcp.json` for MCP |
| Windsurf | `.windsurf/rules/*.md`; user-level MCP installation warning |

See `doc/output-map.md` for conditions and shared/local scope.

## MCP trust model

Every preset records a trust level, primary source URL, verification date, and native transport. This metadata is used by planning and audit but is not inserted into vendor config schemas.

| Presets | Level | Meaning |
| --- | --- | --- |
| `memory`, `sequential-thinking` | safe | Low-risk reference utilities |
| `github`, `linear`, `sentry`, `notion`, `stripe` | review | Hosted access to external account data |
| `filesystem` | dangerous | Can read or write project files through a local process |

Generated MCP files contain environment placeholders only. Literal secrets are prohibited. Users must still review OAuth permissions and local command execution before enabling a server.

## Automated gates

`npm run verify` is the local release gate. It runs:

1. Type checking.
2. The complete unit and integration suite.
3. A production build.
4. npm's high-severity dependency audit.

CI repeats the build, tests, and package dry-run on Node.js 20, 22, and 24. Publishing runs the same verification again before npm accepts a package.

## Release checklist

- [ ] Version reflects SemVer impact.
- [ ] Changelog includes breaking changes and migration notes.
- [ ] README, manifest spec, CLI spec, and output map match source.
- [ ] `npm run verify` passes.
- [ ] `npm pack --dry-run` contains only intended `dist` files.
- [ ] A temporary-project smoke test installs the packed tarball and runs `init`, `generate`, `doctor`, and `audit`.
- [ ] Package version is unused on npm.
- [ ] npm authentication or trusted publishing is available.
- [ ] Git tag and GitHub release are created from the verified commit.
- [ ] The installed npm package reports the released version and passes a smoke run.

## 2.x to 3.0 migration

Version 3 corrects platform discovery paths and native MCP schemas, so it is intentionally a major release.

- Regenerate Claude instructions from `.claude/README.md` to `.claude/CLAUDE.md`.
- Regenerate Claude skills from `.claude/skills/<name>.md` to `.claude/skills/<name>/SKILL.md`.
- Stop using `.mcp.local.json`; each enabled host now receives its own native MCP file.
- Removed or deprecated MCP presets are rejected. Choose one of the currently verified catalog IDs.
- Run `agenv import` before generation if the repository contains hand-written legacy files, then review `agenv diff --explain`.

The migration does not delete legacy files automatically. This avoids removing user-owned configuration during an upgrade.
