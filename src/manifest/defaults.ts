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

  if (projectType === "api-service") {
    return [
      "Use TypeScript strict mode.",
      "Validate all inputs at the boundary with Zod or equivalent.",
      "Return consistent error shapes with proper HTTP status codes.",
      "Prefer thin controllers that delegate to service functions.",
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

  const projectTypeBlocks =
    projectType === "api-service"
      ? {
          apiService: {
            apiStyle: "rest",
            validation: "zod",
            orm: "prisma",
            testing: ["vitest", "supertest"],
            auth: "jwt",
          },
        }
      : {
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
        };

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
    ...projectTypeBlocks,
    conventions: {
      accessibility: projectType !== "api-service",
      responsive: projectType !== "api-service",
      authModel: projectType === "dashboard" ? "rbac" : "custom",
    },
    instructions: {
      codingStyle: buildCodingStyle(projectType),
      reviewRules:
        projectType === "api-service"
          ? [
              "Validate all request inputs at the handler level.",
              "Do not expose internal error details in API responses.",
            ]
          : [
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
