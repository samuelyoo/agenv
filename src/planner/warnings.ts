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

  if (manifest.setup.scope === "shared" && manifest.targets.mcp) {
    warnings.push({
      severity: "warning",
      code: "shared_scope_with_mcp",
      message:
        "Shared-only scope with MCP may still require a local override file for machine-specific values.",
    });
  }

  return warnings;
}
