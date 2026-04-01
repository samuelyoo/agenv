import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectWindsurf(cwd: string): Promise<DetectorResult> {
  const findings: ImportFinding[] = [];

  try {
    await stat(join(cwd, ".windsurfrules"));
    findings.push({
      source: "windsurf",
      path: ".windsurfrules",
      field: "targets.windsurf",
      confidence: "high",
      value: true,
    });
  } catch {
    // Not found
  }

  return { findings, warnings: [], unsupported: [] };
}
