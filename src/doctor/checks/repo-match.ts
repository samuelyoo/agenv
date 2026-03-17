import type { RepoInspection } from "../../detect/repo-inspector.js";
import type { Manifest } from "../../manifest/schema.js";
import type { DiagnosticFinding } from "../types.js";

export function runRepoMatchChecks(
  manifest: Manifest | undefined,
  inspection: RepoInspection,
): DiagnosticFinding[] {
  if (!manifest) {
    return [];
  }

  if (manifest.project.name !== inspection.projectName) {
    return [
      {
        severity: "warning",
        code: "project_name_mismatch",
        message: `Manifest project name '${manifest.project.name}' differs from repo name '${inspection.projectName}'.`,
      },
    ];
  }

  return [];
}
