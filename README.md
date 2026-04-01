# agenv

[![npm version](https://img.shields.io/npm/v/agenv-cli.svg)](https://www.npmjs.com/package/agenv-cli)
[![license](https://img.shields.io/npm/l/agenv-cli.svg)](LICENSE)

The AI workspace control plane for web development repositories — one canonical manifest for Copilot, Claude, Codex, MCP, Cursor, and Windsurf.

Define one canonical `ai-workspace.json` as the source of truth for your AI workspace configuration, generate tool-specific files for all six targets, and import existing AI configs from any tool you already use.

## Quick Start

```bash
# Install once:
npm install -g agenv-cli

# Then in any web project directory:
agenv init --yes
agenv generate
```

That's it. `agenv` inspects your repo, creates `ai-workspace.json`, and generates tool-specific files for your enabled targets.

## What It Does

1. **Inspects** your repo — detects framework, package manager, existing AI config files
2. **Creates** `ai-workspace.json` — a single manifest describing your AI workspace
3. **Plans** which files to generate based on your targets and setup mode
4. **Generates** shared docs, prompts, and tool-specific files (AGENTS.md, copilot-instructions, .claude/, .mcp.json)

Supports seven project types: `dashboard`, `web-app`, `api-service`, `full-stack`, `library`, `cli-tool`, and `mobile`.

## Install

```bash
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

## Supported Targets

| Target | Output |
|---|---|
| `codex` | `AGENTS.md` |
| `copilot` | `.github/copilot-instructions.md` |
| `claude` | `.claude/README.md`, `.claude/skills/*.md`, `.claude/agents/*.md`, `.claude/settings.local.json` |
| `mcp` | `.mcp.json`, `.mcp.local.json` |
| `cursor` | `.cursor/rules/context.mdc`, `.cursor/rules/coding-style.mdc`, `.cursor/rules/framework.mdc`, `.cursor/rules/code-review.mdc` |
| `windsurf` | `.windsurf/rules/context.md`, `.windsurf/rules/coding-style.md`, `.windsurf/rules/framework.md`, `.windsurf/rules/code-review.md` |

## Project Types

| Type | Description |
|---|---|
| `dashboard` | Internal data/admin dashboard |
| `web-app` | Consumer-facing web application |
| `api-service` | Backend API service |
| `full-stack` | Combined frontend + backend (e.g. Next.js full-stack) |
| `library` | Reusable npm package or component library |
| `cli-tool` | Node.js command-line tool |
| `mobile` | React Native / Expo mobile app |

## MCP Presets

Built-in presets with trust annotations: `filesystem`, `github`, `fetch`, `memory`, `postgres`, `sqlite`, `puppeteer`, `sequential-thinking`, `notion`, `stripe`, `atlassian`.

Select presets during `agenv init` or add them to `generated.mcpPresets` in your manifest. Non-safe presets include `_trustLevel` and `_trustNote` annotations in `.mcp.json`.

## Documentation

| Doc | Purpose |
|---|---|
| [Getting Started](doc/getting-started.md) | Contributor onboarding |
| [Product Requirements](doc/prd.md) | Product goals and scope |
| [Technical Requirements](doc/internal/trd.md) | Architecture and technical design |
| [CLI Spec](doc/cli-spec.md) | Command contract and flag reference |
| [Manifest Spec](doc/manifest-spec.md) | Manifest schema and field definitions |
| [Output Map](doc/output-map.md) | Which files are generated and when |
| [Adapter Contract](doc/internal/adapter-contract.md) | How adapters work |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, development commands, and PR guidelines.

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting policy.

```bash
npm install
npm run build
npm test
npm run typecheck
```

## License

[MIT](LICENSE)
