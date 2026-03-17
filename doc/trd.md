# TRD: agenv Package

## 1. Purpose

This Technical Requirements Document defines how to build `agenv`, an npm package that bootstraps a portable, reviewable AI workspace for dashboard development repositories.

This document is based on the product requirements in [prd.md](/Users/syoo/Documents/code/agenv%20package/doc/prd.md).

## 2. Product Goal

`agenv` should let a user run one command in a repository, answer a guided setup flow, and generate a consistent AI environment across supported tools from one canonical manifest.

MVP promise:

> Set up a portable, reviewable AI coding environment for dashboard development in one command.

## 3. MVP Scope

### In scope
- Dashboard-first setup flow
- React + TypeScript, Next.js, and Vite React dashboard profiles
- Canonical manifest generation
- Tool-specific generation for:
  - OpenAI Codex via `AGENTS.md`
  - Claude Code
  - GitHub Copilot / VS Code
  - MCP config
- Prompt pack generation
- Dashboard skill and agent markdown generation
- `init`, `generate`, `diff`, `doctor`, and `templates list`

### Out of scope
- Full support for Cursor, Windsurf, Antigravity, Cline, or Roo Code in v1
- Remote service or hosted control plane
- Secret storage
- Third-party MCP installation automation from arbitrary sources
- GUI as the primary interface

## 4. Build Assumptions

### Runtime
- Node.js 20+
- npm package with executable CLI entrypoint
- TypeScript for all source code

### Packaging
- ESM output
- Published package exposes a CLI binary named `agenv`
- Build artifacts emitted to `dist/`

### Development choices
- CLI framework: `commander` or `cac`
- Schema validation: `zod`
- File diffing: line-based deterministic output
- Frontmatter/template rendering: simple string templates with typed inputs

The implementation should favor low dependency count and deterministic generation over complex templating systems.

## 5. User Experience Requirements

### Primary UX requirements
- First run must be understandable without reading docs
- Interactive wizard must have good defaults
- Non-interactive mode must be possible via flags
- Generation must be idempotent
- Generated files must be reviewable before or after write
- Trust-sensitive output must be clearly labeled

### `init` flow
The interactive wizard must follow this staged order:

1. Detect repo type and likely stack
2. Choose tools to configure
3. Choose development type
4. Choose setup depth
5. Ask only relevant stack questions
6. Choose setup mode
7. Choose prompt generation behavior
8. Choose config scope
9. Preview generated files and warnings
10. Write manifest and generated outputs

### Setup depth modes
- `recommended`: minimal questions, dashboard-first defaults
- `semi-custom`: ask core stack and generation questions
- `advanced`: expose full session tree

## 6. Core Technical Architecture

The CLI must be built as a layered system:

1. CLI command layer
2. repo inspection layer
3. manifest schema and normalization layer
4. planning layer
5. adapter/emitter layer
6. file writer and diff layer
7. diagnostics layer

### Design principles
- One canonical manifest is the source of truth
- Adapters translate intent, not raw files
- Outputs must be deterministic
- Unsafe capabilities must be explicit
- Shared and local-only outputs must be separable

## 7. Internal Modules

## 7.1 CLI Module

Responsibilities:
- parse commands and flags
- route to command handlers
- run interactive prompts
- render summaries, warnings, and errors

Commands:
- `agenv init`
- `agenv generate`
- `agenv diff`
- `agenv doctor`
- `agenv templates list`
- `agenv upgrade` should exist as a stub or hidden command only if not fully implemented in MVP

Suggested source layout:

```text
src/cli/
  index.ts
  commands/
    init.ts
    generate.ts
    diff.ts
    doctor.ts
    templates-list.ts
  prompts/
    init-flow.ts
    sessions/
      tools.ts
      project-type.ts
      setup-depth.ts
      stack.ts
      ui.ts
      data.ts
      auth.ts
      quality.ts
      tooling.ts
      output.ts
```

## 7.2 Repo Inspection Module

