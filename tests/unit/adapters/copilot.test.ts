import { describe, expect, it } from "vitest";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { copilotAdapter } from "../../../src/adapters/copilot/index.js";
import { dashboardManifest, webAppManifest, apiServiceManifest } from "../../fixtures/manifests.js";

describe("copilotAdapter", () => {
  it("supports() returns true when copilot target is enabled", () => {
    const manifest = dashboardManifest();
    expect(copilotAdapter.supports(manifest).supported).toBe(true);
  });

  it("supports() returns false when copilot target is disabled", () => {
    const manifest = dashboardManifest({ targets: { copilot: false, claude: true, codex: true, mcp: false } });
    expect(copilotAdapter.supports(manifest).supported).toBe(false);
  });

  it("plan() returns .github/copilot-instructions.md for copilot target", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const files = copilotAdapter.plan(manifest, plan);
    expect(files.some((f) => f.path === ".github/copilot-instructions.md")).toBe(true);
  });

  it("renders copilot-instructions.md with Copilot Instructions header", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    expect(rendered.content).toContain("# Copilot Instructions");
    expect(rendered.content).toContain("## Project");
    expect(rendered.content).toContain("## Coding Style");
  });

  it("renders project name and framework in instructions", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    expect(rendered.content).toContain("test-dashboard");
    expect(rendered.content).toContain("nextjs");
  });

  it("renders framework guidance for nextjs (App Router)", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    expect(rendered.content.toLowerCase()).toContain("app router");
  });

  it("renders framework guidance for express api-service", () => {
    const manifest = apiServiceManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    expect(rendered.content.toLowerCase()).toContain("express");
    expect(rendered.content.toLowerCase()).toContain("middleware");
  });

  it("renders web-app type description", () => {
    const manifest = webAppManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    expect(rendered.content.toLowerCase()).toContain("web application");
  });

  it("renders accessibility convention", () => {
    const manifest = dashboardManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    expect(rendered.content.toLowerCase()).toContain("accessible");
  });

  it("renders api-service with no accessibility or responsive convention", () => {
    const manifest = apiServiceManifest();
    const plan = buildGenerationPlan(manifest);
    const file = copilotAdapter.plan(manifest, plan).find((f) => f.path === ".github/copilot-instructions.md")!;
    const rendered = copilotAdapter.render(file, manifest);
    // api-service has no accessibility/responsive convention by default
    expect(rendered.content.toLowerCase()).not.toContain("keyboard-accessible");
  });
});
