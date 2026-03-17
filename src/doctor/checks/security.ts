import type { Manifest } from "../../manifest/schema.js";
import type { DiagnosticFinding } from "../types.js";

export function runSecurityChecks(manifest: Manifest | undefined): DiagnosticFinding[] {
  if (!manifest) {
    return [];
  }

  const findings: DiagnosticFinding[] = [];

  if (manifest.targets.mcp) {
    findings.push({
      severity: "warning",
      code: "mcp_review_required",
      message: "MCP configuration is enabled and should be reviewed for trust-sensitive commands.",
      path: ".mcp.json",
    });
  }

  return findings;
}