Responsibilities:
- inspect the current repository
- infer likely framework and tooling
- detect package manager
- detect dependencies relevant to dashboard setup
- detect existing AI config files that may conflict

Example heuristics:
- `next` dependency implies Next.js candidate
- `vite` plus `react` implies Vite React candidate
- `tailwindcss` implies Tailwind
- `@tanstack/react-query` implies TanStack Query
- `@tanstack/react-table` implies TanStack Table
- `react-hook-form` and `zod` imply forms/validation defaults

Suggested source layout:

```text
src/detect/
  repo-inspector.ts
  package-json.ts
  frameworks.ts
  dependencies.ts
  existing-ai-files.ts
```

## 7.3 Manifest Module

Responsibilities:
- define the canonical config schema
- parse manifest files
- validate user input
- apply defaults
- normalize values for adapter use

### Manifest file
MVP default filename:

```text
ai-workspace.json
```

Optional future support:
- `ai-workspace.local.json`
- YAML variants

### Manifest shape

The normalized manifest should include at minimum:

```ts
type Manifest = {
  schemaVersion: string;
  project: {
    name: string;
    type: "dashboard";
    framework: "react" | "nextjs" | "vite-react";
    language: "ts";
  };
  setup: {
    depth: "recommended" | "semi-custom" | "advanced";
    mode: "base" | "skills" | "agents" | "full";
    scope: "shared" | "local" | "mixed";
  };
  targets: {
    copilot: boolean;
    claude: boolean;
    codex: boolean;
    mcp: boolean;
  };
  dashboard: {
    styling: "tailwind" | "custom";
    components: "shadcn-ui" | "custom-design-system";
    dataFetching: "tanstack-query" | "custom";
    tables: "tanstack-table" | "ag-grid" | "custom";
    charts: "recharts" | "echarts" | "nivo" | "custom";
    forms: "react-hook-form-zod" | "custom";
    testing: Array<"vitest" | "rtl" | "playwright">;
    state: "local-first" | "zustand";
  };
  conventions: {
    routing?: string;
    folderStructure?: string;
    accessibility: boolean;
    responsive: boolean;
    authModel?: "rbac" | "none" | "custom";
  };
  instructions: {
    codingStyle: string[];
    reviewRules: string[];
  };
  generated: {
    prompts: "none" | "starter" | "master" | "pack";
    skills: boolean;
    agents: boolean;
    mcpPresets: string[];
  };
  extensions?: Record<string, unknown>;
};
```

### Requirements
- schema versioning must be explicit
- defaults must be centralized
- adapters must read from the normalized manifest, not raw prompt answers
- manifest should remain human-editable and diff-friendly

Suggested source layout:

```text
src/manifest/
  schema.ts
  defaults.ts
  normalize.ts
  load.ts
  save.ts
```

## 7.4 Planning Module

Responsibilities:
- translate manifest into a file generation plan
- compute shared vs local file destinations
- compute warnings
- surface unsupported target/feature combinations

The planner should emit a typed plan before any write occurs.

Example:

```ts
type GenerationPlan = {
  files: PlannedFile[];
  warnings: WarningMessage[];
  skipped: SkippedItem[];
};
```

Each `PlannedFile` should include:
- target adapter
- destination path
- file purpose
- ownership (`shared` or `local`)
- whether file is generated
- whether file is trust-sensitive

Suggested source layout:

```text
src/planner/
  build-plan.ts
  output-map.ts
  warnings.ts
```

## 7.5 Template Module

Responsibilities:
- hold reusable markdown and JSON templates
- render dashboard-specific instructions, prompts, skills, and agent docs
- keep formatting stable across runs

Template groups:
- base repo docs
- Codex `AGENTS.md`
- Copilot instructions
- Claude skills
- Claude agent/subagent docs
- dashboard architecture doc
- prompt pack docs
- MCP config presets
- `.env.example` snippets

Suggested source layout:

```text
src/templates/
  base/
  codex/
  copilot/
  claude/
  prompts/
  mcp/
```

