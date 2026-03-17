import type { RepoInspection } from "../../detect/repo-inspector.js";
import type { Manifest } from "../../manifest/schema.js";
import type { DiagnosticFinding } from "../types.js";

export function runCompatibilityChecks(
  manifest: Manifest | undefined,
  inspection: RepoInspection,
): DiagnosticFinding[] {
  if (!manifest || !inspection.framework) {
    return [];
  }

  if (manifest.project.framework !== inspection.framework) {
    return [
      {
        severity: "warning",
        code: "framework_mismatch",
        message: `Manifest framework '${manifest.project.framework}' does not match detected repo framework '${inspection.framework}'.`,
      },
    ];
  }

  return [];
}
