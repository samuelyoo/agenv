# Implementation Plan v4 — agenv v2.1.0

**Baseline**: v2.0.0 — 6 adapters, 15 MCP presets, 7 project types, 19 templates, 132 tests.
**Source**: `.vscode/todo_v2.1.0.md`

---

## Sprint 1 — Bug Fixes + Quick Tests

### Step 1: Claude Adapter Truncation Check

**Goal**: Ensure every skill and agent in `SKILLS_BY_TYPE` / `AGENTS_BY_TYPE` has a matching description in the Claude adapter. Prevent silent render fallback.

**Files to modify / create**:
- `tests/unit/adapters/claude/descriptions.test.ts` (new)

**Implementation**:
```ts
// tests/unit/adapters/claude/descriptions.test.ts
import { describe, expect, it } from "vitest";
import { getSkillsForType, getAgentsForType, PROJECT_TYPES } from "../../src/planner/output-map.js";

// Import the internal SKILL_DESCRIPTIONS and AGENT_DESCRIPTIONS
// Option A: export them from claude adapter
// Option B: test via render() output — preferred for black-box testing

import { buildRecommendedManifest } from "../../src/manifest/defaults.js";
import { buildGenerationPlan } from "../../src/planner/build-plan.js";
import { renderPlanFiles } from "../../src/render/render-plan.js";

describe("Claude skill/agent description coverage", () => {
  for (const projectType of PROJECT_TYPES) {
    it(`renders all skills for ${projectType} without fallback text`, () => {
      const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType });
      manifest.targets.claude = true;
      manifest.generated.skills = true;
      const plan = buildGenerationPlan(manifest);
      const rendered = renderPlanFiles(manifest, plan);
      const skillFiles = rendered.filter(f => f.path.includes("/skills/"));

      for (const file of skillFiles) {
        // Verify content is non-trivial (>50 chars = has real description)
        expect(file.content.length).toBeGreaterThan(50);
        // Verify no "No description available" type fallback
        expect(file.content).not.toContain("No description");
      }

      // Verify count matches SKILLS_BY_TYPE
      const expectedSkills = getSkillsForType(projectType);
      expect(skillFiles.length).toBe(expectedSkills.length);
    });

    it(`renders all agents for ${projectType} without fallback text`, () => {
      const manifest = buildRecommendedManifest({ name: "test", framework: "react", projectType });
      manifest.targets.claude = true;
      manifest.generated.agents = true;
      const plan = buildGenerationPlan(manifest);
      const rendered = renderPlanFiles(manifest, plan);
      const agentFiles = rendered.filter(f => f.path.includes("/agents/"));

      for (const file of agentFiles) {
        expect(file.content.length).toBeGreaterThan(50);
        expect(file.content).not.toContain("No description");
      }

      const expectedAgents = getAgentsForType(projectType);
      expect(agentFiles.length).toBe(expectedAgents.length);
    });
  }
});
```

**Approach**: Black-box test via the render pipeline rather than exporting internals. For each of the 7 project types, verify that every planned skill/agent file renders with real content. If any skill in `SKILLS_BY_TYPE` is missing from `SKILL_DESCRIPTIONS`, the render output will be empty or contain a fallback — the test catches this.

If SKILL_DESCRIPTIONS/AGENT_DESCRIPTIONS need fixes, update them in `src/adapters/claude/index.ts` to match every entry in `src/planner/output-map.ts`.

**Exit criteria**: Tests pass for all 7 project types, every skill/agent renders >50 chars with no fallback text.

---

### Step 2: Doctor `supports()` Gate

**Goal**: Before running adapter-specific checks in `runDoctor()`, call `adapter.supports(manifest)` and skip checks for unsupported adapters. Prevents misleading warnings (e.g., MCP env warnings when MCP is disabled).

**Files to modify**:
- `src/doctor/run.ts`

**Files to create**:
- `tests/unit/doctor/supports-gate.test.ts`

