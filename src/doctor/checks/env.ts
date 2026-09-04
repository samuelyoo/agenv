import type { Manifest } from "../../manifest/schema.js";
import { getPresetById } from "../../mcp/presets.js";
import type { DiagnosticFinding } from "../types.js";

export function runEnvChecks(manifest: Manifest | undefined): DiagnosticFinding[] {
  if (
    !manifest ||
    !manifest.generated.mcpPresets.some((id) => {
      const preset = getPresetById(id);
      return preset !== undefined && Object.keys(preset.env).length > 0;
    })
  ) {
    return [];
  }

  return [
    {
      severity: "info",
      code: "env_placeholders_expected",
      message: "MCP presets are configured. Generated output should include .env.example placeholders.",
      path: ".env.example",
    },
  ];
}
