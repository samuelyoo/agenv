import { describe, expect, it } from "vitest";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { codexAdapter } from "../../../src/adapters/codex/index.js";
import { dashboardManifest, webAppManifest, apiServiceManifest } from "../../fixtures/manifests.js";

describe("codexAdapter", () => {
  it("supports() returns true when codex target is enabled", () => {
    const manifest = dashboardManifest();
    expect(codexAdapter.supports(manifest).supported).toBe(true);
  });

  it("supports() returns false when codex target is disabled", () => {
    const manifest = dashboardManifest({ targets: { copilot: true, claude: true, codex: false, mcp: false } });
    expect(codexAdapter.supports(manifest).supported).toBe(false);
  });

  it("plan() returns AGENTS.md for codex target", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const files = codexAdapter.plan(manifest, plan);
    expect(files.some((f) => f.path === "AGENTS.md")).toBe(true);
  });

  it("renders AGENTS.md with # AGENTS header", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = codexAdapter.plan(manifest, plan).find((f) => f.path === "AGENTS.md")!;
    const rendered = codexAdapter.render(file, manifest);
    expect(rendered.content).toContain("# AGENTS");
    expect(rendered.content).toContain("## Project Overview");
    expect(rendered.content).toContain("## Coding Style");
  });

  it("renders framework-specific guidance for nextjs dashboard", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = codexAdapter.plan(manifest, plan).find((f) => f.path === "AGENTS.md")!;
    const rendered = codexAdapter.render(file, manifest);
    expect(rendered.content).toContain("nextjs");
    expect(rendered.content.toLowerCase()).toContain("app router");
  });

  it("renders framework-specific guidance for express api-service", () => {
    const manifest = apiServiceManifest();
    const plan = buildGenerationPlan(manifest);
    const file = codexAdapter.plan(manifest, plan).find((f) => f.path === "AGENTS.md")!;
    const rendered = codexAdapter.render(file, manifest);
    expect(rendered.content.toLowerCase()).toContain("express");
    expect(rendered.content.toLowerCase()).toContain("middleware");
  });

  it("includes dashboard conventions in AGENTS.md", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = codexAdapter.plan(manifest, plan).find((f) => f.path === "AGENTS.md")!;
    const rendered = codexAdapter.render(file, manifest);
    expect(rendered.content).toContain("tailwind");
    expect(rendered.content).toContain("shadcn-ui");
  });

  it("includes api-service conventions in AGENTS.md", () => {
    const manifest = apiServiceManifest();
    const plan = buildGenerationPlan(manifest);
    const file = codexAdapter.plan(manifest, plan).find((f) => f.path === "AGENTS.md")!;
    const rendered = codexAdapter.render(file, manifest);
    expect(rendered.content).toContain("rest");
    expect(rendered.content).toContain("zod");
  });

  it("includes web-app conventions in AGENTS.md", () => {
    const manifest = webAppManifest();
    const plan = buildGenerationPlan(manifest);
    const file = codexAdapter.plan(manifest, plan).find((f) => f.path === "AGENTS.md")!;
    const rendered = codexAdapter.render(file, manifest);
    expect(rendered.content).toContain("tailwind");
    expect(rendered.content).toContain("tanstack-query");
  });
});
