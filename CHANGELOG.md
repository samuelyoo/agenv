# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No unreleased changes._

## [2.7.0] - 2026-03-31

### Added

- **Pack catalog** — new `src/catalog/` module with enriched `CatalogEntry` type including
  compatibility metadata (targets, projectTypes, languages) and provenance (source, publisher).
- **Catalog search** — `searchCatalog(query)` with case-insensitive substring matching on
  name, description, and ID.
- **Compatibility checking** — `checkCompatibility(entry, manifest)` validates pack compatibility
  against manifest targets, project type, and language.
- **GitHub source resolver** — `src/sources/github.ts` with `GitHubResolver` implementing
  file-based pack resolution (simulated GitHub fetch) with content hash verification.
- **Source resolver interface** — `SourceResolver` and `ResolvedSource` types in `src/sources/types.ts`.
- **Pack publishing** — `src/publish/` module: `buildArtifact()`, `writeArtifact()`, `publishPack()`
  produce JSON bundle artifacts with SHA-256 checksums.
- **Outdated detection** — `src/upgrade/outdated.ts`: `checkOutdated(lockfile)` compares locked
  versions against catalog versions.
- **Upgrade planning** — `src/upgrade/upgrade.ts`: `planUpgrade(lockfile, packId?)` and
  `applyUpgrade(lockfile, plan)` for dry-run and apply workflows.
- `"github"` added to pack source enum (`packSourceSchema` and manifest `packs` source field).
- Lockfile provenance fields: optional `sourceUrl` and `publisher` on `LockfilePack`.
- 3 new error classes: `SourceResolutionError`, `PublishError`, `CompatibilityWarning`.
- 32 new tests across 6 files (411 total).

## [2.6.0] - 2026-03-31

### Added

- **Multi-language support** — manifest `project.language` now accepts `ts`, `python`, `go`, `rust`,
  `java`, `ruby`, or `other` (previously locked to `ts`).
- **Expanded framework detection** — 10 new frameworks: `django`, `flask`, `fastapi` (Python),
  `gin`, `echo` (Go), `actix`, `axum` (Rust), `spring` (Java), `rails` (Ruby), `none` (generic).
