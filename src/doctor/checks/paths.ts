import { access } from "node:fs/promises";
import { join } from "node:path";
import type { Manifest } from "../../manifest/schema.js";
import type { DiagnosticFinding } from "../types.js";

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runPathChecks(
  cwd: string,
  manifest: Manifest | undefined,
): Promise<DiagnosticFinding[]> {
  if (!manifest || manifest.setup.scope === "shared") {
    return [];
  }

  const localManifestPath = join(cwd, "ai-workspace.local.json");

  if (!(await exists(localManifestPath))) {
    return [
      {
        severity: "warning",
        code: "local_override_missing",
        message: "Local or mixed scope is selected but no ai-workspace.local.json file exists yet.",
        path: "ai-workspace.local.json",
      },
    ];
  }

  return [];
}
