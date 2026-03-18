import type { Manifest } from "../manifest/schema.js";

export const ADAPTER_TARGETS = ["codex", "copilot", "claude", "mcp"] as const;

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

const CLAUDE_SKILLS = [
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
];

const CLAUDE_AGENTS = [
  "ui-builder",
  "data-integrator",
  "table-specialist",
  "chart-specialist",
  "form-builder",
  "qa-reviewer",
];

export const PROMPT_PACKS = [
  "build-page-shell",
  "build-data-table",
  "build-filter-panel",
  "build-kpi-cards",
  "build-chart-section",
  "connect-api-resource",
  "build-form-flow",
  "ui-builder",
  "data-integrator",
  "table-specialist",
  "chart-specialist",
  "form-builder",
  "qa-reviewer",
];

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
  ...CLAUDE_SKILLS.map<OutputMapEntry>((skillName) => ({
    target: "claude",
    path: `.claude/skills/${skillName}.md`,
    layer: "skills-agents",
    scope: "shared",
    purpose: `Claude skill: ${skillName}`,
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.claude && manifest.generated.skills,
  })),
  ...CLAUDE_AGENTS.map<OutputMapEntry>((agentName) => ({
    target: "claude",
    path: `.claude/agents/${agentName}.md`,
    layer: "skills-agents",
    scope: "shared",
    purpose: `Claude agent: ${agentName}`,
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.targets.claude && manifest.generated.agents,
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
  ...PROMPT_PACKS.map<OutputMapEntry>((promptName) => ({
    target: "shared",
    path: `docs/ai-prompts/${promptName}.md`,
    layer: "prompts",
    scope: "shared",
    purpose: `Prompt pack: ${promptName}`,
    generated: true,
    trustSensitive: false,
    applies: (manifest) => manifest.generated.prompts === "pack",
  })),
];
