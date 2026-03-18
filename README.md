# agenv

`agenv` is an npm package for bootstrapping a portable, reviewable AI workspace for web development repositories.

It helps a team define one canonical AI workspace manifest and turn that into tool-specific outputs for supported coding assistants and MCP-compatible tooling.

## What It Does

- inspects a web development repo and infers useful setup hints
- creates or loads `ai-workspace.json`
- plans generated files for supported targets
- generates shared docs and tool-specific files
- supports Codex, Copilot, Claude, and MCP in the current MVP direction
- supports both `dashboard` and `web-app` as project types

## Current Status

This repo is no longer docs-only. It now includes:

- a buildable TypeScript package scaffold
- a CLI entrypoint and command shells
- manifest schema, defaults, normalization, load, and save
- repo inspection and stack hints
- generation planning and warnings
- a first real `generate` and `diff` path
- unit and integration tests

Still early:

- interactive `init` is still shallow
- generated file content is functional but not fully polished
- `doctor` has structure but is not feature-complete yet
- the current MVP is still most optimized for dashboard and internal-tool workflows

## Vision

Set up a portable, reviewable AI coding environment for web development in one command.

## Install and Use

```bash
npx agenv --help
```

```bash
npm install -g agenv
agenv --help
```

Examples:

```bash
agenv init --yes
agenv generate
```

```bash
agenv diff
agenv templates-list
```

## Start Here

If you are new to the repo, read these in order:

- contributor guide: [doc/getting-started.md](/Users/syoo/Documents/code/agenv-package/doc/getting-started.md)
- product requirements: [doc/prd.md](/Users/syoo/Documents/code/agenv-package/doc/prd.md)
- technical requirements: [doc/trd.md](/Users/syoo/Documents/code/agenv-package/doc/trd.md)
- CLI contract: [doc/cli-spec.md](/Users/syoo/Documents/code/agenv-package/doc/cli-spec.md)
- manifest contract: [doc/manifest-spec.md](/Users/syoo/Documents/code/agenv-package/doc/manifest-spec.md)
- output map: [doc/output-map.md](/Users/syoo/Documents/code/agenv-package/doc/output-map.md)
- adapter contract: [doc/adapter-contract.md](/Users/syoo/Documents/code/agenv-package/doc/adapter-contract.md)
- implementation plan: [doc/implementation-plan.md](/Users/syoo/Documents/code/agenv-package/doc/implementation-plan.md)

## Development Commands

```bash
npm install
npm test
npm run typecheck
npm run build
node dist/cli/index.js --help
```

## Package Shape

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

## Best Next Step

The strongest near-term path is to keep improving the first usable slice:

1. make generated files richer and less placeholder-like
2. deepen `init --yes` and preview behavior
3. expand `doctor`
4. add more integration coverage around real CLI behavior
