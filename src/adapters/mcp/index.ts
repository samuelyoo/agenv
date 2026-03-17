import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import { formatJson } from "../../utils/json.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";

function supports(manifest: Manifest): SupportResult {
  return {
    supported: manifest.targets.mcp,
    issues: manifest.targets.mcp
      ? [
          {
            severity: "warning",
            code: "mcp_requires_review",
            message: "MCP configs are trust-sensitive and should be reviewed before use.",
          },
        ]
      : [
          {
            severity: "warning",
            code: "mcp_target_disabled",
            message: "MCP output is disabled in the manifest targets.",
          },
        ],
  };
}

function plan(_manifest: Manifest, generationPlan: GenerationPlan): PlannedFile[] {
  return generationPlan.files.filter((file) => file.target === "mcp");
}

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  return {
    path: file.path,
    trustSensitive: file.trustSensitive,
    content: formatJson({
      generatedBy: "agenv",
      project: manifest.project.name,
      presets: manifest.generated.mcpPresets,
      env: {
        EXAMPLE_API_KEY: "${EXAMPLE_API_KEY}",
      },
    }),
  };
}

export const mcpAdapter: Adapter = {
  id: "mcp",
  supports,
  plan,
  render,
};
