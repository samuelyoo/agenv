import type { Manifest, ProjectType } from "../manifest/schema.js";

export const ADAPTER_TARGETS = ["codex", "copilot", "claude", "mcp", "cursor", "windsurf"] as const;

export type AdapterTarget = (typeof ADAPTER_TARGETS)[number];
export type PlanTarget = AdapterTarget | "shared";
export type OutputLayer = "base" | "skills-agents" | "prompts";
export type OutputScope = "shared" | "local";

export type OutputMapEntry = {
  target: PlanTarget;
  path: string;
  layer: OutputLayer;
  scope: OutputScope;
  purpose: string;
  generated: boolean;
  trustSensitive: boolean;
  applies: (manifest: Manifest) => boolean;
};

const SKILLS_BY_TYPE: Record<ProjectType, string[]> = {
  dashboard: [
    "build-page-shell",
    "build-data-table",
    "build-filter-panel",
    "build-kpi-cards",
    "build-chart-section",
    "connect-api-resource",
    "build-form-flow",
    "handle-loading-empty-error-states",
    "enforce-accessibility-and-responsive-layout",
    "write-dashboard-tests",
  ],
  "web-app": [
    "build-page-layout",
    "build-navigation",
    "build-auth-flow",
    "build-state-management",
    "build-api-integration",
    "implement-routing",
    "write-web-app-tests",
  ],
  "api-service": [
    "design-api-endpoints",
    "build-request-validation",
    "build-database-layer",
    "build-auth-middleware",
    "build-error-handling",
    "implement-logging",
    "write-api-tests",
    "build-background-jobs",
    "configure-deployment",
    "document-api",
  ],
  "full-stack": [
    "build-page-layout",
    "build-auth-flow",
    "build-api-integration",
    "build-database-layer",
    "build-form-flow",
    "implement-routing",
    "write-full-stack-tests",
  ],
  library: [
    "design-public-api",
    "write-library-tests",
    "build-tree-shakeable-exports",
    "generate-typedoc",
    "configure-build",
  ],
  "cli-tool": [
    "design-commands",
    "build-arg-parsing",
    "implement-config-file",
    "write-cli-tests",
    "configure-package-bin",
  ],
  mobile: [
    "build-screen-layout",
    "build-navigation-stack",
    "build-auth-flow",
    "connect-api-resource",
    "write-mobile-tests",
  ],
};

const AGENTS_BY_TYPE: Record<ProjectType, string[]> = {
  dashboard: [
    "ui-builder",
    "data-integrator",
    "table-specialist",
    "chart-specialist",
    "form-builder",
    "qa-reviewer",
  ],
  "web-app": [
    "state-architect",
    "api-integrator",
    "auth-specialist",
    "test-writer",
  ],
  "api-service": [
    "api-designer",
    "data-layer-builder",
    "error-handler",
    "devops-reviewer",
  ],
  "full-stack": [
    "ui-builder",
    "api-designer",
    "data-layer-builder",
    "auth-specialist",
    "test-writer",
  ],
  library: [
    "api-designer",
    "test-writer",
    "docs-writer",
  ],
  "cli-tool": [
    "cli-designer",
    "test-writer",
  ],
  mobile: [
    "ui-builder",
    "auth-specialist",
    "test-writer",
  ],
};

export function getSkillsForType(type: ProjectType): string[] {
  return SKILLS_BY_TYPE[type];
}

export function getAgentsForType(type: ProjectType): string[] {
  return AGENTS_BY_TYPE[type];
}

export function getPromptPacksForType(type: ProjectType): string[] {
  return [...SKILLS_BY_TYPE[type], ...AGENTS_BY_TYPE[type]];
}

// Backward-compat export: flat list used when project type is unknown (e.g. prompt index without type context)
export const PROMPT_PACKS = getPromptPacksForType("dashboard");

