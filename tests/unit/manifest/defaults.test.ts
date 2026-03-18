import { describe, expect, it } from "vitest";
import { buildRecommendedManifest, DEFAULT_SCHEMA_VERSION } from "../../../src/manifest/defaults.js";

describe("buildRecommendedManifest", () => {
  it("applies the recommended dashboard defaults", () => {
    const manifest = buildRecommendedManifest({
      name: "ops-dashboard",
      framework: "nextjs",
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
});
