import { describe, expect, it } from "vitest";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";

describe("buildGenerationPlan", () => {
  it("includes prompt files by default when recommended prompts are enabled", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "nextjs",
      generated: {
        prompts: "pack",
      },
    });

    const plan = buildGenerationPlan(manifest);

    expect(plan.files.some((file) => file.path === "AGENTS.md")).toBe(true);
    expect(plan.files.some((file) => file.path === "docs/ai-prompts/bootstrap.md")).toBe(true);
    expect(plan.files.some((file) => file.path === ".claude/skills/build-data-table.md")).toBe(false);
  });

  it("still lets explicit base mode suppress prompt output", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "nextjs",
      setup: {
        mode: "base",
      },
      generated: {
        prompts: "pack",
      },
    });

    const plan = buildGenerationPlan(manifest);

    expect(plan.files.every((file) => file.layer === "base")).toBe(true);
    expect(plan.files.some((file) => file.path === "docs/ai-prompts/bootstrap.md")).toBe(false);
  });

  it("includes skills, agents, prompts, and warnings in full mode", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "vite-react",
      targets: {
        mcp: true,
      },
      setup: {
        mode: "full",
      },
      generated: {
        prompts: "pack",
        skills: true,
        agents: true,
        mcpPresets: ["filesystem"],
      },
    });

    const plan = buildGenerationPlan(manifest);

    expect(plan.files.some((file) => file.path === "docs/ai-prompts/bootstrap.md")).toBe(true);
    expect(plan.files.some((file) => file.path === ".claude/skills/build-data-table.md")).toBe(true);
    expect(plan.files.some((file) => file.path === ".claude/agents/ui-builder.md")).toBe(true);
    expect(plan.files.some((file) => file.path === ".mcp.json")).toBe(true);
    expect(plan.warnings.map((warning) => warning.code)).toContain("mcp_is_trust_sensitive");
  });

  it("filters by target and scope while keeping shared target-owned files", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "react",
      targets: {
        mcp: true,
      },
      setup: {
        mode: "full",
      },
      generated: {
        prompts: "pack",
        skills: true,
        agents: true,
      },
    });

    const plan = buildGenerationPlan(manifest, {
      targets: ["claude"],
      scopes: ["local"],
    });

    expect(plan.files.map((file) => file.path)).toEqual([
      "ai-workspace.local.json",
      ".claude/settings.local.json",
    ]);
  });
});
