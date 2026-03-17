# Manifest Specification

## 1. Purpose

This document defines the canonical `ai-workspace.json` contract for `agenv`. It turns the draft manifest in the PRD and TRD into a stable schema that adapters, planners, and diagnostics can rely on.

## 2. Files

### Shared manifest

- Filename: `ai-workspace.json`
- Commit status: shared and intended for version control
- Purpose: repository-level AI workspace intent

### Local override manifest

- Filename: `ai-workspace.local.json`
- Commit status: local-only and gitignored
- Purpose: machine-specific or user-specific overrides layered onto the shared manifest

The shared file is the source of truth for team intent. The local file may refine local behavior but must not redefine the project itself.

## 3. Design rules

- The manifest must be human-editable and diff-friendly.
- The schema version must be explicit.
- Defaults must be centralized in code, not duplicated in adapters.
- Adapters must consume a normalized manifest, not raw user prompt answers.
- Unknown extension data must be isolated under `extensions`.

## 4. JSON shape

The normalized manifest must conform to this structure:

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

## 5. Required fields

These fields are required in the shared manifest:

- `schemaVersion`
- `project.name`
- `project.type`
- `project.framework`
- `project.language`
- `setup.depth`
- `setup.mode`
- `setup.scope`
- `targets`
- `dashboard`
- `conventions.accessibility`
- `conventions.responsive`
- `instructions.codingStyle`
- `instructions.reviewRules`
- `generated.prompts`
- `generated.skills`
- `generated.agents`
- `generated.mcpPresets`

Boolean target keys must always exist even when `false`.

## 6. Defaults

The recommended-default profile for MVP should normalize to:

```json
{
  "schemaVersion": "1",
  "project": {
    "type": "dashboard",
    "language": "ts"
  },
  "setup": {
    "depth": "recommended",
    "mode": "base",
    "scope": "mixed"
  },
  "targets": {
    "copilot": true,
    "claude": true,
    "codex": true,
    "mcp": false
  },
  "dashboard": {
    "styling": "tailwind",
    "components": "shadcn-ui",
    "dataFetching": "tanstack-query",
    "tables": "tanstack-table",
    "charts": "recharts",
    "forms": "react-hook-form-zod",
    "testing": ["vitest", "rtl"],
    "state": "local-first"
  },
  "conventions": {
    "accessibility": true,
    "responsive": true,
    "authModel": "rbac"
  },
  "generated": {
    "prompts": "master",
    "skills": false,
    "agents": false,
    "mcpPresets": []
  }
}
```

Defaults may be refined by detected repo dependencies before final manifest write. For example, a detected Next.js repo may default `project.framework` to `nextjs`.

## 7. Field semantics

### `schemaVersion`

- String value for forward compatibility.
- MVP value: `"1"`.
- Parsers must reject unsupported major versions.

### `project`

- `name` should default to the repository directory name.
- `type` is locked to `dashboard` in MVP.
- `framework` must reflect detected or user-selected stack.
- `language` is `ts` for MVP.

### `setup`

- `depth` controls how much the wizard asks, not the final planner alone.
- `mode` controls the maximum output layer breadth.
- `scope` controls whether outputs are shared, local, or split.

### `targets`

- A target set to `false` must produce no target-owned files.
- At least one target should be `true`.

### `dashboard`

- Encodes opinionated stack conventions used by planners and templates.
- Values should be conservative and finite for MVP.

### `conventions`

- Holds cross-cutting UI and workflow rules that are not vendor-specific.
- `routing` and `folderStructure` are optional because they may be inferred or omitted in recommended mode.

### `instructions`

- `codingStyle` and `reviewRules` must be arrays of stable, human-readable strings.
- These values are shared source material for multiple adapters.

### `generated`

- `prompts` controls prompt generation intensity.
- `skills` enables dashboard skill templates.
- `agents` enables role-specific agent templates.
- `mcpPresets` lists named preset bundles, not raw server definitions.

### `extensions`

