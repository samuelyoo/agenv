# agenv

[![npm version](https://img.shields.io/npm/v/agenv-cli.svg)](https://www.npmjs.com/package/agenv-cli)
[![CI](https://github.com/samuelyoo/agenv/actions/workflows/ci.yml/badge.svg)](https://github.com/samuelyoo/agenv/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/agenv-cli.svg)](LICENSE)

The portable AI-workspace control plane for software repositories. Define one reviewable `ai-workspace.json`, then generate native instructions for Codex, GitHub Copilot, Claude Code, Cursor, Windsurf, and MCP clients.

agenv supports seven project types, seven languages, and eighteen frameworks. It can also import existing agent configuration, manage reusable packs, audit workspace safety, and explain planned changes.

## Quick start

Requires Node.js 20 or newer.

```bash
npm install -g agenv-cli

cd your-project
agenv init --yes
agenv generate
agenv doctor
```

`agenv init` inspects the repository and creates the canonical manifest. Generated files carry ownership metadata, hand-edited files are protected unless `--force` is used, and replacements are backed up in `.agenv-backups/`.

## Commands

| Command | Purpose |
| --- | --- |
| `agenv init` | Inspect a repository and create `ai-workspace.json` |
| `agenv import` | Report on existing AI configuration; add `--write` to create a manifest |
| `agenv generate` | Generate enabled platform files; supports `--dry-run`, `--watch`, and filters |
| `agenv diff --explain` | Preview changes and show why each file is planned |
| `agenv doctor` | Validate the manifest, generated files, and platform configuration |
| `agenv audit` | Check MCP trust, environment variables, pack provenance, and file ownership |
| `agenv add pack <id>` | Add a built-in reusable policy pack |
| `agenv add preset <id>` | Add a verified MCP preset |
| `agenv install` | Resolve packs and write `ai-workspace.lock` |
| `agenv pack <dir>` | Validate a local pack |
| `agenv templates list` | List starter templates |
| `agenv update` | Update the global CLI from npm |

Use `agenv <command> --help` for the complete flag reference.

## Supported projects

- Project types: `dashboard`, `web-app`, `api-service`, `full-stack`, `library`, `cli-tool`, `mobile`
- Languages: `ts`, `python`, `go`, `rust`, `java`, `ruby`, `other`
- Frameworks: `react`, `nextjs`, `vite-react`, `express`, `fastify`, `hono`, `koa`, `django`, `flask`, `fastapi`, `gin`, `echo`, `actix`, `axum`, `spring`, `rails`, `none`

Repository inspection reads the matching dependency files, including `package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, Maven/Gradle files, and `Gemfile`.

## Generated platform files

| Platform | Native output |
| --- | --- |
| Codex | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Claude Code | `.claude/CLAUDE.md`, `.claude/skills/<name>/SKILL.md`, `.claude/agents/<name>.md`, `.claude/settings.local.json` |
| Cursor | `.cursor/rules/*.mdc` and `.cursor/mcp.json` when MCP is enabled |
| Windsurf | `.windsurf/rules/*.md`; its MCP server list must currently be installed in the user's Windsurf configuration |
| MCP for Claude Code | `.mcp.json` |
| MCP for Codex | `.codex/config.toml` |
| MCP for VS Code/Copilot | `.vscode/mcp.json` |

Claude skills and agents include the frontmatter their discovery systems require. Cursor and Windsurf rules use language-specific source globs rather than assuming TypeScript.

## MCP presets

The built-in catalog contains only endpoints or packages verified from their current primary documentation:

- Hosted OAuth servers: `github`, `linear`, `sentry`, `notion`, `stripe`
- Maintained reference packages: `filesystem`, `memory`, `sequential-thinking`

agenv renders each client's native schema and environment-variable syntax. Trust and provenance stay in the manifest/audit layer instead of adding unsupported keys to vendor config files. Review every server's permissions before enabling it, especially the write-capable `filesystem` preset.

## Documentation

| Document | Purpose |
| --- | --- |
| [Getting started](doc/getting-started.md) | Contributor setup and project tour |
| [CLI specification](doc/cli-spec.md) | Current command and flag contract |
| [Manifest specification](doc/manifest-spec.md) | Schema v2 fields and normalization |
| [Output map](doc/output-map.md) | Generated destinations and conditions |
| [Release readiness](doc/release-readiness.md) | Versioning, security, and release checks |
| [Product requirements](doc/prd.md) | Historical product design context |
| [Technical requirements](doc/trd.md) | Historical architecture context |

## Development

```bash
npm install
npm run verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## License

[MIT](LICENSE)
