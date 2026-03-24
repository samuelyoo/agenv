import { describe, expect, it } from "vitest";
import { buildGenerationPlan } from "../../../src/planner/build-plan.js";
import { windsurfAdapter } from "../../../src/adapters/windsurf/index.js";
import { dashboardManifest, webAppManifest, apiServiceManifest } from "../../fixtures/manifests.js";

function makeWindsurfManifest(type: "dashboard" | "web-app" | "api-service") {
  const base =
    type === "dashboard"
      ? dashboardManifest()
      : type === "web-app"
        ? webAppManifest()
        : apiServiceManifest();
  return { ...base, targets: { ...base.targets, windsurf: true } };
}

describe("windsurfAdapter", () => {
  it("supports() returns true when windsurf target is enabled", () => {
    const manifest = makeWindsurfManifest("web-app");
    expect(windsurfAdapter.supports(manifest).supported).toBe(true);
  });

  it("supports() returns false when windsurf target is disabled", () => {
    const manifest = webAppManifest();
    expect(windsurfAdapter.supports(manifest).supported).toBe(false);
  });

  it("plan() returns .md files under .windsurf/rules/", () => {
    const manifest = makeWindsurfManifest("web-app");
    const plan = buildGenerationPlan(manifest);
    const files = windsurfAdapter.plan(manifest, plan);
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => f.path.startsWith(".windsurf/rules/"))).toBe(true);
    expect(files.every((f) => f.path.endsWith(".md"))).toBe(true);
  });

  it("renders context.md with trigger: always_on frontmatter", () => {
    const manifest = makeWindsurfManifest("web-app");
    const plan = buildGenerationPlan(manifest);
    const files = windsurfAdapter.plan(manifest, plan);
    const contextFile = files.find((f) => f.path === ".windsurf/rules/context.md")!;
    const rendered = windsurfAdapter.render(contextFile, manifest);
    expect(rendered.content).toContain("trigger: always_on");
    expect(rendered.content).toContain("test-web-app");
  });

  it("renders coding-style.md with trigger: glob", () => {
    const manifest = makeWindsurfManifest("api-service");
    const plan = buildGenerationPlan(manifest);
    const files = windsurfAdapter.plan(manifest, plan);
    const styleFile = files.find((f) => f.path === ".windsurf/rules/coding-style.md")!;
    const rendered = windsurfAdapter.render(styleFile, manifest);
    expect(rendered.content).toContain("trigger: glob");
    expect(rendered.content).toContain("src/**/*.ts");
  });

  it("renders code-review.md with trigger: manual", () => {
    const manifest = makeWindsurfManifest("web-app");
    const plan = buildGenerationPlan(manifest);
    const files = windsurfAdapter.plan(manifest, plan);
    const reviewFile = files.find((f) => f.path === ".windsurf/rules/code-review.md")!;
    const rendered = windsurfAdapter.render(reviewFile, manifest);
    expect(rendered.content).toContain("trigger: manual");
  });
});
