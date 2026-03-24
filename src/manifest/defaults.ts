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

  if (projectType === "full-stack") {
    return [
      "Use TypeScript strict mode across both frontend and backend.",
      "Keep frontend and backend concerns clearly separated.",
      "Validate all API inputs at the boundary with Zod or equivalent.",
      "Handle loading, error, and empty states in UI components.",
    ];
  }

  if (projectType === "library") {
    return [
      "Use TypeScript strict mode.",
      "Design a minimal, stable public API surface.",
      "Export named types alongside runtime values.",
      "Avoid side-effects in module initialization.",
    ];
  }

  if (projectType === "cli-tool") {
    return [
      "Use TypeScript strict mode.",
      "Keep command handlers thin — delegate logic to services.",
      "Provide clear, actionable error messages to the user.",
      "Ensure all commands are testable without spawning a subprocess.",
    ];
  }

  if (projectType === "mobile") {
    return [
      "Use TypeScript strict mode.",
      "Keep screens focused — extract shared logic to hooks or services.",
      "Handle loading, empty, and error states in every screen.",
      "Test on both iOS and Android form factors.",
    ];
  }

  return [
    "Use TypeScript strict mode.",
    "Handle loading, empty, error, and success states explicitly.",
    "Prefer reusable components and shared patterns over one-off page code.",
  ];
}

export function buildRecommendedManifest(
  options: RecommendedManifestOptions,
): Manifest {
  const projectType = options.projectType ?? "web-app";

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
      : projectType === "web-app"
        ? {
            webApp: {
              styling: "tailwind",
              components: "shadcn-ui",
              stateManagement: "local-first",
              dataFetching: "tanstack-query",
              forms: "react-hook-form-zod",
              testing: ["vitest", "rtl"],
              auth: "none",
            },
          }
        : projectType === "full-stack"
          ? {
              fullStack: {
                styling: "tailwind",
                components: "shadcn-ui",
                apiStyle: "rest",
                orm: "prisma",
                auth: "none",
                testing: ["vitest", "rtl", "supertest"],
              },
            }
          : projectType === "library"
            ? {
                library: {
                  bundler: "tsup",
                  testing: ["vitest"],
                  docs: "typedoc",
                  publishTarget: "npm",
                },
              }
            : projectType === "cli-tool"
              ? {
                  cliTool: {
                    runtime: "node",
                    argParser: "commander",
                    testing: ["vitest"],
                    publishTarget: "npm",
                  },
                }
              : projectType === "mobile"
                ? {
                    mobile: {
                      framework: "expo",
                      styling: "nativewind",
                      navigation: "expo-router",
                      testing: ["jest", "rtl"],
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
      cursor: false,
      windsurf: false,
      ...options.targets,
    },
    ...projectTypeBlocks,
    conventions: {
      accessibility: projectType === "dashboard" || projectType === "web-app" || projectType === "full-stack" || projectType === "mobile",
      responsive: projectType === "dashboard" || projectType === "web-app" || projectType === "full-stack" || projectType === "mobile",
      authModel: projectType === "dashboard" ? "rbac" : "custom",
    },
    instructions: {
      codingStyle: buildCodingStyle(projectType),
      reviewRules:
        projectType === "api-service" || projectType === "cli-tool"
          ? [
              "Validate all request inputs at the handler level.",
              "Do not expose internal error details in responses.",
            ]
          : projectType === "library"
            ? [
                "Do not break the public API without a major version bump.",
                "Every public symbol must have a JSDoc comment.",
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
