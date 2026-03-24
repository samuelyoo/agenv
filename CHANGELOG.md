# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-03-24

### Fixed

- Set `homepage` in `package.json` to the GitHub Pages URL (`https://samuelyoo.github.io/agenv/`)

## [2.0.0] - 2026-03-24

### Added

- **Cursor adapter** — generates `.cursor/rules/context.mdc`, `coding-style.mdc`, and `review.mdc` with YAML frontmatter
- **Windsurf adapter** — generates `.windsurf/rules/context.md`, `coding-style.md`, and `review.md` with trigger frontmatter
- **4 new project types**: `full-stack`, `library`, `cli-tool`, and `mobile` (7 total)
- **5 new MCP presets**: `notion`, `stripe`, `atlassian`, `puppeteer`, `sequential-thinking` (11 total)
- `_trustLevel` and `_trustNote` annotations in generated `.mcp.json` for non-safe presets
- `checkMcpConfigFormat` doctor check for malformed `.mcp.json` files
- **14 new prompt templates** for full-stack, library, CLI tool, and mobile skills
- **2 new agent templates**: `docs-writer` and `cli-designer`
- `cursor` and `windsurf` boolean fields in manifest `targets` block
- Cursor and Windsurf selection in `agenv init` tools prompt
- Template registry entries for all 4 new project types (recommended + semi-custom variants)
- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- `SECURITY.md` vulnerability reporting policy
- Unit tests for all 6 adapters (cursor, windsurf, mcp, claude, codex, copilot)
- Unit tests for output-map skill/agent lookup across all 7 project types
- Manifest defaults tests for all new project types

### Changed

- All adapters extended with `describeProjectType()` branches for the 4 new types
- `buildRecommendedManifest()` defaults cover all 7 project types with type-specific config blocks
- `SKILLS_BY_TYPE` and `AGENTS_BY_TYPE` records cover all 7 project types
- `buildConventionsSection()` in the Codex adapter handles `fullStack`, `library`, `cliTool`, `mobile` config blocks
- `package.json` keywords updated to include `cursor`, `windsurf`, `agents-md`, `claude-code`, `ai-rules`, `ai-config`
- 132 tests passing (up from 21 at v1.0.0)

## [Unreleased]

### Added

- Structured error types (`AgenvError`, `ManifestNotFoundError`, `ManifestValidationError`, `InvalidOptionError`, `WriteConflictError`, `BackupError`) for user-friendly CLI error messages
- Backup system — files are backed up to `.agenv-backups/` before overwriting
- `--force` flag on `agenv generate` to overwrite user-modified files
- Explicit skip warnings in generate output when files are skipped
- Early CLI option validation with actionable error messages
- `CONTRIBUTING.md` contributor guide

### Changed

- `render/shared.ts` refactored — prompt template definitions extracted to `render/prompt-templates.ts` (505 → 251 lines)
- `loadManifest()` now throws `ManifestNotFoundError` / `ManifestValidationError` instead of raw errors
- CLI error handler now displays error codes for structured errors
- `writeRenderedFiles()` creates backups before overwriting and supports `--force`
- Generate command output now shows backed-up file count and lists skipped files with guidance

### Removed

- Unused `formatBullets()` function from `render/shared.ts`

## [1.0.0] - 2026-03-20

### Added

- Initial release
- CLI commands: `init`, `generate`, `diff`, `doctor`, `templates list`
- Manifest schema with Zod validation
- Adapters for Codex, Copilot, Claude, and MCP
- Repo inspection and framework detection
- Generation planning with output map
- Prompt template rendering (starter, master, pack modes)
- Interactive setup flow via `@inquirer/prompts`
- Doctor diagnostic checks
- Unit and integration test suite (21 tests)