**Implementation sketch** (`src/doctor/run.ts`):
```ts
import { ADAPTERS } from "../adapters/index.js";

export async function runDoctor(cwd: string, options: RunDoctorOptions): Promise<DoctorResult> {
  const inspection = await inspectRepo(cwd);
  // ... manifest loading unchanged ...

  // Determine which adapter targets are actually supported
  const supportedTargets = new Set<string>();
  if (manifest) {
    for (const adapter of ADAPTERS) {
      const result = adapter.supports(manifest);
      if (result.supported) {
        supportedTargets.add(adapter.id);
      }
    }
  }

  const findings = [
    ...runManifestChecks(manifest, manifestLoadError),
    ...runCompatibilityChecks(manifest, inspection),
    ...runSecurityChecks(manifest),
    ...runEnvChecks(manifest),
    ...(await runPathChecks(cwd, manifest)),
    ...runRepoMatchChecks(manifest, inspection),
    // Only run MCP-specific checks if MCP adapter is supported
    ...(supportedTargets.has("mcp") ? checkMcpEnvVars(manifest) : []),
    ...(supportedTargets.has("mcp") ? await checkMcpConfigFormat(cwd, manifest) : []),
  ];

  // ... rest unchanged ...
}
```

**Test sketch**:
```ts
it("skips MCP checks when MCP target is disabled", async () => {
  const cwd = await makeTempRepo();
  const manifest = buildRecommendedManifest({
    name: "test",
    framework: "nextjs",
    targets: { mcp: false },
  });
  await saveManifest(cwd, manifest);
  const result = await runDoctor(cwd, { strict: false, targets: [] });

  // No MCP-related findings
  const mcpFindings = [...result.errors, ...result.warnings, ...result.info]
    .filter(f => f.code.startsWith("mcp_"));
  expect(mcpFindings).toHaveLength(0);
});
```

**Exit criteria**: MCP checks skipped when `targets.mcp = false`. Test confirms no `mcp_*` findings for non-MCP manifests.

---

### Step 3: Backend Framework Detection

**Goal**: Detect Express, Fastify, Hono, and Koa from `package.json` dependencies so `api-service` and `full-stack` projects get accurate framework info.

**Files to modify**:
- `src/detect/frameworks.ts`

**Files to create**:
- `tests/unit/detect/frameworks.test.ts`

**Implementation** (`src/detect/frameworks.ts`):
```ts
export type DetectedFramework =
  | "react"
  | "nextjs"
  | "vite-react"
  | "express"
  | "fastify"
  | "hono"
  | "koa";

export function detectFrameworkFromDependencies(
  dependencies: Record<string, string>,
): DetectedFramework | undefined {
  // Frontend frameworks (prioritized)
  if ("next" in dependencies) return "nextjs";
  if ("vite" in dependencies && "react" in dependencies) return "vite-react";
  if ("react" in dependencies) return "react";

  // Backend frameworks
  if ("hono" in dependencies) return "hono";
  if ("fastify" in dependencies) return "fastify";
  if ("koa" in dependencies) return "koa";
  if ("express" in dependencies) return "express";

  return undefined;
}
```

