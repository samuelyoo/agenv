# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Structured error types (`AgenvError`, `ManifestNotFoundError`, `ManifestValidationError`, `InvalidOptionError`, `WriteConflictError`, `BackupError`) for user-friendly CLI error messages
- Backup system — files are backed up to `.agenv-backups/` before overwriting
- `--force` flag on `agenv generate` to overwrite user-modified files
- Explicit skip warnings in generate output when files are skipped
- Early CLI option validation with actionable error messages
- `CONTRIBUTING.md` contributor guide
- `TODO.md` prioritized review action items

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
