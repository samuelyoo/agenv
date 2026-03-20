# Contributing to agenv

Thanks for your interest in contributing. This guide covers setup, development workflow, and PR expectations.

## Prerequisites

- Node.js >= 20
- npm (ships with Node)

## Setup

```bash
git clone https://github.com/samuelyoo/agenv.git
cd agenv
npm install
```

## Development Commands

| Command | Purpose |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the test suite (vitest) |
| `node dist/cli/index.js --help` | Run the CLI locally after building |

## Project Structure

```
src/
  adapters/     Target-specific renderers (codex, copilot, claude, mcp)
  cli/          CLI entrypoint and command handlers
  detect/       Repo inspection and framework detection
  doctor/       Manifest validation and diagnostic checks
  fs/           File writing, backups, diff, headers
  manifest/     Schema, load, save, normalize, defaults
  planner/      Generation plan builder and output map
  render/       File rendering (shared files + prompt templates)
  templates/    Built-in starter template registry
  utils/        Shared helpers (format, json)
  errors.ts     Structured error types
tests/
  unit/         Unit tests by module
  integration/  End-to-end command tests
doc/            Specs and design documents
```

## Code Style

- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- ES modules (`.js` extensions in imports)
- No default exports
- Prefer `const` and named functions
- Keep files focused — one responsibility per module

## Writing Tests

Tests use [vitest](https://vitest.dev/). Place tests under `tests/unit/` or `tests/integration/` mirroring the `src/` structure.

```bash
# Run all tests
npm test

# Run a specific test file
npx vitest run tests/unit/manifest/defaults.test.ts
```

## Making a Pull Request

1. Create a branch from `main` (e.g., `enhancement/your-feature`)
2. Make your changes
3. Ensure `npm run typecheck` and `npm test` both pass
4. Write a clear PR description explaining what changed and why
5. Keep PRs focused — one feature or fix per PR

## Error Handling

Use structured error types from `src/errors.ts` for user-facing errors:

- `ManifestNotFoundError` — manifest file missing
- `ManifestValidationError` — schema validation failure
- `InvalidOptionError` — bad CLI flag value
- `WriteConflictError` — file modified outside agenv
- `BackupError` — backup creation failed

These ensure the CLI renders friendly messages with error codes.

## Questions?

Open an issue at https://github.com/samuelyoo/agenv/issues.
