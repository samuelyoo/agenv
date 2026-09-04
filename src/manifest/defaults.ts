import {
  manifestSchema,
  type Framework,
  type Language,
  type Manifest,
  type ProjectType,
} from "./schema.js";

export const DEFAULT_SCHEMA_VERSION = "2";

export type RecommendedManifestOptions = {
  name: string;
  framework: Framework;
  language?: Language | undefined;
  projectType?: ProjectType | undefined;
  targets?: Partial<Manifest["targets"]> | undefined;
  setup?: Partial<Manifest["setup"]> | undefined;
  generated?: Partial<Manifest["generated"]> | undefined;
};

const BACKEND_FRAMEWORKS: Framework[] = [
  "express",
  "fastify",
  "hono",
  "koa",
  "django",
  "flask",
  "fastapi",
  "gin",
  "echo",
  "actix",
  "axum",
  "spring",
  "rails",
];

export function inferLanguageForFramework(framework: Framework): Language {
  if (["django", "flask", "fastapi"].includes(framework)) return "python";
  if (["gin", "echo"].includes(framework)) return "go";
  if (["actix", "axum"].includes(framework)) return "rust";
  if (framework === "spring") return "java";
  if (framework === "rails") return "ruby";
  if (framework === "none") return "other";
  return "ts";
}

export function inferProjectTypeForFramework(framework: Framework): ProjectType {
  if (BACKEND_FRAMEWORKS.includes(framework)) return "api-service";
  if (framework === "none") return "library";
  return "web-app";
}

function apiTestingDefaults(
  language: Language,
): NonNullable<Manifest["apiService"]>["testing"] {
  const values: Record<Language, NonNullable<Manifest["apiService"]>["testing"]> = {
    ts: ["vitest", "supertest"],
    python: ["pytest"],
    go: ["go-test"],
    rust: ["cargo-test"],
    java: ["junit"],
    ruby: ["rspec"],
    other: ["custom"],
  };
  return values[language];
}

function languageStyle(language: Language): string {
  switch (language) {
    case "ts":
      return "Use TypeScript strict mode.";
    case "python":
      return "Use Python type hints on public APIs and follow the configured formatter and linter.";
    case "go":
      return "Keep Go code formatted with gofmt and return errors explicitly.";
    case "rust":
      return "Keep Rust code formatted with rustfmt and address clippy findings.";
    case "java":
      return "Follow the configured Java formatter, language level, and static analysis.";
    case "ruby":
      return "Follow the configured Ruby version and project linting conventions.";
    case "other":
      return "Follow the repository's established language, formatter, and linting conventions.";
  }
}

function buildCodingStyle(projectType: ProjectType, language: Language): string[] {
  const primaryLanguageRule = languageStyle(language);

  if (projectType === "web-app") {
    return [
      primaryLanguageRule,
      "Handle loading, empty, error, and success states explicitly.",
      "Prefer reusable page sections and shared UI patterns over one-off code.",
    ];
  }

  if (projectType === "api-service") {
    return [
      primaryLanguageRule,
      "Validate all inputs with the project's schema-validation library at the boundary.",
      "Return consistent error shapes with proper HTTP status codes.",
      "Prefer thin controllers that delegate to service functions.",
    ];
  }

  if (projectType === "full-stack") {
    return [
      primaryLanguageRule,
      "Keep frontend and backend concerns clearly separated.",
      "Validate all API inputs with the project's schema-validation library at the boundary.",
      "Handle loading, error, and empty states in UI components.",
    ];
  }

  if (projectType === "library") {
    return [
      primaryLanguageRule,
      "Design a minimal, stable public API surface.",
      "Publish explicit public types and keep internal implementation details private.",
      "Avoid side-effects in module initialization.",
    ];
  }

  if (projectType === "cli-tool") {
    return [
      primaryLanguageRule,
      "Keep command handlers thin — delegate logic to services.",
      "Provide clear, actionable error messages to the user.",
      "Ensure all commands are testable without spawning a subprocess.",
    ];
  }

  if (projectType === "mobile") {
    return [
      primaryLanguageRule,
      "Keep screens focused — extract shared logic to hooks or services.",
      "Handle loading, empty, and error states in every screen.",
      "Test on both iOS and Android form factors.",
    ];
  }

  return [
    primaryLanguageRule,
    "Handle loading, empty, error, and success states explicitly.",
    "Prefer reusable components and shared patterns over one-off page code.",
  ];
}

export function buildRecommendedManifest(
  options: RecommendedManifestOptions,
): Manifest {
  const projectType = options.projectType ?? inferProjectTypeForFramework(options.framework);
  const language = options.language ?? inferLanguageForFramework(options.framework);

  const projectTypeBlocks =
    projectType === "api-service"
      ? {
          apiService: {
            apiStyle: "rest",
            validation: language === "ts" ? "zod" : "custom",
            orm: language === "ts" ? "prisma" : "none",
            testing: apiTestingDefaults(language),
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
      language: language,
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
      codingStyle: buildCodingStyle(projectType, language),
      reviewRules:
        projectType === "api-service"
          ? [
              "Validate all request inputs at the handler level.",
              "Do not expose internal error details in responses.",
            ]
          : projectType === "cli-tool"
            ? [
                "Keep command output stable and script-friendly.",
                "Return actionable errors and meaningful exit codes.",
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
    packs: [],
  });
}
