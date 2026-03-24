import { z } from "zod";

export const frameworkSchema = z.enum(["react", "nextjs", "vite-react", "express", "fastify", "hono"]);
export const projectTypeSchema = z.enum(["dashboard", "web-app", "api-service", "full-stack", "library", "cli-tool", "mobile"]);
export const setupDepthSchema = z.enum(["recommended", "semi-custom", "advanced"]);
export const setupModeSchema = z.enum(["base", "skills", "agents", "full"]);
export const setupScopeSchema = z.enum(["shared", "local", "mixed"]);
export const promptModeSchema = z.enum(["none", "starter", "master", "pack"]);

export const manifestSchema = z
  .object({
    schemaVersion: z.string(),
    project: z
      .object({
        name: z.string().min(1),
        type: projectTypeSchema,
        framework: frameworkSchema,
        language: z.literal("ts"),
      })
      .strict(),
    setup: z
      .object({
        depth: setupDepthSchema,
        mode: setupModeSchema,
        scope: setupScopeSchema,
      })
      .strict(),
    targets: z
      .object({
        copilot: z.boolean(),
        claude: z.boolean(),
        codex: z.boolean(),
        mcp: z.boolean(),
        cursor: z.boolean().optional(),
        windsurf: z.boolean().optional(),
      })
      .strict(),
    dashboard: z
      .object({
        styling: z.enum(["tailwind", "custom"]),
        components: z.enum(["shadcn-ui", "custom-design-system"]),
        dataFetching: z.enum(["tanstack-query", "custom"]),
        tables: z.enum(["tanstack-table", "ag-grid", "custom"]),
        charts: z.enum(["recharts", "echarts", "nivo", "custom"]),
        forms: z.enum(["react-hook-form-zod", "custom"]),
        testing: z.array(z.enum(["vitest", "rtl", "playwright"])).min(1),
        state: z.enum(["local-first", "zustand"]),
      })
      .strict()
      .optional(),
    apiService: z
      .object({
        apiStyle: z.enum(["rest", "graphql", "trpc"]),
        validation: z.enum(["zod", "typebox", "custom"]),
        orm: z.enum(["prisma", "drizzle", "none"]),
        testing: z.array(z.enum(["vitest", "supertest", "playwright"])).min(1),
        auth: z.enum(["jwt", "session", "none", "custom"]),
      })
      .strict()
      .optional(),
    webApp: z
      .object({
        styling: z.enum(["tailwind", "custom"]),
        components: z.enum(["shadcn-ui", "custom-design-system"]),
        stateManagement: z.enum(["local-first", "zustand", "redux", "custom"]),
        dataFetching: z.enum(["tanstack-query", "swr", "custom"]),
        forms: z.enum(["react-hook-form-zod", "custom"]),
        testing: z.array(z.enum(["vitest", "rtl", "playwright"])).min(1),
        auth: z.enum(["clerk", "next-auth", "jwt", "session", "none", "custom"]),
      })
      .strict()
      .optional(),
    fullStack: z
      .object({
        styling: z.enum(["tailwind", "custom"]),
        components: z.enum(["shadcn-ui", "custom-design-system"]),
        apiStyle: z.enum(["rest", "trpc", "graphql"]),
        orm: z.enum(["prisma", "drizzle", "none"]),
        auth: z.enum(["clerk", "next-auth", "jwt", "none", "custom"]),
        testing: z.array(z.enum(["vitest", "rtl", "playwright", "supertest"])).min(1),
      })
      .strict()
      .optional(),
    library: z
      .object({
        bundler: z.enum(["tsup", "vite-lib", "rollup", "custom"]),
        testing: z.array(z.enum(["vitest", "rtl"])).min(1),
        docs: z.enum(["typedoc", "storybook", "none"]),
        publishTarget: z.enum(["npm", "jsr", "private"]),
      })
      .strict()
      .optional(),
    cliTool: z
      .object({
        runtime: z.enum(["node", "bun", "deno"]),
        argParser: z.enum(["commander", "yargs", "citty", "custom"]),
        testing: z.array(z.enum(["vitest"])).min(1),
        publishTarget: z.enum(["npm", "jsr", "private"]),
      })
      .strict()
      .optional(),
    mobile: z
      .object({
        framework: z.enum(["expo", "react-native-cli"]),
        styling: z.enum(["nativewind", "stylesheet", "custom"]),
        navigation: z.enum(["expo-router", "react-navigation", "custom"]),
        testing: z.array(z.enum(["jest", "rtl"])).min(1),
      })
      .strict()
      .optional(),
    conventions: z
      .object({
        routing: z.string().optional(),
        folderStructure: z.string().optional(),
        accessibility: z.boolean(),
        responsive: z.boolean(),
        authModel: z.enum(["rbac", "none", "custom"]).optional(),
      })
      .strict(),
    instructions: z
      .object({
        codingStyle: z.array(z.string()).min(1),
        reviewRules: z.array(z.string()).min(1),
      })
      .strict(),
    generated: z
      .object({
        prompts: promptModeSchema,
        skills: z.boolean(),
        agents: z.boolean(),
        mcpPresets: z.array(z.string()),
      })
      .strict(),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const localOverrideSchema = z
  .object({
    setup: z
      .object({
        scope: setupScopeSchema.optional(),
      })
      .strict()
      .optional(),
    targets: z
      .object({
        mcp: z.boolean().optional(),
        cursor: z.boolean().optional(),
        windsurf: z.boolean().optional(),
      })
      .strict()
      .optional(),
    generated: z
      .object({
        prompts: promptModeSchema.optional(),
        mcpPresets: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type Manifest = z.infer<typeof manifestSchema>;
export type Framework = z.infer<typeof frameworkSchema>;
export type ProjectType = z.infer<typeof projectTypeSchema>;
export type SetupMode = z.infer<typeof setupModeSchema>;
export type SetupScope = z.infer<typeof setupScopeSchema>;
export type SetupDepth = z.infer<typeof setupDepthSchema>;
export type PromptMode = z.infer<typeof promptModeSchema>;
