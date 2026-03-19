# agenv

`agenv` is a CLI for bootstrapping a portable, reviewable AI workspace for development repositories.

It helps teams define one shared `ai-workspace.json` manifest and generate tool-specific outputs for coding assistants and MCP-compatible tooling.

## Why `agenv`?

AI tooling often gets configured ad hoc: scattered prompts, inconsistent instructions, and machine-specific setup that is hard to review.

`agenv` gives you a more structured approach:

- inspect an existing repository
- create a canonical AI workspace manifest
- generate consistent tool-specific files
- keep shared and local AI configuration easier to review

## What it supports

### Project types

`agenv` currently supports:

- `dashboard`
- `web-app`
- `api-service`

### Frameworks

Supported frameworks currently include:

- `react`
- `nextjs`
- `vite-react`
- `express`
- `fastify`
- `hono`

### Targets

`agenv` can generate files for:

- OpenAI Codex
- GitHub Copilot
- Claude
- MCP-compatible tooling

## Core workflow

The typical flow is:

1. inspect the repo
2. create or load `ai-workspace.json`
3. build a deterministic generation plan
4. generate target-specific files from the shared manifest

## Installation

### Run with `npx`

```bash
npx agenv-cli --help
```

### Install globally

```bash
npm install -g agenv-cli
agenv --help
```

## Quick start

### Interactive setup

`init` now runs interactively by default.

```bash
agenv init
```

### Non-interactive setup with defaults

Use `--yes` to skip prompts and accept recommended defaults.

```bash
agenv init --yes
```

### Generate files

```bash
agenv generate
```

### Preview changes without writing

```bash
agenv diff
```

### List available templates

```bash
agenv templates list
```

## CLI commands

### `agenv init`

Creates a canonical `ai-workspace.json` from repository inspection and defaults.

Common options:

- `--yes` — accept recommended defaults and skip interactive prompts
- `--dry-run` — preview without writing files
- `--json` — emit machine-readable output
- `--targets <list>` — comma-separated targets such as `codex,claude,copilot,mcp`
- `--project-type <type>` — `dashboard`, `web-app`, or `api-service`
- `--framework <value>` — override detected framework
- `--setup-depth <value>` — `recommended`, `semi-custom`, or `advanced`
- `--setup-mode <value>` — `base`, `skills`, `agents`, or `full`
- `--config-scope <value>` — `shared`, `local`, or `mixed`
- `--prompts <value>` — `none`, `starter`, `master`, or `pack`

### `agenv generate`

Generates planned files from the manifest.

### `agenv diff`

Shows what `generate` would create or update without writing files.

### `agenv doctor`

Runs diagnostics on the current AI workspace setup.

### `agenv templates list`

Lists available templates in the registry.

## Example usage

### Dashboard or web app

```bash
agenv init --project-type web-app --targets codex,copilot,claude
agenv generate
```

### API service

```bash
agenv init --project-type api-service --framework fastify --targets codex,copilot,mcp
agenv generate
```

### Preview before writing

```bash
agenv diff --json
```

## Manifest

`agenv` uses a shared manifest file:

- `ai-workspace.json` — shared, committed configuration
- `ai-workspace.local.json` — local override configuration

The manifest is intended to be:

- human-editable
- diff-friendly
- stable across repeated runs
- usable as the source of truth for generated outputs

## Generated outputs

Depending on selected targets and setup, `agenv` can generate files such as:

- `ai-workspace.json`
- `ai-workspace.local.json`
- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.claude/README.md`
- `.claude/skills/*`
- `docs/ai-architecture.md`
- `docs/ai-prompts/*`
- `.env.example`

## Current status

This is an early but working CLI.

What already works:

- TypeScript package scaffold
- CLI entrypoint and commands
- manifest schema, normalization, load, and save
- repo inspection and stack hints
- generation planning
- rendered file generation
- diff flow
- tests

Areas still improving:

- richer interactive setup flows
- more polished generated content across all targets
- broader `doctor` coverage
- continued expansion of prompt packs and templates

## Development

```bash
npm install
npm run build
npm test
npm run typecheck
node dist/cli/index.js --help
```

## Project structure

```text
src/
  adapters/
  cli/
  detect/
  doctor/
  fs/
  manifest/
  planner/
  render/
  templates/
  utils/
doc/
tests/
```

## Docs

For deeper details, see:

- `doc/getting-started.md`
- `doc/prd.md`
- `doc/trd.md`
- `doc/cli-spec.md`
- `doc/manifest-spec.md`
- `doc/output-map.md`
- `doc/adapter-contract.md`
- `doc/implementation-plan.md`

## License

MIT