- **Language detection** — `src/detect/languages.ts` auto-detects project language from marker files
  (`tsconfig.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, etc.).
- **Repo graph discovery** — `src/detect/repo-graph.ts` detects `single-package`, `workspace`
  (npm/pnpm workspaces), or `monorepo` (Lerna) repo structures.
- **Diff explanations** — `DiffSummary` now includes an `entries` array with per-file `target`,
  `layer`, `purpose`, and `action` metadata.
- `agenv diff --explain` flag — displays per-file explanation metadata.
- `RepoInspection` now includes `language` and `repoGraph` fields.
- Schema version bumped to `"2"` with transparent v1→v2 migration.
- 41 new tests across language detection, repo graph, framework expansion, schema v2, migration,
  and diff explanation modules (379 total).

## [2.5.0] - 2026-03-31

### Added

- **Audit system** — `agenv audit` command for security and provenance checks on MCP presets,
  lockfiles, env variables, and dangerous patterns.
- `agenv audit --json` for machine-readable audit output.
- `agenv audit --strict` to treat warnings as errors (CI enforcement).
- `agenv doctor --fix` flag — auto-applies safe remediation for fixable findings.
- `agenv doctor --explain <code>` flag — shows detailed explanation for any finding code.
- `src/audit/` module group: `index.ts`, `rules.ts`, `ownership.ts`.
- `src/doctor/explain.ts` — static explanation map with remediation guidance for all finding codes.
- `src/doctor/fixes.ts` — `applyFixes` with handlers for `local_override_missing` and
  `ownership_modified` findings.
- Generated file ownership checking integrated into doctor pipeline.
- 21 new tests across audit rules, doctor explain, and doctor fixes modules.

## [2.4.0] - 2026-04-07

### Added

- **Pack system** — reusable bundles of manifest fragments (coding style, review rules, MCP presets,
  conventions, extensions) that can be added, installed, and resolved deterministically.
- `agenv add pack <id>` command — adds a built-in pack reference to the manifest.
- `agenv add preset <id>` command — adds an MCP preset to the manifest's generated block.
- `agenv add pack --list` / `agenv add preset --list` to display available items.
- `agenv install` command — resolves packs, builds an install plan, and writes `ai-workspace.lock`.
- `agenv install --dry-run` — previews the install plan without writing the lockfile.
- `agenv pack <dir>` command — validates a local pack directory against the pack schema.
- `ai-workspace.lock` lockfile — SHA-256 content-addressed lockfile recording resolved pack state.
- Stale lockfile warning during `agenv generate` when manifest has changed since last install.
- 3 built-in packs: `secure-defaults`, `strict-typescript`, `testing-essentials`.
- `src/packs/` module group: `schema.ts`, `catalog.ts`, `load.ts`, `resolve.ts`, `pack.ts`.
- `src/install/` module group: `lockfile.ts`, `plan.ts`, `apply.ts`, `index.ts`.
- `packs` field in manifest schema (backward-compatible, defaults to empty array).
- 58 new tests across packs, install, and manifest schema modules (303 total).

### Changed

- `--json` flag available on `add`, `install`, and `pack` commands for machine-readable output.

## [2.3.0] - 2026-03-31

### Added

- `agenv import` command — scans existing AI config files (`AGENTS.md`, `.claude/`, `.cursorrules`,
  `.windsurfrules`, `.github/copilot-instructions.md`, `.mcp.json`) and infers manifest fields
  from them. Default mode is report-only; use `--write` to write a manifest.
- `--from <list>` option on `agenv import` to limit scanning to specific sources.
- `--json` option on `agenv import` for machine-readable import report output.
- `agenv init` now shows a preview block and asks for confirmation before writing the manifest
  when running interactively. The `--yes` flag skips the prompt (CI-safe).
- `src/import/` module group: `index.ts`, `merge.ts`, `report.ts`,
  `detectors/codex.ts`, `detectors/claude.ts`, `detectors/cursor.ts`,
  `detectors/windsurf.ts`, `detectors/copilot.ts`, `detectors/mcp.ts`.

### Changed

- Product positioning updated to "AI workspace control plane" across README and package description.

## [2.2.0] - 2026-03-26

### Added

- `agenv update` command — self-updates to latest npm version via `npm install -g agenv-cli@latest`
- Automatic version check on every CLI run (24h cached in `~/.agenv/version-check.json`)
- Update notification when a newer version is available on npm

## [2.1.0] - 2026-03-26

### Added

- Backend framework detection: Express, Fastify, Hono, Koa (`src/detect/frameworks.ts`)
- `agenv doctor --ci` flag — JSON output, implies strict mode, exits non-zero on issues
- YAML manifest support — `ai-workspace.yaml` and `.yml` accepted alongside `.json`
- `agenv generate --watch` flag — watches manifest for changes, regenerates with 300ms debounce
- `doc/release-readiness.md` — release contract, trust model, and checklist
- 73+ new unit tests across detect, doctor checks, CLI flags, adapters, init flow, YAML loading

### Fixed

- Doctor `supports()` gate — adapters that don't support a manifest are now skipped before running checks
- README and CHANGELOG Cursor/Windsurf output lists now match actual generated files
- `doc/output-map.md` now includes Cursor and Windsurf target sections

### Changed

- `doc/manifest-spec.md` — documented YAML format for shared and local manifests, expanded local override allowed areas

## [2.0.1] - 2026-03-24

### Fixed

- Set `homepage` in `package.json` to the GitHub Pages URL (`https://samuelyoo.github.io/agenv/`)

## [2.0.0] - 2026-03-24

### Added

- **Cursor adapter** — generates `.cursor/rules/context.mdc`, `coding-style.mdc`, `framework.mdc`, and `code-review.mdc` with YAML frontmatter
- **Windsurf adapter** — generates `.windsurf/rules/context.md`, `coding-style.md`, `framework.md`, and `code-review.md` with trigger frontmatter
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
