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
import type { ProjectType } from "../../manifest/schema.js";

export type InitFlowAnswers = {
  targets: { copilot: boolean; claude: boolean; codex: boolean; mcp: boolean; cursor: boolean; windsurf: boolean };
  projectType: ProjectType;
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
  const isNonUi = projectType === "api-service" || projectType === "library" || projectType === "cli-tool";

  if (setupDepth === "recommended") {
    return {
      targets,
      projectType,
      setupDepth,
      framework: isNonUi
        ? "express"
        : ((detectedFramework as "react" | "nextjs" | "vite-react") ?? "react"),
      ui: isNonUi ? undefined : { styling: "tailwind", components: "shadcn-ui", charts: "recharts", forms: "react-hook-form-zod", tables: "tanstack-table" },
      data: isNonUi ? undefined : { dataFetching: "tanstack-query", state: "local-first" },
      authModel: projectType === "dashboard" ? "rbac" : "custom",
      quality: { testing: isNonUi ? ["vitest"] : ["vitest", "rtl"], accessibility: !isNonUi, responsive: !isNonUi },
      mcpPresets: [],
      output: { mode: "full", scope: "mixed", prompts: "master" },
    };
  }

  const framework = await runStackPrompt(detectedFramework, projectType);

  // UI and data prompts only apply to frontend project types
  const ui = isNonUi ? undefined : await runUiPrompt();
  const data = isNonUi ? undefined : await runDataPrompt();

  const authModel = await runAuthPrompt();
  const quality = await runQualityPrompt();
  const mcpPresets = targets.mcp ? await runToolingPrompt() : [];

  let output: OutputAnswers = { mode: "full", scope: "mixed", prompts: "master" };
  if (setupDepth === "advanced") {
    output = await runOutputPrompt();
  }

  return { targets, projectType, setupDepth, framework, ui, data, authModel, quality, mcpPresets, output };
}
