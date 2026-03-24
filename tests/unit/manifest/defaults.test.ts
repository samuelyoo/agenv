import { describe, expect, it } from "vitest";
import { buildRecommendedManifest, DEFAULT_SCHEMA_VERSION } from "../../../src/manifest/defaults.js";

describe("buildRecommendedManifest", () => {
  it("applies the recommended dashboard defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "nextjs",
      projectType: "dashboard",
    });

    expect(manifest.schemaVersion).toBe(DEFAULT_SCHEMA_VERSION);
    expect(manifest.project).toEqual({
      name: "ops-dashboard",
      type: "dashboard",
      framework: "nextjs",
      language: "ts",
    });
    expect(manifest.targets).toEqual({
      copilot: true,
      claude: true,
      codex: true,
      mcp: false,
      cursor: false,
      windsurf: false,
    });
    expect(manifest.setup).toEqual({
      depth: "recommended",
      mode: "full",
      scope: "mixed",
    });
    expect(manifest.generated).toEqual({
      prompts: "master",
      skills: false,
      agents: false,
      mcpPresets: [],
    });
  });

  it("allows targeted overrides on top of defaults", () => {
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

    expect(manifest.targets.mcp).toBe(true);
    expect(manifest.setup.mode).toBe("full");
    expect(manifest.generated).toEqual({
      prompts: "pack",
      skills: true,
      agents: true,
      mcpPresets: ["filesystem"],
    });
  });

  it("supports a web-app project type with generic defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "marketing-site",
      framework: "react",
      projectType: "web-app",
    });

    expect(manifest.project.type).toBe("web-app");
    expect(manifest.conventions.authModel).toBe("custom");
    expect(manifest.instructions.codingStyle).toContain(
      "Prefer reusable page sections and shared UI patterns over one-off code.",
    );
  });

  it("supports an api-service project type with backend defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "payments-api",
      framework: "express",
      projectType: "api-service",
    });

    expect(manifest.project.type).toBe("api-service");
    expect(manifest.project.framework).toBe("express");
    expect(manifest.dashboard).toBeUndefined();
    expect(manifest.apiService).toBeDefined();
    expect(manifest.apiService?.apiStyle).toBe("rest");
    expect(manifest.apiService?.validation).toBe("zod");
    expect(manifest.apiService?.orm).toBe("prisma");
    expect(manifest.conventions.accessibility).toBe(false);
    expect(manifest.conventions.responsive).toBe(false);
    expect(manifest.instructions.codingStyle).toContain(
      "Validate all inputs at the boundary with Zod or equivalent.",
    );
  });

  it("supports a full-stack project type with combined defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "my-saas",
      framework: "nextjs",
      projectType: "full-stack",
    });

    expect(manifest.project.type).toBe("full-stack");
    expect(manifest.fullStack).toBeDefined();
    expect(manifest.fullStack?.apiStyle).toBe("rest");
    expect(manifest.fullStack?.orm).toBe("prisma");
    expect(manifest.conventions.accessibility).toBe(true);
    expect(manifest.conventions.responsive).toBe(true);
  });

  it("supports a library project type with library defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "my-ui-lib",
      framework: "react",
      projectType: "library",
    });

    expect(manifest.project.type).toBe("library");
    expect(manifest.library).toBeDefined();
    expect(manifest.library?.bundler).toBe("tsup");
    expect(manifest.library?.publishTarget).toBe("npm");
    expect(manifest.conventions.accessibility).toBe(false);
    expect(manifest.conventions.responsive).toBe(false);
  });

  it("supports a cli-tool project type with CLI defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "my-cli",
      framework: "express",
      projectType: "cli-tool",
    });

    expect(manifest.project.type).toBe("cli-tool");
    expect(manifest.cliTool).toBeDefined();
    expect(manifest.cliTool?.runtime).toBe("node");
    expect(manifest.cliTool?.argParser).toBe("commander");
    expect(manifest.cliTool?.publishTarget).toBe("npm");
    expect(manifest.conventions.accessibility).toBe(false);
    expect(manifest.conventions.responsive).toBe(false);
  });

  it("supports a mobile project type with mobile defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "my-app",
      framework: "react",
      projectType: "mobile",
    });

    expect(manifest.project.type).toBe("mobile");
    expect(manifest.mobile).toBeDefined();
    expect(manifest.mobile?.framework).toBe("expo");
    expect(manifest.mobile?.navigation).toBe("expo-router");
    expect(manifest.conventions.accessibility).toBe(true);
    expect(manifest.conventions.responsive).toBe(true);
  });

  it("includes cursor and windsurf as false in default targets", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "nextjs",
      projectType: "dashboard",
    });

    expect(manifest.targets.cursor).toBe(false);
    expect(manifest.targets.windsurf).toBe(false);
  });
});
