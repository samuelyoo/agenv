import { manifestSchema, type Framework, type Manifest } from "./schema.js";

export const DEFAULT_SCHEMA_VERSION = "1";

export type RecommendedManifestOptions = {
  name: string;
  framework: Framework;
  targets?: Partial<Manifest["targets"]> | undefined;
  setup?: Partial<Manifest["setup"]> | undefined;
  generated?: Partial<Manifest["generated"]> | undefined;
};

export function buildRecommendedManifest(
  options: RecommendedManifestOptions,
): Manifest {
  return manifestSchema.parse({
    schemaVersion: DEFAULT_SCHEMA_VERSION,
    project: {
      name: options.name,
      type: "dashboard",
      framework: options.framework,
      language: "ts",
    },
    setup: {
      depth: "recommended",
      mode: "base",
      scope: "mixed",
      ...options.setup,
    },
    targets: {
      copilot: true,
      claude: true,
      codex: true,
      mcp: false,
      ...options.targets,
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
      codingStyle: [
        "Use TypeScript strict mode.",
        "Handle loading, empty, error, and success states explicitly.",
        "Prefer reusable dashboard sections over one-off page code.",
      ],
      reviewRules: [
        "Prefer existing design-system components first.",
        "Do not introduce new UI libraries without approval.",
      ],
    },
    generated: {
      prompts: "master",
      skills: false,
      agents: false,
      mcpPresets: [],
      ...options.generated,
    },
  });
}
