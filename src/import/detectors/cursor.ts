import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { DetectorResult, ImportFinding } from "../index.js";

export async function detectCursor(cwd: string): Promise<DetectorResult> {
  const findings: ImportFinding[] = [];

  // Check .cursorrules first
  try {
    await stat(join(cwd, ".cursorrules"));
    findings.push({
      source: "cursor",
      path: ".cursorrules",
      field: "targets.cursor",
      confidence: "high",
      value: true,
    });
    return { findings, warnings: [], unsupported: [] };
  } catch {
    // Try .cursor/rules/ directory
  }

  try {
    await stat(join(cwd, ".cursor", "rules"));
    findings.push({
      source: "cursor",
      path: ".cursor/rules",
      field: "targets.cursor",
      confidence: "high",
      value: true,
    });
  } catch {
    // Not found
  }

  return { findings, warnings: [], unsupported: [] };
}
