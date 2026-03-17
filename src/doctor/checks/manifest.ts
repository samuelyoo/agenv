import type { Manifest } from "../../manifest/schema.js";
import type { DiagnosticFinding } from "../types.js";

export function runManifestChecks(
  manifest: Manifest | undefined,
  loadError?: unknown,
): DiagnosticFinding[] {
  if (loadError) {
    return [
      {
        severity: "error",
        code: "manifest_load_failed",
        message:
          loadError instanceof Error ? loadError.message : "Failed to load ai-workspace manifest.",
        path: "ai-workspace.json",
      },
    ];
  }

  if (!manifest) {
    return [
      {
        severity: "error",
        code: "manifest_missing",
        message: "No ai-workspace manifest was loaded.",
        path: "ai-workspace.json",
      },
    ];
  }

  return [
    {
      severity: "info",
      code: "manifest_loaded",
      message: "Manifest loaded successfully.",
      path: "ai-workspace.json",
    },
  ];
}
