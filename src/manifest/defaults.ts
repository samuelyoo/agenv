import {
  manifestSchema,
  type Framework,
  type Manifest,
  type ProjectType,
} from "./schema.js";

export const DEFAULT_SCHEMA_VERSION = "1";

export type RecommendedManifestOptions = {
  name: string;
  framework: Framework;
  projectType?: ProjectType | undefined;
  targets?: Partial<Manifest["targets"]> | undefined;
  setup?: Partial<Manifest["setup"]> | undefined;
  generated?: Partial<Manifest["generated"]> | undefined;
};

function buildCodingStyle(projectType: ProjectType): string[] {
  if (projectType === "web-app") {
    return [
      "Use TypeScript strict mode.",
      "Handle loading, empty, error, and success states explicitly.",
      "Prefer reusable page sections and shared UI patterns over one-off code.",
    ];
  }

  return [
    "Use TypeScript strict mode.",
    "Handle loading, empty, error, and success states explicitly.",
    "Prefer reusable dashboard sections over one-off page code.",
  ];
}

export function buildRecommendedManifest(
  options: RecommendedManifestOptions,
): Manifest {
  const projectType = options.projectType ?? "dashboard";

  return manifestSchema.parse({
    schemaVersion: DEFAULT_SCHEMA_VERSION,
    project: {
      name: options.name,
      type: projectType,
      framework: options.framework,
      language: "ts",
    },
    setup: {
      depth: "recommended",
      mode: "full",
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
      authModel: projectType === "dashboard" ? "rbac" : "custom",
    },
    instructions: {
      codingStyle: buildCodingStyle(projectType),
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
