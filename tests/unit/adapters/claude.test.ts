import { describe, expect, it } from "vitest";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { claudeAdapter } from "../../../src/adapters/claude/index.js";
import { dashboardManifest, webAppManifest, apiServiceManifest } from "../../fixtures/manifests.js";

describe("claudeAdapter", () => {
  it("supports() returns true when claude target is enabled", () => {
    const manifest = dashboardManifest();
    expect(claudeAdapter.supports(manifest).supported).toBe(true);
  });

  it("supports() returns false when claude target is disabled", () => {
    const manifest = dashboardManifest({ targets: { copilot: true, claude: false, codex: true, mcp: false } });
    expect(claudeAdapter.supports(manifest).supported).toBe(false);
  });

  it("plan() returns .claude/ files for claude target", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const files = claudeAdapter.plan(manifest, plan);
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => f.path.startsWith(".claude/"))).toBe(true);
  });

  it("plan() includes .claude/README.md", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const files = claudeAdapter.plan(manifest, plan);
    expect(files.some((f) => f.path === ".claude/README.md")).toBe(true);
  });

  it("renders README.md with project name and framework", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = claudeAdapter.plan(manifest, plan).find((f) => f.path === ".claude/README.md")!;
    const rendered = claudeAdapter.render(file, manifest);
    expect(rendered.content).toContain("test-dashboard");
    expect(rendered.content).toContain("nextjs");
    expect(rendered.content).toContain("Claude Workspace");
  });

  it("renders README.md with correct project type for web-app", () => {
    const manifest = webAppManifest();
    const plan = buildGenerationPlan(manifest);
    const file = claudeAdapter.plan(manifest, plan).find((f) => f.path === ".claude/README.md")!;
    const rendered = claudeAdapter.render(file, manifest);
    expect(rendered.content).toContain("web application");
  });

  it("renders README.md with correct project type for api-service", () => {
    const manifest = apiServiceManifest();
    const plan = buildGenerationPlan(manifest);
    const file = claudeAdapter.plan(manifest, plan).find((f) => f.path === ".claude/README.md")!;
    const rendered = claudeAdapter.render(file, manifest);
    expect(rendered.content).toContain("API service");
  });

  it("renders skill file with goal and context", () => {
    const manifest = dashboardManifest({ generated: { skills: true, agents: false, prompts: "master", mcpPresets: [] } });
    const plan = buildGenerationPlan(manifest);
    const files = claudeAdapter.plan(manifest, plan);
    const skillFile = files.find((f) => f.path.includes("/skills/"))!;
    if (!skillFile) return;
    const rendered = claudeAdapter.render(skillFile, manifest);
    expect(rendered.content).toContain("## Goal");
    expect(rendered.content).toContain("## Project Context");
    expect(rendered.content).toContain("nextjs");
  });

  it("renders agent file with role and focus", () => {
    const manifest = dashboardManifest({ generated: { skills: false, agents: true, prompts: "master", mcpPresets: [] } });
    const plan = buildGenerationPlan(manifest);
    const files = claudeAdapter.plan(manifest, plan);
    const agentFile = files.find((f) => f.path.includes("/agents/"))!;
    if (!agentFile) return;
    const rendered = claudeAdapter.render(agentFile, manifest);
    expect(rendered.content).toContain("## Role");
    expect(rendered.content).toContain("## Focus");
    expect(rendered.content).toContain("## Project Context");
  });

  it("includes .claude/settings.local.json for mixed scope", () => {
    const manifest = dashboardManifest({ setup: { scope: "mixed" } });
    const plan = buildGenerationPlan(manifest);
    const files = claudeAdapter.plan(manifest, plan);
    expect(files.some((f) => f.path === ".claude/settings.local.json")).toBe(true);
  });
});