## 7.6 Adapter Layer

Responsibilities:
- convert normalized manifest + generation plan into file contents
- isolate vendor-specific path and content logic
- report unsupported mappings cleanly

### Adapter contract

```ts
interface Adapter {
  id: string;
  supports(manifest: Manifest): SupportResult;
  plan(manifest: Manifest): PlannedFile[];
  render(file: PlannedFile, manifest: Manifest): string;
}
```

### MVP adapters

#### Codex adapter
Outputs:
- `AGENTS.md`
- optional prompt references or repo conventions docs

#### Copilot adapter
Outputs:
- `.github/copilot-instructions.md`
- optional prompt/instruction helper files if supported by chosen structure

#### Claude adapter
Outputs:
- Claude instructions
- skills directory
- agent/subagent markdown skeletons
- settings/hooks skeletons only when selected

#### MCP adapter
Outputs:
- repo MCP config file
- preset server entries using env placeholders
- `.env.example` additions when needed

Requirements:
- no adapter may write files outside the planned destination map
- adapters must be independently testable
- unsupported concepts must degrade gracefully

Suggested source layout:

```text
src/adapters/
  codex/
  copilot/
  claude/
  mcp/
  types.ts
```

## 7.7 File Writer and Diff Module

Responsibilities:
- perform dry-run generation
- compare new output to existing files
- write files with stable formatting
- avoid unnecessary rewrites
- optionally preserve user-edited non-generated files

### Requirements
- deterministic formatting
- no rewrite if content is unchanged
- generated files should include a header comment where format permits
- trust-sensitive files must be labeled
- shared and local outputs must respect scope rules

Conflict behavior:
- if a generated file exists and contains a recognized generated header, overwrite safely
- if a target file exists without a generated header, warn and require explicit overwrite behavior

Suggested source layout:

```text
src/fs/
  write.ts
  diff.ts
  backups.ts
  headers.ts
```

## 7.8 Diagnostics Module

Responsibilities:
- validate manifest shape
- validate repo compatibility
- validate adapter support
- detect unsafe settings
- explain missing env vars or unsupported presets

### `doctor` checks
- malformed manifest
- missing required fields
- unsupported stack/adapter combinations
- invalid file paths
- hook or MCP command warnings
- missing env placeholders
- local/shared scope mismatches
- stack mismatch against detected repo dependencies

Suggested source layout:

```text
src/doctor/
  run.ts
  checks/
    manifest.ts
    compatibility.ts
    security.ts
    env.ts
    paths.ts
    repo-match.ts
```

## 8. Output Model

The generator must separate outputs into three logical layers.

### Layer 1: Base repo config
Examples:
- `ai-workspace.json`
- `AGENTS.md`
- `.github/copilot-instructions.md`
- dashboard architecture and conventions doc

### Layer 2: Skills and agent templates
Examples:
- `.claude/skills/*`
- `.claude/agents/*`
- dashboard role docs

### Layer 3: Prompt packs
Examples:
- `docs/ai-prompts/bootstrap.md`
- `docs/ai-prompts/build-data-table.md`
- `docs/ai-prompts/chart-specialist.md`

Requirements:
- users can generate only Layer 1
- Layer 2 depends on Layer 1 conventions
- Layer 3 can be selected independently from some agent outputs

## 9. File and Folder Strategy

Internal package structure:

```text
src/
  adapters/
  cli/
  detect/
  doctor/
  fs/
  manifest/
  planner/
  templates/
  utils/
tests/
  fixtures/
  unit/
  integration/
doc/
  prd.md
  trd.md
```

Generated repo outputs for MVP should follow a stable convention such as:

```text
ai-workspace.json
AGENTS.md
.github/copilot-instructions.md
.claude/
  skills/
  agents/
  settings.local.json
.mcp.json
docs/
  ai-architecture.md
  ai-prompts/
```

Local-only examples:
- `ai-workspace.local.json`
- `.claude/settings.local.json`
- `.env.local`

