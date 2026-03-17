import { describe, expect, it } from "vitest";
import { normalizeManifest } from "../../../src/manifest/normalize.js";

describe("normalizeManifest", () => {
  it("merges shared input on top of recommended defaults", () => {
    const manifest = normalizeManifest(
      {
        project: {
          name: "custom-dashboard",
          type: "dashboard",
          framework: "nextjs",
          language: "ts",
        },
        setup: {
          depth: "semi-custom",
          mode: "agents",
          scope: "mixed",
        },
        targets: {
          copilot: false,
          claude: true,
          codex: true,
          mcp: true,
        },
        dashboard: {
          styling: "custom",
          components: "custom-design-system",
          dataFetching: "custom",
          tables: "ag-grid",
          charts: "echarts",
          forms: "custom",
          testing: ["playwright"],
          state: "zustand",
        },
        conventions: {
          accessibility: true,
          responsive: true,
          authModel: "custom",
        },
        instructions: {
          codingStyle: ["Use strict typing."],
          reviewRules: ["Do not bypass auth checks."],
        },
        generated: {
          prompts: "starter",
          skills: true,
          agents: false,
          mcpPresets: [],
        },
      },
      {
        projectName: "fallback-name",
        framework: "react",
      },
    );

    expect(manifest.project.name).toBe("custom-dashboard");
    expect(manifest.project.framework).toBe("nextjs");
    expect(manifest.dashboard.tables).toBe("ag-grid");
    expect(manifest.instructions.codingStyle).toEqual(["Use strict typing."]);
  });

  it("applies local overrides only in allowed areas and replaces arrays", () => {
    const manifest = normalizeManifest(
      {
        project: {
          name: "ops-dashboard",
          type: "dashboard",
          framework: "react",
          language: "ts",
        },
        setup: {
          depth: "recommended",
          mode: "base",
          scope: "shared",
        },
        targets: {
          copilot: true,
          claude: true,
          codex: true,
          mcp: false,
        },
        dashboard: {
          styling: "tailwind",
          components: "shadcn-ui",
          dataFetching: "tanstack-query",
          tables: "tanstack-table",
          charts: "recharts",
          forms: "react-hook-form-zod",
          testing: ["vitest", "rtl"],
          state: "local-first",
        },
        conventions: {
          accessibility: true,
          responsive: true,
          authModel: "rbac",
        },
        instructions: {
          codingStyle: ["Rule A"],
          reviewRules: ["Rule B"],
        },
        generated: {
          prompts: "master",
          skills: false,
          agents: false,
          mcpPresets: [],
        },
      },
      {
        projectName: "ops-dashboard",
        framework: "react",
        localOverride: {
          setup: {
            scope: "mixed",
          },
          targets: {
            mcp: true,
          },
          generated: {
            prompts: "none",
            mcpPresets: ["filesystem-local"],
          },
        },
      },
    );

    expect(manifest.setup.scope).toBe("mixed");
    expect(manifest.targets.mcp).toBe(true);
    expect(manifest.generated.prompts).toBe("none");
    expect(manifest.generated.mcpPresets).toEqual(["filesystem-local"]);
    expect(manifest.project.name).toBe("ops-dashboard");
  });

  it("rejects local overrides outside the allowed schema", () => {
    expect(() =>
      normalizeManifest(
        {
          project: {
            name: "ops-dashboard",
            type: "dashboard",
            framework: "react",
            language: "ts",
          },
          setup: {
            depth: "recommended",
            mode: "base",
            scope: "shared",
          },
          targets: {
            copilot: true,
            claude: true,
            codex: true,
            mcp: false,
          },
          dashboard: {
            styling: "tailwind",
            components: "shadcn-ui",
            dataFetching: "tanstack-query",
            tables: "tanstack-table",
            charts: "recharts",
            forms: "react-hook-form-zod",
            testing: ["vitest"],
            state: "local-first",
          },
          conventions: {
            accessibility: true,
            responsive: true,
            authModel: "rbac",
          },
          instructions: {
            codingStyle: ["Rule A"],
            reviewRules: ["Rule B"],
          },
          generated: {
            prompts: "master",
            skills: false,
            agents: false,
            mcpPresets: [],
          },
        },
        {
          projectName: "ops-dashboard",
          framework: "react",
          localOverride: {
            project: {
              name: "forbidden",
            },
          },
        },
      ),
    ).toThrow();
  });
});
