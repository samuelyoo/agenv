# agenv

[![npm version](https://img.shields.io/npm/v/agenv-cli.svg)](https://www.npmjs.com/package/agenv-cli)
[![license](https://img.shields.io/npm/l/agenv-cli.svg)](LICENSE)

Bootstrap a portable, reviewable AI workspace for web development repositories — in one command.

Define one canonical `ai-workspace.json` manifest, then generate tool-specific configuration files for Codex, Copilot, Claude, and MCP-compatible tooling.

## Quick Start

```bash
# In any web project directory:
npx agenv-cli init --yes
npx agenv-cli generate
```

That's it. `agenv` inspects your repo, creates `ai-workspace.json`, and generates tool-specific files for your enabled targets.

## What It Does

1. **Inspects** your repo — detects framework, package manager, existing AI config files
2. **Creates** `ai-workspace.json` — a single manifest describing your AI workspace
3. **Plans** which files to generate based on your targets and setup mode
4. **Generates** shared docs, prompts, and tool-specific files (AGENTS.md, copilot-instructions, .claude/, .mcp.json)

Supports `dashboard`, `web-app`, and `api-service` project types.

## Install

```bash
# Run without installing
npx agenv-cli --help

# Or install globally
npm install -g agenv-cli
agenv --help
```

## Commands

| Command | Description |
|---|---|
| `agenv init` | Create `ai-workspace.json` from repo inspection + interactive prompts |
| `agenv init --yes` | Non-interactive mode with recommended defaults |
| `agenv generate` | Generate all planned files from the manifest |
| `agenv generate --dry-run` | Preview what would be generated without writing |
| `agenv generate --force` | Overwrite files modified outside agenv |
| `agenv diff` | Show what `generate` would change |
| `agenv doctor` | Validate manifest and repo compatibility |
| `agenv templates list` | List available starter templates |

## How It Works

```
agenv init          →  ai-workspace.json (your manifest)
agenv generate      →  AGENTS.md, .github/copilot-instructions.md,
                       .claude/*, .mcp.json, docs/ai-prompts/*
agenv diff          →  preview changes before writing
agenv doctor        →  validate everything is consistent
```

Generated files include a header comment so agenv knows which files it manages. Files you edit by hand are protected from overwrite (unless you use `--force`). Backups are created in `.agenv-backups/` before any overwrite.

## Documentation

| Doc | Purpose |
|---|---|
| [Getting Started](doc/getting-started.md) | Contributor onboarding |
| [Product Requirements](doc/prd.md) | Product goals and scope |
| [Technical Requirements](doc/trd.md) | Architecture and technical design |
| [CLI Spec](doc/cli-spec.md) | Command contract and flag reference |
| [Manifest Spec](doc/manifest-spec.md) | Manifest schema and field definitions |
| [Output Map](doc/output-map.md) | Which files are generated and when |
| [Adapter Contract](doc/adapter-contract.md) | How adapters work |
| [Implementation Plan](doc/implementation-plan.md) | Roadmap and phasing |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, development commands, and PR guidelines.

```bash
npm install
npm test
npm run typecheck
npm run build
```

## License

[MIT](LICENSE)
