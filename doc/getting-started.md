# Getting Started

## 1. Who This Is For

This document is for:

- someone opening the repo for the first time
- a future contributor trying to understand where to work
- a maintainer returning later and wanting a quick mental refresh

It is more explanation-friendly than the PRD, TRD, and contract docs.

## 2. What `agenv` Is

`agenv` is a CLI package that helps a team define one shared AI workspace intent and turn that into tool-specific outputs.

The package currently supports seven project types: `dashboard`, `web-app`, `api-service`, `full-stack`, `library`, `cli-tool`, and `mobile`.

It focuses on these target outputs:

- OpenAI Codex via `AGENTS.md`
- GitHub Copilot repo instructions
- Claude workspace files
- MCP config and placeholder env wiring
- Cursor rules via `.cursor/rules/`
- Windsurf rules via `.windsurf/rules/`

The main idea is simple:

1. inspect the repo
2. create or load `ai-workspace.json`
3. build a deterministic file plan
4. render target-specific files from that shared manifest

## 3. What Already Works

This is already a working codebase, not just a planning repo.

Current working pieces:

- TypeScript package scaffold
- CLI entrypoint with structured error handling
- manifest schema, defaults, normalization, load, and save
- repo detection and framework detection
- output planning and warning generation
- `generate` command that writes files with backup support
- `diff` command that compares rendered output to the filesystem
- six target adapters (codex, copilot, claude, mcp, cursor, windsurf)
- seven project types with type-specific defaults
- 11 MCP presets with trust annotations
- template registry with recommended and semi-custom variants
- structured error types and backup system
- 132+ passing unit and integration tests

## 4. What Is Still Early

These areas are still intentionally shallow or incomplete:

- exemplar output repos demonstrating real-world usage
- deeper MCP preset customization
- broader integration testing across all project types
- full template pack mode coverage

That means contributors should treat the repo as a working CLI with a clear architecture that is actively improving.

## 5. How the Codebase Is Organized

### `src/cli/`

This is the command-line entry layer.

- `index.ts` wires commands together
- `commands/` contains command behavior
- `prompts/` holds the future wizard/session structure

If you want to change the user-facing CLI behavior first, start here.

### `src/manifest/`

This is the config source of truth.

- `schema.ts` defines the contract
- `defaults.ts` defines recommended defaults
- `normalize.ts` merges and validates
- `load.ts` and `save.ts` handle disk I/O

If behavior feels inconsistent across commands, check manifest normalization before changing adapters.

### `src/detect/`

This layer inspects the repo and suggests likely defaults.

Examples:

- Next.js vs Vite React vs React detection
- dashboard-related dependency hints
- existing AI config file detection

If `init` recommends the wrong stack, this is probably where the fix belongs.

### `src/planner/`

This layer decides which files should exist.

- `output-map.ts` defines the destination universe
- `build-plan.ts` filters by mode, scope, and targets
- `warnings.ts` adds planning warnings

If you need to change what gets generated, start here before touching rendering.

### `src/adapters/`

These are the vendor-specific renderers.

If a change affects only Codex, only Copilot, only Claude, or only MCP, it probably belongs here rather than in the planner.

### `src/render/`

This layer turns the plan into actual file content.

- shared files are rendered here
- adapter-rendered files are collected here
- generated headers are applied here before diff/write

If the planner is correct but the file contents are weak, this is the next place to work.

### `src/fs/`

This layer compares and writes files safely.

- `diff.ts` classifies create, update, unchanged, and skip
- `write.ts` performs writes
- `headers.ts` manages generated-file markers

If you want safer overwrite behavior, this is the right layer.

### `src/doctor/`

This is the diagnostics layer. It exists, but still needs deeper checks over time.

## 6. How To Run It

From the repo root:

```bash
npm install
npm test
npm run typecheck
npm run build
```

Useful manual checks:

```bash
node dist/cli/index.js --help
node dist/cli/index.js templates list
node dist/cli/index.js doctor --json
```

## 7. How To Read The Docs

Use the docs based on the question you are trying to answer.

For product intent:

- [prd.md](prd.md)

For architecture and module structure:

- [trd.md](internal/trd.md)

For exact contracts:

- [cli-spec.md](cli-spec.md)
- [manifest-spec.md](manifest-spec.md)
- [output-map.md](output-map.md)
- [adapter-contract.md](internal/adapter-contract.md)

For the current work queue:

- [implementation-plan.md](internal/implementation-plan.md)

## 8. Good First Contributions

If you are new and want a good first task, start with one of these:

1. improve the shared file renderers so the generated docs feel less placeholder-like
2. deepen one adapter at a time
3. make `init --yes` and preview mode stronger
4. add more `doctor` checks
5. add tests around edge cases like mixed scope and existing manual files

These are bounded enough to be approachable without understanding every module first.

## 9. A Good Mental Model

When in doubt, think in this order:

1. manifest: what does the repo want?
2. planner: which files should exist?
3. renderer: what should each file say?
4. filesystem: what should change on disk?

That order keeps the architecture clean and helps avoid putting logic in the wrong layer.

## 10. Best Next Step

The highest-value near-term work is to keep improving the first usable path rather than jumping into every feature at once.

The strongest next investments are:

- improve rendered file quality
- make `init` more useful in non-interactive and preview modes
- expand `doctor`
- continue adding integration coverage
