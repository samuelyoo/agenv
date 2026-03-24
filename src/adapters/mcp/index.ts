import type { Manifest } from "../../manifest/schema.js";
import type { GenerationPlan, PlannedFile } from "../../planner/build-plan.js";
import { formatJson } from "../../utils/json.js";
import type { Adapter, RenderedFile, SupportResult } from "../types.js";
import { getPresetById, type McpPreset } from "../../mcp/presets.js";

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

function buildMcpServers(presets: McpPreset[]): Record<string, unknown> {
  const servers: Record<string, unknown> = {};
  for (const preset of presets) {
    const entry: Record<string, unknown> = {
      command: preset.command,
      args: preset.args,
      ...(Object.keys(preset.env).length > 0 ? { env: preset.env } : {}),
    };
    if (preset.trustLevel !== "safe") {
      entry._trustLevel = preset.trustLevel;
      entry._trustNote =
        preset.trustLevel === "dangerous"
          ? "This server can read/write the local filesystem or execute arbitrary actions. Review carefully before enabling."
          : "This server has access to external services or credentials. Review env vars and permissions before enabling.";
    }
    servers[preset.id] = entry;
  }
  return servers;
}

function render(file: PlannedFile, manifest: Manifest): RenderedFile {
  if (file.path === ".mcp.local.json") {
    return {
      path: file.path,
      trustSensitive: file.trustSensitive,
      content: formatJson({}),
    };
  }

  const resolvedPresets = manifest.generated.mcpPresets
    .map((id) => getPresetById(id))
    .filter((p): p is McpPreset => p !== undefined);

  return {
    path: file.path,
    trustSensitive: file.trustSensitive,
    content: formatJson({
      mcpServers: buildMcpServers(resolvedPresets),
    }),
  };
}

export const mcpAdapter: Adapter = {
  id: "mcp",
  supports,
  plan,
  render,
};
