import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectCopilot(cwd: string): Promise<DetectorResult> {
  const findings: ImportFinding[] = [];

  try {
    await stat(join(cwd, ".github", "copilot-instructions.md"));
    findings.push({
      source: "copilot",
      path: ".github/copilot-instructions.md",
      field: "targets.copilot",
      confidence: "high",
      value: true,
    });
  } catch {
    // Not found
  }

  return { findings, warnings: [], unsupported: [] };
}