## 10. Safety and Security Requirements

### Mandatory requirements
- never generate raw secrets
- always prefer `${ENV_VAR}` placeholders
- warn on shell-executing hooks or MCP commands
- differentiate local-only files from shared files
- print trust-sensitive warnings during `init`, `diff`, and `doctor`
- generated command-bearing files must be auditable

### Generated file labeling
Files that contain commands, hooks, or MCP tool definitions should include a short generated warning header when format allows.

### Secret handling
- add placeholders to `.env.example` only when required by selected presets
- never write actual environment values into manifest or generated config
- `doctor` should flag likely secrets committed to generated files if detectable

## 11. CLI Requirements

### `agenv init`
Must support:
- interactive mode
- `--yes` for recommended defaults
- target selection flags
- stack override flags
- `--dry-run`
- `--json` summary output for automation use

### `agenv generate`
Must:
- load manifest
- regenerate selected outputs
- support `--dry-run`
- support target filtering

### `agenv diff`
Must:
- show planned changes without writing
- display created, updated, unchanged, and skipped files

### `agenv doctor`
Must:
- return non-zero exit code when blocking issues exist
- print actionable warnings and fixes

### `agenv templates list`
Must:
- list available dashboard starter templates and presets

## 12. Testing Requirements

### Unit tests
- manifest schema validation
- default application
- repo detection heuristics
- planner output
- adapter rendering
- diagnostics checks

### Fixture tests
- fixture repos for Next.js dashboard
- fixture repos for Vite React internal tool
- fixture repos with partial stack detection
- fixture manifests for each setup mode

### Snapshot tests
- generated `AGENTS.md`
- generated Copilot instructions
- generated Claude skills and agent docs
- generated MCP config
- generated prompt packs

### Integration tests
- `init --yes --dry-run`
- `generate` from saved manifest
- `diff` against existing generated files
- `doctor` for good and broken setups

## 13. Implementation Plan

### Phase A: Foundation
- initialize package structure
- configure TypeScript build
- add CLI entrypoint
- add manifest schema and defaults
- add repo inspection helpers

### Phase B: Planning and generation
- implement generation planner
- implement file writer and diff engine
- implement Codex adapter
- implement Copilot adapter
- implement Claude adapter
- implement MCP adapter

### Phase C: UX and diagnostics
- build interactive `init` wizard
- build `doctor`
- add warnings and trust-sensitive summaries
- add generated file headers

### Phase D: Test hardening
- add snapshot fixtures
- add integration coverage
- verify deterministic generation across repeated runs

## 14. Acceptance Criteria

The MVP is complete when all of the following are true:

- Running `agenv init` in a supported dashboard repo creates a valid manifest
- The wizard can produce recommended defaults without overwhelming the user
- `generate` can reproduce outputs from the manifest without interactive prompts
- `diff` shows pending changes without writing files
- `doctor` catches malformed config and unsafe setup cases
- Codex, Copilot, Claude, and MCP outputs are generated from the same manifest
- Generated files are deterministic across repeated runs
- Local-only outputs can be separated from shared outputs
- Unsafe or trust-sensitive outputs are clearly labeled

## 15. Open Technical Decisions

These decisions should be resolved early during implementation:

- choose `commander` or `cac` for the CLI
- choose the exact manifest filename and whether local override ships in MVP
- choose the default MCP config filename
- decide whether Claude hooks ship in MVP or as skeleton-only output
- decide whether prompt packs live under `docs/` or a dedicated `.agenv/` directory
- decide whether `upgrade` ships as a real command or a documented placeholder

## 16. Recommended Next Build Step

The next practical step is to create the package skeleton and implement these first pieces in order:

1. CLI entrypoint and command routing
2. manifest schema and defaults
3. repo detection
4. generation plan model
5. Codex adapter
6. file writer and dry-run diff

That path gives the project a usable vertical slice quickly while keeping the architecture aligned with the PRD.