export const OUTPUT_MAP: OutputMapEntry[] = [
  {
    target: "shared",
    path: "ai-workspace.json",
    layer: "base",
    scope: "shared",
    purpose: "Canonical manifest",
    generated: true,
    trustSensitive: false,
    applies: () => true,
  },
  {
    target: "shared",
    path: "docs/ai-architecture.md",
    layer: "base",
    scope: "shared",
    purpose: "Shared project conventions summary",
    generated: true,
    trustSensitive: false,
    applies: (manifest) =>
      Object.values(manifest.targets).some((value) => value),
  },
  {
    target: "shared",
    path: "docs/ai-prompts/bootstrap.md",
    layer: "prompts",
    scope: "shared",
    purpose: "Bootstrap prompt",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.generated.prompts !== "none",
  },
  {
    target: "shared",
    path: "docs/ai-prompts/README.md",
    layer: "prompts",
    scope: "shared",
    purpose: "Prompt pack index",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.generated.prompts !== "none",
  },
  {
    target: "shared",
    path: ".env.example",
    layer: "base",
    scope: "shared",
    purpose: "Environment placeholder documentation",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.generated.mcpPresets.length > 0,
  },
  {
    target: "shared",
    path: "ai-workspace.local.json",
    layer: "base",
    scope: "local",
    purpose: "Local override manifest",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.setup.scope !== "shared",
  },
  {
    target: "codex",
    path: "AGENTS.md",
    layer: "base",
    scope: "shared",
    purpose: "Codex project instructions",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.codex,
  },
  {
    target: "copilot",
    path: ".github/copilot-instructions.md",
    layer: "base",
    scope: "shared",
    purpose: "GitHub Copilot instructions",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.copilot,
  },
  {
    target: "claude",
    path: ".claude/README.md",
    layer: "base",
    scope: "shared",
    purpose: "Claude workspace overview",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.claude,
  },
  ...Object.values(SKILLS_BY_TYPE)
    .flat()
    .filter((v, i, a) => a.indexOf(v) === i)
    .map<OutputMapEntry>((skillName) => ({
      target: "claude",
      path: `.claude/skills/${skillName}.md`,
      layer: "skills-agents",
      scope: "shared",
      purpose: `Claude skill: ${skillName}`,
      generated: true,
      trustSensitive: false,
      applies: (manifest) =>
        manifest.targets.claude &&
        manifest.generated.skills &&
        getSkillsForType(manifest.project.type).includes(skillName),
    })),
  ...Object.values(AGENTS_BY_TYPE)
    .flat()
    .filter((v, i, a) => a.indexOf(v) === i)
    .map<OutputMapEntry>((agentName) => ({
      target: "claude",
      path: `.claude/agents/${agentName}.md`,
      layer: "skills-agents",
      scope: "shared",
      purpose: `Claude agent: ${agentName}`,
      generated: true,
      trustSensitive: false,
      applies: (manifest) =>
        manifest.targets.claude &&
        manifest.generated.agents &&
        getAgentsForType(manifest.project.type).includes(agentName),
    })),
  {
    target: "claude",
    path: ".claude/settings.local.json",
    layer: "base",
    scope: "local",
    purpose: "Local Claude settings",
    generated: true,
    trustSensitive: true,
    applies: (manifest) => manifest.targets.claude && manifest.setup.scope !== "shared",
  },
  {
    target: "mcp",
    path: ".mcp.json",
    layer: "base",
    scope: "shared",
    purpose: "Shared MCP configuration",
    generated: true,
    trustSensitive: true,
    applies: (manifest) => manifest.targets.mcp,
  },
  {
    target: "mcp",
    path: ".mcp.local.json",
    layer: "base",
    scope: "local",
    purpose: "Local MCP overrides",
    generated: true,
    trustSensitive: true,
    applies: (manifest) => manifest.targets.mcp && manifest.setup.scope !== "shared",
  },
  {
    target: "cursor",
    path: ".cursor/rules/context.mdc",
    layer: "base",
    scope: "shared",
    purpose: "Cursor project context rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.cursor === true,
  },
  {
    target: "cursor",
    path: ".cursor/rules/coding-style.mdc",
    layer: "base",
    scope: "shared",
    purpose: "Cursor coding style rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.cursor === true,
  },
  {
    target: "cursor",
    path: ".cursor/rules/framework.mdc",
    layer: "base",
    scope: "shared",
    purpose: "Cursor framework-specific rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.cursor === true,
  },
  {
    target: "cursor",
    path: ".cursor/rules/code-review.mdc",
    layer: "base",
    scope: "shared",
    purpose: "Cursor code review rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.cursor === true,
  },
  {
    target: "windsurf",
    path: ".windsurf/rules/context.md",
    layer: "base",
    scope: "shared",
    purpose: "Windsurf project context rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.windsurf === true,
  },
  {
    target: "windsurf",
    path: ".windsurf/rules/coding-style.md",
    layer: "base",
    scope: "shared",
    purpose: "Windsurf coding style rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.windsurf === true,
  },
  {
    target: "windsurf",
    path: ".windsurf/rules/framework.md",
    layer: "base",
    scope: "shared",
    purpose: "Windsurf framework-specific rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.windsurf === true,
  },
  {
    target: "windsurf",
    path: ".windsurf/rules/code-review.md",
    layer: "base",
    scope: "shared",
    purpose: "Windsurf code review rule",
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.windsurf === true,
  },
  ...Object.values(SKILLS_BY_TYPE)
    .flat()
    .concat(Object.values(AGENTS_BY_TYPE).flat())
    .filter((v, i, a) => a.indexOf(v) === i)
    .map<OutputMapEntry>((promptName) => ({
      target: "shared",
      path: `docs/ai-prompts/${promptName}.md`,
      layer: "prompts",
      scope: "shared",
      purpose: `Prompt pack: ${promptName}`,
      generated: true,
      trustSensitive: false,
      applies: (manifest) =>
        manifest.generated.prompts === "pack" &&
        getPromptPacksForType(manifest.project.type).includes(promptName),
    })),
];
