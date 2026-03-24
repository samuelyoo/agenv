import { describe, expect, it } from "vitest";
import { buildRecommendedManifest } from "../../../src/manifest/defaults.js";
import { getSkillsForType, getAgentsForType } from "../../../src/planner/output-map.js";

describe("getSkillsForType", () => {
  it("returns dashboard skills", () => {
    const manifest = buildRecommendedManifest({ name: "dash", framework: "nextjs", projectType: "dashboard" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("build-data-table");
    expect(skills).toContain("build-chart-section");
  });

  it("returns web-app skills", () => {
    const manifest = buildRecommendedManifest({ name: "site", framework: "react", projectType: "web-app" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("build-auth-flow");
    expect(skills).toContain("build-api-integration");
  });

  it("returns api-service skills", () => {
    const manifest = buildRecommendedManifest({ name: "api", framework: "express", projectType: "api-service" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("design-api-endpoints");
    expect(skills).toContain("write-api-tests");
  });

  it("returns full-stack skills", () => {
    const manifest = buildRecommendedManifest({ name: "saas", framework: "nextjs", projectType: "full-stack" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("build-database-layer");
    expect(skills).toContain("write-full-stack-tests");
  });

  it("returns library skills", () => {
    const manifest = buildRecommendedManifest({ name: "lib", framework: "react", projectType: "library" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("design-public-api");
    expect(skills).toContain("build-tree-shakeable-exports");
    expect(skills).toContain("generate-typedoc");
  });

  it("returns cli-tool skills", () => {
    const manifest = buildRecommendedManifest({ name: "cli", framework: "express", projectType: "cli-tool" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("design-commands");
    expect(skills).toContain("build-arg-parsing");
    expect(skills).toContain("configure-package-bin");
  });

  it("returns mobile skills", () => {
    const manifest = buildRecommendedManifest({ name: "app", framework: "react", projectType: "mobile" });
    const skills = getSkillsForType(manifest.project.type);
    expect(skills).toContain("build-screen-layout");
    expect(skills).toContain("build-navigation-stack");
    expect(skills).toContain("write-mobile-tests");
  });
});

describe("getAgentsForType", () => {
  it("returns dashboard agents", () => {
    const agents = getAgentsForType("dashboard");
    expect(agents).toContain("ui-builder");
    expect(agents).toContain("qa-reviewer");
  });

  it("returns library agents including docs-writer", () => {
    const agents = getAgentsForType("library");
    expect(agents).toContain("docs-writer");
    expect(agents).toContain("test-writer");
  });

  it("returns cli-tool agents including cli-designer", () => {
    const agents = getAgentsForType("cli-tool");
    expect(agents).toContain("cli-designer");
    expect(agents).toContain("test-writer");
  });
});
