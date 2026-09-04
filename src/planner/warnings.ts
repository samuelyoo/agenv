import type { Manifest } from "../manifest/schema.js";

export type WarningMessage = {
  severity: "warning";
  code: string;
  message: string;
};

export function buildWarnings(manifest: Manifest): WarningMessage[] {
  const warnings: WarningMessage[] = [];

  if (manifest.generated.agents && !manifest.generated.skills) {
    warnings.push({
      severity: "warning",
      code: "agents_without_skills",
      message:
        "Agent templates are enabled without shared skills. Some target docs may feel incomplete until shared skills are enabled too.",
    });
  }

  if (manifest.targets.mcp) {
    warnings.push({
      severity: "warning",
      code: "mcp_is_trust_sensitive",
      message:
        "MCP output is trust-sensitive and should use environment placeholders instead of real secrets.",
    });
  }

  if (
    manifest.targets.mcp &&
    !manifest.targets.claude &&
    !manifest.targets.codex &&
    !manifest.targets.copilot &&
    manifest.targets.cursor !== true
  ) {
    warnings.push({
      severity: "warning",
      code: "mcp_no_project_scoped_host",
      message:
        "MCP is enabled, but none of the selected targets has a generated project-scoped MCP format.",
    });
  }

  if (manifest.targets.mcp && manifest.targets.windsurf === true) {
    warnings.push({
      severity: "warning",
      code: "windsurf_mcp_requires_user_install",
      message:
        "Windsurf MCP configuration is user-scoped, so agenv does not write it into the repository. Install the selected servers through Windsurf settings.",
    });
  }

  return warnings;
}
