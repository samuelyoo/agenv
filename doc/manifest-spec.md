# Manifest specification

`ai-workspace.json` is the canonical, reviewable project contract for agenv. JSON, YAML (`ai-workspace.yaml`), and short-form YAML (`ai-workspace.yml`) are accepted. The current schema version is `"2"`; version 1 is migrated while loading.

The executable source of truth is `src/manifest/schema.ts`.

## Core shape

```ts
type Manifest = {
  schemaVersion: string;
  project: {
    name: string;
    type: "dashboard" | "web-app" | "api-service" | "full-stack" |
      "library" | "cli-tool" | "mobile";
    framework: "react" | "nextjs" | "vite-react" | "express" | "fastify" |
      "hono" | "koa" | "django" | "flask" | "fastapi" | "gin" | "echo" |
      "actix" | "axum" | "spring" | "rails" | "none";
    language: "ts" | "python" | "go" | "rust" | "java" | "ruby" | "other";
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
    cursor?: boolean;
    windsurf?: boolean;
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
  packs?: Array<{
    source: "builtin" | "local" | "github";
    id: string;
    version?: string;
    path?: string;
  }>;
  extensions?: Record<string, unknown>;
};
```

The manifest also accepts one optional block that matches `project.type`: `dashboard`, `webApp`, `apiService`, `fullStack`, `library`, `cliTool`, or `mobile`. These blocks carry finite, type-specific tooling preferences such as API style, testing stack, styling, navigation, or publishing target. Their exact enums are defined in the schema source.

## Semantics

- At least one platform target should be enabled.
- `setup.mode` controls whether only base files, Claude skills, Claude agents, or the full selected output is planned.
- `setup.scope` separates shareable repository files from machine-local settings.
- `instructions` is common source material for every enabled platform adapter.
- `generated.mcpPresets` contains catalog IDs, never raw secrets or arbitrary server objects.
- `packs` declares reusable policy bundles; `agenv install` resolves them into `ai-workspace.lock`.
- Unknown custom data is isolated under `extensions`; the core ignores it unless a feature explicitly claims it.

## Local overrides

The first existing file in this order is loaded:

1. `ai-workspace.local.json`
2. `ai-workspace.local.yaml`
3. `ai-workspace.local.yml`

Local overrides may change only:

- `setup.scope`
- `targets.mcp`, `targets.cursor`, and `targets.windsurf`
- `generated.prompts` and `generated.mcpPresets`
- `extensions`

Objects merge by field, arrays replace the shared array, and scalar values replace the shared value. Local files must not redefine the project, schema version, or shared instructions.

## Example

```json
{
  "schemaVersion": "2",
  "project": {
    "name": "payments-api",
    "type": "api-service",
    "framework": "fastapi",
    "language": "python"
  },
  "setup": {
    "depth": "recommended",
    "mode": "full",
    "scope": "mixed"
  },
  "targets": {
    "copilot": true,
    "claude": true,
    "codex": true,
    "mcp": true,
    "cursor": true,
    "windsurf": true
  },
  "apiService": {
    "apiStyle": "rest",
    "validation": "custom",
    "orm": "none",
    "testing": ["pytest"],
    "auth": "jwt"
  },
  "conventions": {
    "accessibility": false,
    "responsive": false,
    "authModel": "custom"
  },
  "instructions": {
    "codingStyle": [
      "Use Python type hints on public APIs.",
      "Validate inputs at the service boundary."
    ],
    "reviewRules": [
      "Do not expose internal error details in responses."
    ]
  },
  "generated": {
    "prompts": "master",
    "skills": true,
    "agents": true,
    "mcpPresets": ["github", "sentry"]
  },
  "packs": []
}
```

## Validation and versioning

The schema is strict: unknown fields outside `extensions`, empty instruction arrays, invalid enum values, and malformed type-specific blocks fail before planning. Version 1 manifests are upgraded to version 2 in memory. A manifest created by a newer unsupported schema version fails with a request to upgrade agenv.
