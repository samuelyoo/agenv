import { runAuthPrompt } from "./sessions/auth.js";
import { runDataPrompt } from "./sessions/data.js";
import { runOutputPrompt } from "./sessions/output.js";
import { runProjectTypePrompt } from "./sessions/project-type.js";
import { runQualityPrompt } from "./sessions/quality.js";
import { runSetupDepthPrompt } from "./sessions/setup-depth.js";
import { runStackPrompt } from "./sessions/stack.js";
import { runToolsPrompt } from "./sessions/tools.js";
import { runToolingPrompt } from "./sessions/tooling.js";
import { runUiPrompt } from "./sessions/ui.js";
import type { UiAnswers } from "./sessions/ui.js";
import type { DataAnswers } from "./sessions/data.js";
import type { QualityAnswers } from "./sessions/quality.js";
import type { OutputAnswers } from "./sessions/output.js";

export type InitFlowAnswers = {
  targets: { copilot: boolean; claude: boolean; codex: boolean; mcp: boolean };
  projectType: "dashboard" | "web-app" | "api-service";
  setupDepth: "recommended" | "semi-custom" | "advanced";
  framework: "react" | "nextjs" | "vite-react" | "express" | "fastify" | "hono";
  ui: UiAnswers | undefined;
  data: DataAnswers | undefined;
  authModel: "rbac" | "none" | "custom";
  quality: QualityAnswers;
  mcpPresets: string[];
  output: OutputAnswers;
};

export async function runInitFlow(detectedFramework?: string): Promise<InitFlowAnswers> {
  console.log("\n🔧  agenv init — interactive setup\n");

  const targets = await runToolsPrompt();
  const projectType = await runProjectTypePrompt();
  const setupDepth = await runSetupDepthPrompt();
  const isApi = projectType === "api-service";

  if (setupDepth === "recommended") {
    return {
      targets,
      projectType,
      setupDepth,
      framework: isApi
        ? "express"
        : ((detectedFramework as "react" | "nextjs" | "vite-react") ?? "react"),
      ui: isApi ? undefined : { styling: "tailwind", components: "shadcn-ui", charts: "recharts", forms: "react-hook-form-zod", tables: "tanstack-table" },
      data: isApi ? undefined : { dataFetching: "tanstack-query", state: "local-first" },
      authModel: isApi ? "custom" : (projectType === "dashboard" ? "rbac" : "custom"),
      quality: { testing: isApi ? ["vitest"] : ["vitest", "rtl"], accessibility: !isApi, responsive: !isApi },
      mcpPresets: [],
      output: { mode: "full", scope: "mixed", prompts: "master" },
    };
  }

  const framework = await runStackPrompt(detectedFramework, projectType);

  // UI and data prompts only apply to frontend project types
  const ui = isApi ? undefined : await runUiPrompt();
  const data = isApi ? undefined : await runDataPrompt();

  const authModel = await runAuthPrompt();
  const quality = await runQualityPrompt();
  const mcpPresets = targets.mcp ? await runToolingPrompt() : [];

  let output: OutputAnswers = { mode: "full", scope: "mixed", prompts: "master" };
  if (setupDepth === "advanced") {
    output = await runOutputPrompt();
  }

  return { targets, projectType, setupDepth, framework, ui, data, authModel, quality, mcpPresets, output };
}