**Key decisions**:
- Frontend detection takes priority over backend (a Next.js app with express shouldn't be detected as express).
- Hono, Fastify, Koa checked before Express because Express is sometimes a transitive dependency.

**Must also update**: `src/manifest/schema.ts` — add the new framework values to the `framework` zod enum. Then update `src/detect/repo-inspector.ts` if it narrows the Framework type.

**Test sketch**:
```ts
describe("detectFrameworkFromDependencies", () => {
  it("detects express", () => {
    expect(detectFrameworkFromDependencies({ express: "^4.18.0" })).toBe("express");
  });
  it("detects fastify", () => {
    expect(detectFrameworkFromDependencies({ fastify: "^4.0.0" })).toBe("fastify");
  });
  it("detects hono", () => {
    expect(detectFrameworkFromDependencies({ hono: "^4.0.0" })).toBe("hono");
  });
  it("detects koa", () => {
    expect(detectFrameworkFromDependencies({ koa: "^2.15.0" })).toBe("koa");
  });
  it("prefers frontend framework over backend", () => {
    expect(detectFrameworkFromDependencies({ next: "^14.0.0", express: "^4.18.0" }))
      .toBe("nextjs");
  });
});
```

**Exit criteria**: Backend frameworks detected; frontend still wins when both present; schema updated; tests pass.

---

### Step 4: Fix npm README Links

**Goal**: Ensure no local `/Users/...` paths leak into README.md.

**Files to check**: `README.md`

**Status**: Grep search confirmed **zero occurrences** of `/Users/` in README.md. This item is already clean.

**Action**: Mark as complete. If the issue was in a prior version, it has already been fixed.

---

### Step 5: CLI Command Parsing Tests

**Goal**: Verify `--targets`, `--layer`, `--scope` flag handling for the `generate` command, and `--json`, `--strict` for `doctor`.

**Files to create**:
- `tests/unit/cli/generate-flags.test.ts`
- `tests/unit/cli/doctor-flags.test.ts`

**Approach**: Test the parsing helper functions (`parseCommaList` from `utils/format.ts`) and the internal `runGenerate` function (already exported) with crafted options. No need to spawn CLI processes.

**Implementation sketch** (`tests/unit/cli/generate-flags.test.ts`):
```ts
import { describe, expect, it } from "vitest";
import { parseCommaList } from "../../../src/utils/format.js";

describe("CLI flag parsing", () => {
  describe("parseCommaList", () => {
    it("splits comma-separated values", () => {
      expect(parseCommaList("codex,claude,mcp")).toEqual(["codex", "claude", "mcp"]);
    });
    it("returns empty array for undefined", () => {
      expect(parseCommaList(undefined)).toEqual([]);
    });
    it("trims whitespace", () => {
      expect(parseCommaList(" codex , claude ")).toEqual(["codex", "claude"]);
    });
    it("returns single-element array for single value", () => {
      expect(parseCommaList("copilot")).toEqual(["copilot"]);
    });
  });
});
```

For `runGenerate` integration: test with a temp repo + manifest, passing specific `targets`/`layers`/`scopes` to verify only matching files are planned.

**Exit criteria**: All comma-list edge cases covered; filter integration tested.

---

## Sprint 2 — CI Features + Doctor Tests

### Step 6: `agenv doctor --ci` Flag

**Goal**: Add `--ci` flag that outputs JSON only and exits non-zero on any error OR warning. Useful in CI pipelines.

**Files to modify**:
- `src/cli/commands/doctor.ts`
- `src/doctor/run.ts` (or handle in CLI layer)

**Implementation** (`src/cli/commands/doctor.ts`):
```ts
type DoctorOptions = {
  json?: boolean;
  strict?: boolean;
  ci?: boolean;         // NEW
  targets?: string;
};

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Validate the current manifest and repo compatibility.")
    .option("--json", "emit machine-readable output")
    .option("--strict", "treat warnings as blocking")
    .option("--ci", "CI mode: JSON output, exit non-zero on errors or warnings")
    .option("--targets <list>", "reserved for future target-specific checks")
    .action(async (options: DoctorOptions) => {
      const cwd = process.cwd();
      const targetFilter = parseCommaList(options.targets);
      const isCi = Boolean(options.ci);
      const result = await runDoctor(cwd, {
        strict: isCi || Boolean(options.strict),  // CI implies strict
        targets: targetFilter,
      });

      if (isCi) {
        // JSON-only output in CI mode
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      } else {
        const text = formatTextBlock([
          `Status: ${result.status}`,
          `Errors: ${result.errors.length}`,
          `Warnings: ${result.warnings.length}`,
          `Info: ${result.info.length}`,
        ]);
        process.stdout.write(formatCommandOutput(text, result, Boolean(options.json)));
      }

      if (result.status === "error") {
        process.exitCode = 1;
      }
    });
}
```

**Key decisions**:
- `--ci` implies `--strict` (warnings → errors).
- `--ci` forces JSON output regardless of `--json` flag.
- Exit code 1 on any error (same as existing behavior, but now warnings trigger it too via strict).

**Test**: Create a manifest with known warnings, run `doctor --ci`, verify exit code and JSON output.

**Exit criteria**: `--ci` outputs JSON, exits non-zero on warnings, integrates with existing strict mode.

---

### Step 7: Doctor Check Unit Tests

**Goal**: Isolate each check function with targeted unit tests. Currently only `runDoctor` integration exists.

**Files to create**:
- `tests/unit/doctor/checks/compatibility.test.ts`
- `tests/unit/doctor/checks/env.test.ts`
- `tests/unit/doctor/checks/manifest.test.ts`
- `tests/unit/doctor/checks/mcp.test.ts`
- `tests/unit/doctor/checks/paths.test.ts`
- `tests/unit/doctor/checks/repo-match.test.ts`
- `tests/unit/doctor/checks/security.test.ts`

**Pattern** (each file follows the same structure):
```ts
import { describe, expect, it } from "vitest";
import { runCompatibilityChecks } from "../../../../src/doctor/checks/compatibility.js";
import type { RepoInspection } from "../../../../src/detect/repo-inspector.js";

describe("runCompatibilityChecks", () => {
  it("returns empty when manifest is undefined", () => {
    expect(runCompatibilityChecks(undefined, {} as RepoInspection)).toEqual([]);
  });

  it("warns on framework mismatch", () => {
    const manifest = { project: { framework: "react" } } as any;
    const inspection = { framework: "nextjs" } as RepoInspection;
    const findings = runCompatibilityChecks(manifest, inspection);
    expect(findings).toHaveLength(1);
    expect(findings[0].code).toBe("framework_mismatch");
    expect(findings[0].severity).toBe("warning");
  });

  it("returns empty when frameworks match", () => {
    const manifest = { project: { framework: "react" } } as any;
    const inspection = { framework: "react" } as RepoInspection;
    expect(runCompatibilityChecks(manifest, inspection)).toEqual([]);
  });
});
```

**Coverage targets per check**:
| Check | Cases |
|-------|-------|
| `manifest` | undefined manifest, load error, successful load |
| `compatibility` | no manifest, no framework, mismatch, match |
| `security` | MCP enabled → warning, MCP disabled → empty |
| `env` | no presets → empty, presets → info finding |
| `paths` | shared scope → skip, local scope + no file → warning, local scope + file exists → empty |
| `repo-match` | name match → empty, name mismatch → warning |
| `mcp` (env vars) | no manifest → empty, missing env var → warning, set env var → empty |
| `mcp` (config format) | no .mcp.json → warning, invalid JSON → error, missing mcpServers → error, valid → empty |

**Exit criteria**: ~25 targeted unit tests across 7 check files, all passing.

---

### Step 8: Interactive Init Flow Tests

**Goal**: Test the init wizard without user interaction by mocking `@inquirer/prompts`.

**Files to create**:
- `tests/unit/cli/init-flow.test.ts`

**Approach**: Mock `@inquirer/prompts` at the module level using Vitest's `vi.mock()`. Each test provides canned answers and verifies the resulting manifest shape.

**Implementation sketch**:
```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock @inquirer/prompts
vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
  input: vi.fn(),
  confirm: vi.fn(),
  checkbox: vi.fn(),
}));

import { select, input, confirm, checkbox } from "@inquirer/prompts";
import { runInitFlow } from "../../../src/cli/prompts/init-flow.js";

describe("runInitFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("produces a valid manifest for recommended dashboard setup", async () => {
    // Mock the prompts in order they're called
    (select as any)
      .mockResolvedValueOnce("recommended")    // setup depth
      .mockResolvedValueOnce("dashboard");       // project type
    (input as any).mockResolvedValueOnce("my-app"); // project name

    const result = await runInitFlow({ cwd: "/tmp/test" });
    expect(result.project.type).toBe("dashboard");
    expect(result.project.name).toBe("my-app");
  });

  it("handles custom setup depth with all options", async () => {
    // Test the full flow with "custom" setup depth
    // Mock all prompt calls for the custom path...
  });
});
```

**Key detail**: The init flow sessions are split across multiple prompt files in `src/cli/prompts/sessions/`. Each needs its mocked prompts to respond in the correct sequence. Review `init-flow.ts` call order carefully before writing mocks.

**Exit criteria**: At minimum 3 flows tested: recommended, custom minimal, custom full. Manifest shape validated.

---

## Sprint 3 — New Features

### Step 9: YAML Manifest Support

**Goal**: Accept `ai-workspace.yaml` (or `.yml`) as an alternative to `ai-workspace.json`.

**Files to modify**:
- `src/manifest/load.ts`
- `package.json` (add `yaml` dependency)

**Files to create**:
- `tests/unit/manifest/yaml-load.test.ts`

**Implementation** (`src/manifest/load.ts`):
```ts
import { parse as parseYaml } from "yaml";

export async function loadManifest(
  cwd: string,
  fallback?: { projectName?: string; framework?: Framework },
): Promise<LoadedManifest> {
  // Try JSON first, then YAML
  const jsonPath = join(cwd, "ai-workspace.json");
  const yamlPath = join(cwd, "ai-workspace.yaml");
  const ymlPath = join(cwd, "ai-workspace.yml");

  let sharedPath: string;
  let parseFile: (path: string) => Promise<unknown>;

  if (await fileExists(jsonPath)) {
    sharedPath = jsonPath;
    parseFile = (p) => readJsonFile<unknown>(p);
  } else if (await fileExists(yamlPath)) {
    sharedPath = yamlPath;
    parseFile = async (p) => parseYaml(await readFile(p, "utf8"));
  } else if (await fileExists(ymlPath)) {
    sharedPath = ymlPath;
    parseFile = async (p) => parseYaml(await readFile(p, "utf8"));
  } else {
    throw new ManifestNotFoundError(jsonPath);
  }

  // ... rest uses parseFile(sharedPath) instead of readJsonFile(sharedPath) ...
}
```

**Dependency**: `npm install yaml` (no dev — runtime dependency, ~30KB).

**Local override support**: Also check for `ai-workspace.local.yaml` / `.yml` variants alongside the JSON local override.

**Test sketch**:
```ts
it("loads YAML manifest", async () => {
  const cwd = await makeTempRepo();
  const yamlContent = `
project:
  name: test-yaml
  type: dashboard
  framework: react
`;
  await writeFile(join(cwd, "ai-workspace.yaml"), yamlContent, "utf8");
  const { manifest } = await loadManifest(cwd);
  expect(manifest.project.name).toBe("test-yaml");
});

it("prefers JSON over YAML when both exist", async () => {
  // Write both, verify JSON wins
});
```

**Exit criteria**: YAML manifests load and pass through the same normalize/migrate pipeline as JSON. JSON takes priority when both exist. Tests pass.

---

### Step 10: Watch Mode

**Goal**: `agenv generate --watch` to regenerate output files when `ai-workspace.json` (or YAML) changes.

**Files to modify**:
- `src/cli/commands/generate.ts`

**Implementation sketch**:
```ts
import { watch } from "node:fs";

// In registerGenerateCommand:
.option("--watch", "watch manifest for changes and regenerate")

// In action handler:
if (options.watch) {
  const manifestPath = join(process.cwd(), "ai-workspace.json");
  console.log(`Watching ${manifestPath} for changes...`);

  let debounceTimer: NodeJS.Timeout | undefined;

  watch(manifestPath, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log("\nManifest changed, regenerating...");
      try {
        const result = await runGenerate({
          cwd: process.cwd(),
          force: Boolean(options.force),
          ...compactObject({
            targets: parseTargets(options.targets),
            layers: parseLayers(options.layer),
            scopes: parseScopes(options.scope),
          }),
        });
        console.log(`Regenerated ${result.plan.files.length} files.`);
      } catch (error) {
        console.error("Regeneration failed:", error instanceof Error ? error.message : error);
      }
    }, 300); // 300ms debounce
  });

  // Keep process alive
  return;
}
```

**Key decisions**:
- Use Node built-in `fs.watch()` — no extra dependency. Works well for single-file watching.
- 300ms debounce to handle editors that write in multiple steps.
- `--watch` is incompatible with `--dry-run` — log a warning and exit if both are set.
- Also watch for YAML variant if Step 9 is implemented.

**Exit criteria**: `agenv generate --watch` watches manifest, regenerates on change, debounces rapid saves.

---

### Step 11: Local Override Documentation

**Goal**: Document what `ai-workspace.local.json` supports and its limitations.

**Files to modify**:
- `doc/manifest-spec.md`

**Content to add**:
```markdown
## Local Overrides

The file `ai-workspace.local.json` allows per-developer overrides that should NOT be
committed to version control. Add it to `.gitignore`.

### Supported top-level keys

| Key | Description |
|-----|-------------|
| `setup` | Override `scope` (shared / local / mixed) |
| `targets` | Enable/disable specific adapters (mcp, cursor, windsurf, etc.) |
| `generated` | Override generated outputs: `prompts`, `mcpPresets` |
| `extensions` | Local VS Code extension recommendations |

### Not supported in local overrides

The following keys are **ignored** in `ai-workspace.local.json`:
- `project` (name, type, framework)
- `instructions` (codingStyle, reviewRules)
- `conventions`

These are considered shared project config and must be set in the main `ai-workspace.json`.

### Example

```json
{
  "targets": {
    "mcp": true,
    "cursor": true
  },
  "generated": {
    "mcpPresets": ["github", "slack", "notion"]
  }
}
```
```

**Exit criteria**: Documentation clearly lists which keys are/aren't supported in local overrides.

---

## Sprint 4 — Growth & Community

### Step 12: Landing Page Polish

**Goal**: Improve `docs/index.html` with demo content, before/after comparison, "Why agenv?" section.

**Files to modify**:
- `docs/index.html`
- `docs/assets/css/style.css`

**Content plan**:
1. **Hero section**: One-liner + terminal GIF/screenshot placeholder
2. **"Why agenv?"**: 3-column grid — "One Manifest", "6 AI Tools", "Zero Lock-in"
3. **Before/After**: Side-by-side code comparison showing manual config vs. agenv
4. **Quick start**: `npx agenv-cli init` → `npx agenv-cli generate`
5. **Supported tools**: Logos/icons for Copilot, Claude, Codex, Cursor, Windsurf, MCP

**Exit criteria**: Landing page has clear value proposition and quick-start instructions.

---

### Step 13: Create Example Repos

**Goal**: 2–3 reference repos demonstrating agenv usage for different project types.

**Deliverables**:
- `examples/dashboard-example/` — React + Next.js dashboard with full agenv config
- `examples/api-service-example/` — Express API with agenv config
- `examples/web-app-example/` — Vite + React web app with agenv config

Each example contains:
- `ai-workspace.json` manifest
- Generated output files (`.github/copilot-instructions.md`, `.claude/`, `.mcp.json`, etc.)
- Minimal `package.json` with dependencies
- Brief `README.md` explaining the setup

**Approach**: Either separate repos linked from main README, or an `examples/` directory in the monorepo. Separate repos are better for discoverability but harder to maintain. Recommend `examples/` directory for v2.1.0.

**Exit criteria**: 2+ example directories, each with a working manifest and generated files.

---

### Step 14: Plugin/Community Ecosystem (Design Only)

**Goal**: Design the `agenv templates pull <name>` command and community adapter/preset contribution format.

**Files to create**:
- `doc/plugin-spec.md` (design doc, no implementation)

**Design outline**:
- Template registry: JSON index hosted on GitHub (or npm). Each entry has name, description, URL, manifest snippet.
- `agenv templates pull <name>` fetches the template and merges into local manifest.
- Community adapters: Follow the `Adapter` interface. Published as npm packages with a `agenv-adapter-` prefix.
- Community presets: Follow the `McpPreset` interface. Published as npm packages with `agenv-preset-` prefix.

**Exit criteria**: Design doc captures the plugin model. Implementation deferred to v2.2.0.

---

### Step 15: Blog Post / Launch Prep

**Goal**: Prepare announcement content for dev.to / Hacker News.

**Files to create**:
- `doc/launch-post.md` (draft)

**Outline**:
1. Problem: every AI coding tool needs its own config files
2. Solution: one manifest → auto-generated configs for 6 tools
3. Quick demo: `npx agenv-cli init && npx agenv-cli generate`
4. Key differentiators: 15 MCP presets, 7 project types, doctor diagnostics
5. Call to action: star the repo, try it, contribute

**Exit criteria**: Draft ready for polishing and publishing.

---

## Dependency Graph

```
Step 1 ──┐
Step 2 ──┤
Step 3 ──┼── Sprint 1 (independent, parallel-safe)
Step 4 ──┤
Step 5 ──┘
         │
Step 6 ──┤
Step 7 ──┼── Sprint 2 (independent, parallel-safe)
Step 8 ──┘
         │
Step 9 ──┐
Step 10 ─┼── Sprint 3 (Step 10 depends on Step 9 for YAML watch)
Step 11 ─┘
         │
Step 12 ─┐
Step 13 ─┤
Step 14 ─┼── Sprint 4 (independent, parallel-safe)
Step 15 ─┘
```

## Summary

| Sprint | Steps | Estimated Tests Added |
|--------|-------|-----------------------|
| 1 | Bug fixes + CLI parse tests | ~30 |
| 2 | CI flag + doctor + init tests | ~35 |
| 3 | YAML + watch + docs | ~10 |
| 4 | Landing page + examples + launch | ~0 |

**Total new tests**: ~75 (bringing total from 132 → ~207)
