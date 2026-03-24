import { describe, expect, it } from "vitest";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { cursorAdapter } from "../../../src/adapters/cursor/index.js";
import { dashboardManifest, webAppManifest, apiServiceManifest } from "../../fixtures/manifests.js";

function makeCursorManifest(type: "dashboard" | "web-app" | "api-service") {
  const base =
    type === "dashboard"
      ? dashboardManifest()
      : type === "web-app"
        ? webAppManifest()
        : apiServiceManifest();
  return { ...base, targets: { ...base.targets, cursor: true } };
}

describe("cursorAdapter", () => {
  it("supports() returns true when cursor target is enabled", () => {
    const manifest = makeCursorManifest("web-app");
    expect(cursorAdapter.supports(manifest).supported).toBe(true);
  });

  it("supports() returns false when cursor target is disabled", () => {
    const manifest = webAppManifest();
    expect(cursorAdapter.supports(manifest).supported).toBe(false);
  });

  it("plan() returns .mdc files for cursor target", () => {
    const manifest = makeCursorManifest("web-app");
    const plan = buildGenerationPlan(manifest);
    const files = cursorAdapter.plan(manifest, plan);
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => f.path.startsWith(".cursor/rules/"))).toBe(true);
    expect(files.every((f) => f.path.endsWith(".mdc"))).toBe(true);
  });

  it("renders context.mdc with alwaysApply: true frontmatter", () => {
    const manifest = makeCursorManifest("web-app");
    const plan = buildGenerationPlan(manifest);
    const files = cursorAdapter.plan(manifest, plan);
    const contextFile = files.find((f) => f.path === ".cursor/rules/context.mdc")!;
    const rendered = cursorAdapter.render(contextFile, manifest);
    expect(rendered.content).toContain("alwaysApply: true");
    expect(rendered.content).toContain("test-web-app");
    expect(rendered.content).toContain("---");
  });

  it("renders coding-style.mdc with globs frontmatter", () => {
    const manifest = makeCursorManifest("web-app");
    const plan = buildGenerationPlan(manifest);
    const files = cursorAdapter.plan(manifest, plan);
    const styleFile = files.find((f) => f.path === ".cursor/rules/coding-style.mdc")!;
    const rendered = cursorAdapter.render(styleFile, manifest);
    expect(rendered.content).toContain("globs:");
    expect(rendered.content).toContain("alwaysApply: false");
  });

  it("renders framework.mdc with framework-specific content", () => {
    const manifest = makeCursorManifest("dashboard");
    const plan = buildGenerationPlan(manifest);
    const files = cursorAdapter.plan(manifest, plan);
    const frameworkFile = files.find((f) => f.path === ".cursor/rules/framework.mdc")!;
    const rendered = cursorAdapter.render(frameworkFile, manifest);
    expect(rendered.content.toLowerCase()).toContain("nextjs");
  });

  it("renders correct files for all project types", () => {
    for (const type of ["dashboard", "web-app", "api-service"] as const) {
      const manifest = makeCursorManifest(type);
      const plan = buildGenerationPlan(manifest);
      const files = cursorAdapter.plan(manifest, plan);
      expect(files.map((f) => f.path)).toContain(".cursor/rules/context.mdc");
      expect(files.map((f) => f.path)).toContain(".cursor/rules/coding-style.mdc");
    }
  });
});