- Reserved escape hatch for future tooling.
- Core logic must ignore unknown extension keys unless a specific adapter claims them.

## 8. Validation rules

- `project.type` must equal `dashboard`.
- `project.framework` must be one of the supported MVP values.
- `setup.depth`, `setup.mode`, `setup.scope`, and `generated.prompts` must use enumerated values.
- `dashboard.testing` must contain unique values.
- `instructions.codingStyle` and `instructions.reviewRules` must not be empty arrays.
- `generated.agents` must not be `true` when `generated.skills` is `false` if the chosen adapter expects agent docs to reference shared skill material.
- `targets.mcp` may be `true` only when generated config uses env placeholders instead of literal secrets.

## 9. Normalization rules

The manifest loader must normalize input before planning:

1. apply defaults
2. merge local overrides
3. coerce absent booleans to explicit booleans
4. de-duplicate arrays where order is stable
5. compute any derived flags needed by planners

Normalization must not reorder user-authored arrays unless the schema defines their order as semantic-free.

## 10. Local override behavior

The local override contract is defined now so planners and loaders can rely on stable semantics.

### Allowed override areas

`ai-workspace.local.json` may override:

- `setup.scope`
- `targets.mcp`
- `generated.prompts`
- `generated.mcpPresets`
- `extensions`

It may also extend future local-only settings if they are explicitly documented.

### Prohibited override areas

The local file must not override:

- `schemaVersion`
- `project`
- `dashboard`
- `instructions`

Those fields define shared repo intent and must remain committed and reviewable.

### Merge strategy

- Objects merge shallowly by field.
- Arrays replace the shared value instead of appending.
- Scalars replace the shared value.
- `null` does not delete keys in MVP.

### Write behavior

- `init` should create `ai-workspace.local.json` only when the user selects `local` or `mixed` scope and local-only settings are actually needed.
- `generate`, `diff`, and `doctor` should load the local file automatically when present.

## 11. Versioning policy

- Backward-compatible additions may extend schema version `"1"` if all new fields are optional.
- Breaking changes must increment the major schema version string.
- Normalizers should fail fast on unknown major versions with a clear upgrade message.

## 12. Example shared manifest

```json
{
  "schemaVersion": "1",
  "project": {
    "name": "ops-dashboard",
    "type": "dashboard",
    "framework": "nextjs",
    "language": "ts"
  },
  "setup": {
    "depth": "semi-custom",
    "mode": "full",
    "scope": "mixed"
  },
  "targets": {
    "copilot": true,
    "claude": true,
    "codex": true,
    "mcp": true
  },
  "dashboard": {
    "styling": "tailwind",
    "components": "shadcn-ui",
    "dataFetching": "tanstack-query",
    "tables": "tanstack-table",
    "charts": "recharts",
    "forms": "react-hook-form-zod",
    "testing": ["vitest", "rtl", "playwright"],
    "state": "zustand"
  },
  "conventions": {
    "routing": "app-router",
    "folderStructure": "feature-first",
    "accessibility": true,
    "responsive": true,
    "authModel": "rbac"
  },
  "instructions": {
    "codingStyle": [
      "Use TypeScript strict mode.",
      "Handle loading, empty, error, and success states explicitly."
    ],
    "reviewRules": [
      "Prefer existing design-system components first.",
      "Do not introduce new UI libraries without approval."
    ]
  },
  "generated": {
    "prompts": "pack",
    "skills": true,
    "agents": true,
    "mcpPresets": ["filesystem", "docs"]
  }
}
```

## 13. Example local override

```json
{
  "setup": {
    "scope": "mixed"
  },
  "targets": {
    "mcp": true
  },
  "generated": {
    "prompts": "none",
    "mcpPresets": ["filesystem-local"]
  }
}
```

## 14. Non-goals

This specification does not require:

- arbitrary JSON schema passthrough outside `extensions`
- environment-variable interpolation inside the manifest itself
- YAML support in MVP
- per-target nested custom payloads before the core adapter contracts are stable
