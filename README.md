# agenv

`agenv` is an npm package for bootstrapping a portable, reviewable AI workspace for dashboard development repositories.

It is designed to help teams define one canonical AI workspace manifest and generate tool-specific outputs for supported coding assistants and MCP-compatible tooling.

## Vision

Set up a portable, reviewable AI coding environment for dashboard development in one command.

## MVP Focus

- Dashboard-first setup flow
- React + TypeScript, Next.js, and Vite React support
- Canonical manifest generation
- Generated outputs for Codex, Claude Code, GitHub Copilot, and MCP
- Prompt packs, skills, and agent templates
- CLI commands for `init`, `generate`, `diff`, `doctor`, and `templates list`

## Planned Documents

- Product requirements: [doc/prd.md](/Users/syoo/Documents/code/agenv%20package/doc/prd.md)
- Technical requirements: [doc/trd.md](/Users/syoo/Documents/code/agenv%20package/doc/trd.md)

## Proposed Package Shape

```text
src/
doc/
tests/
```

## Next Build Steps

1. Create the CLI entrypoint and command routing.
2. Implement the manifest schema and defaults.
3. Add repo detection for supported dashboard stacks.
4. Build the generation planner and first adapter.

## Naming Note

The current folder name is `agenv package`, but the package and repository name should ideally be `agenv` or `agenv-bootstrapper` to avoid spaces and make npm/GitHub naming cleaner.
